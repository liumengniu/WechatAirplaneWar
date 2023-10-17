/**
 * game的主脚本
 */
import Event = Laya.Event;
import Sprite = Laya.Sprite;
import Stage = Laya.Stage;
import Dialog = Laya.Dialog;
import Text = Laya.Text;
import Image = Laya.Image;
import Label = Laya.Label;

const {regClass, property} = Laya;

@regClass()
export default class Main extends Laya.Script {
	/**
	 * 玩家飞机预制体
	 * @private
	 */
	@property({type: Laya.Prefab})
	private airplane: Laya.Prefab;
	/**
	 * 子弹预制体
	 * @private
	 */
	@property({type: Laya.Prefab})
	private bullet: Laya.Prefab;
	/**
	 * 敌机预制体
	 * @private
	 */
	@property({type: Laya.Prefab})
	private monster: Laya.Prefab;
	/** 开始时间 **/
	private startTime: number = 0;
	/** 飞机每隔 2000ms 发射一颗子弹 */
	private createBulletInterval: number = 1000;
	/** 飞机每隔 2000ms 发射一颗子弹 */
	private createMonsterInterval: number = 2000;
	/** 飞机位置 x **/
	private _x: number = 0;
	/** 飞机位置 y **/
	private _y: number = 0;
	/**是否停止每帧更新 */
	private updateStop: boolean = false;
	/** 是否已经开始游戏 */
	private _started: boolean = false;
	/** 失败提示框 **/
	private _dig: Dialog = null;
	/** 游戏得分 */
	private score: number = 1;
	private _scoreLb: Label;
	
	constructor() {
		super()
	}
	
	/**
	 * 场景启动
	 */
	onAwake(): void {
		// 启动物理检测
		// Laya.PhysicsDebugDraw.enable()
		/** todo 屏幕适配(待彻底完善) **/
		this.handleAdaptive();
		/** 设置舞台属性 **/
		this.handleStageSetting()
	}
	
	/**
	 * 屏幕自适应
	 * @private
	 */
	handleAdaptive(): void {
		Laya.stage.screenMode = Stage.SCREEN_VERTICAL;
		Laya.stage.designWidth = Laya.stage.width;
		Laya.stage.designHeight = Laya.stage.height;
		Laya.stage.on(Event.RESIZE, this, () => {
			Laya.stage.designWidth = Laya.stage.width;
			Laya.stage.designHeight = Laya.stage.height;
		})
	}
	
	onEnable(): void {
		let prefabArr: Array<string> = [
			"resources/prefab/Airplane.lh",
			"resources/prefab/Bullet.lh",
		]
		Laya.loader.load(prefabArr).then((prefabList) => {
			//帧听舞台事件，当失去焦点后，停止每帧更新
			Laya.stage.on(Laya.Event.BLUR, this, () => {
				this.updateStop = true
			});
			//当恢复鼠标焦点后，恢复每帧更新
			Laya.stage.on(Laya.Event.FOCUS, this, () => {
				this.updateStop = false
			});
		})
	}
	
	/**
	 * 代码动态设置主舞台属性
	 * todo 没有在IDE找到设置背景图的地方，有没有代码设置背景图的api，此处直接loadImage节点图片解决
	 */
	handleStageSetting(): void {
		// 游戏主舞台添加背景图
		Laya.stage.loadImage("resources/apes/background.png");
		// 添加计分器
		this._scoreLb = new Label();
		this._scoreLb.pos(120, 50);
		this._scoreLb.font = "Gabriola";
		this._scoreLb.fontSize = 76;
		this._scoreLb.text = this.score.toString();
		this._scoreLb.color = "#333";
		let _scoreIcon = new Image("resources/apes/scoreLb.png");
		_scoreIcon.pos(50, 66);
		this.owner.addChild(_scoreIcon);
		this.owner.addChild(this._scoreLb);
	}
	
	/**
	 * 分数增加
	 */
	addScore(score: number = 1): void {
		this.score += score;
		this._scoreLb.text = this.score.toString();
	}
	
	/**
	 * 从对象池创建飞机
	 * @private
	 */
	createAirplane(): void {
		let airplane: Laya.Sprite = Laya.Pool.getItemByCreateFun("airplane", this.airplane.create, this.airplane);
		let airplaneBody = airplane.addComponent(Laya.RigidBody);
		airplaneBody.gravityScale = 0;
		airplane.addComponent(Laya.BoxCollider);
		/** 飞机初始位置在舞台底部中间 */
		airplane.pos((Laya.stage.designWidth - airplane.width) / 2, Laya.stage.designHeight - airplane.height - 100);
		this._x = (Laya.stage.designWidth - airplane.width) / 2;
		this._y = Laya.stage.designHeight - airplane.height - 100;
		// todo 暂时没设置游戏盒子区域，直接用父类 owner 代替，后面搞一个游戏盒子区域
		this.owner.addChild(airplane)
		Laya.stage.on(Event.KEY_DOWN, this, (e: Event) => this.onAirplaneStartMove(e, airplane));
	}
	
	/**
	 * 从对象池创建飞机的子弹
	 * @private
	 */
	createBullet(): void {
		let bullet: Laya.Sprite = Laya.Pool.getItemByCreateFun("bullet", this.bullet.create, this.bullet);
		let bulletBody = bullet.addComponent(Laya.RigidBody);
		bulletBody.gravityScale = 0;
		bullet.addComponent(Laya.BoxCollider);
		// 飞机的预制体尺寸为 102*126
		bullet.pos(this._x + 102 / 2, this._y);
		this.owner.addChild(bullet);
	}
	
	/**
	 * 创建怪物
	 */
	createMonster(): void {
		let monster: Laya.Sprite = Laya.Pool.getItemByCreateFun("monster", this.monster.create, this.monster);
		let monsterBody = monster.addComponent(Laya.RigidBody);
		monster.addComponent(Laya.BoxCollider);
		monster.pos(Math.random() * (Laya.stage.designWidth - 100), -100);
		this.owner.addChild(monster);
	}
	
	/**
	 * 每帧更新
	 */
	onUpdate(): void {
		//避免由于切到后台后还在更新，而导致切出后台后，同时出现大量盒子
		if (this.updateStop) {
			return;
		}
		let now = Date.now();
		if (now - this.startTime > this.createBulletInterval && this._started) {
			this.startTime = now;
			/** 创建子弹 **/
			this.createBullet();
			/** 创建怪物飞机 */
			this.createMonster();
		}
	}
	
	/**
	 * 拖动飞机（鼠标）
	 * @private
	 */
	onAirplaneStartMove(e: any = null, airplane: Laya.Sprite = null): void {
		switch (e.keyCode) {
			case 87:   //W 键
				this._y = airplane.y = airplane.y > 20 ? airplane.y - 20 : airplane.y;
				break;
			case 83:   //S 键
				this._y = airplane.y = airplane.y + airplane.height < Laya.stage.designHeight ? airplane.y + 20 : airplane.y;
				break;
			case 68:   //D 键
				this._x = airplane.x = airplane.x + airplane.width < Laya.stage.designWidth ? airplane.x + 20 : airplane.x;
				break;
			case 65:   //A 键
				this._x = airplane.x = airplane.x > 20 ? airplane.x - 20 : airplane.x;
				break;
		}
	}
	
	/**
	 * 游戏开始
	 */
	onStart() {
		this._started = true;
		this.createAirplane();
	}
	
	/**开始游戏，通过激活本脚本方式开始游戏*/
	startGame(): void {
		if (!this._started) {
			this._dig.destroy();
			this._dig = null;
			this._started = true;
			this.enabled = true;
			this.handleStageSetting();
			this.createAirplane();
		}
	}
	
	/**
	 * 游戏结束
	 */
	stopGame(): void {
		this._started = false;
		this.score = 0;
		this.enabled = false;
		this.createFailedBox();
		this.owner.removeChildren()
	}
	
	/**
	 * 游戏失败UI绘制
	 * @private
	 */
	private createFailedBox(): void {
		let txt: Text = new Text();
		txt.align = "center";
		txt.text = "游戏失败,点击文字重新开始";
		txt.font = "Microsoft YaHei";
		txt.fontSize = 40;
		txt.color = "#333";
		txt.bold = true;
		txt.on(Event.CLICK, this, this.startGame)
		if (!this._dig) {
			this._dig = new Dialog()
			this._dig.addChild(txt);
			this._dig.show(true);
		}
	}
}
