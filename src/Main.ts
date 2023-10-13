/**
 * game的主脚本
 */
import Box = Laya.Box;
import Event = Laya.Event;
import Sprite = Laya.Sprite;
import Stage = Laya.Stage;

const {regClass, property} = Laya;

@regClass()
export class Main extends Laya.Script {
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
	
	constructor() {
		super()
	}
	
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
	private handleAdaptive(): void {
		console.log(Laya.stage, '====================================')
		Laya.stage.screenMode = Stage.SCREEN_VERTICAL;
		Laya.stage.designWidth = Laya.stage.width;
		Laya.stage.designHeight = Laya.stage.height;
		Laya.stage.on(Event.RESIZE, this, ()=>{
			console.log(Laya.stage, '9999999999999999999999999999999999999999999')
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
		
		// todo 临时画一下主舞台宽高
		// let sp: Sprite = new Sprite()
		// sp.graphics.drawRect(0, 0, Laya.stage.designWidth, Laya.stage.designHeight, "#ddd", 3);
		// this.owner.addChild(sp)
	}
	
	/**
	 * 代码动态设置主舞台属性
	 * todo 没有在IDE找到设置背景图的地方，有没有代码设置背景图的api，此处直接增加一个 子节点图片解决
	 */
	handleStageSetting(): void{
		let sp2:Sprite = new Sprite();
		sp2.loadImage( "resources/apes/background.png");
		sp2.width = Laya.stage.width;
		sp2.height = Laya.stage.height;
		Laya.stage.on(Event.RESIZE, this, ()=>{
			console.log(Laya.stage, '9999999999999999999999999999999999999999999')
			sp2.width = Laya.stage.width;
			sp2.height = Laya.stage.height;
		})
		this.owner.addChild(sp2)
	}
	
	/**
	 * 从对象池创建飞机
	 * @private
	 */
	private createAirplane(): void {
		let airplane: Laya.Sprite = Laya.Pool.getItemByCreateFun("Airplane", this.airplane.create, this.airplane);
		/** 飞机初始位置在舞台底部中间 */
		airplane.pos((Laya.stage.designWidth - airplane.width) / 2, Laya.stage.designHeight - airplane.height - 100);
		this._x = (Laya.stage.designWidth - airplane.width) / 2;
		this._y = Laya.stage.designHeight - airplane.height - 100;
		/** 飞机绑定鼠标/键盘事件，一般游戏以键盘为主 */
		// airplane.on(Event.MOUSE_MOVE, this, (e: Event) => this.onAirplaneClick(e, airplane))
		// airplane.on(Event.MOUSE_MOVE, this, this.onAirplaneMove)
		// todo 暂时没设置游戏盒子区域，直接用父类 owner 代替，后面搞一个游戏盒子区域
		this.owner.addChild(airplane)
		Laya.stage.on(Event.KEY_DOWN, this, (e: Event) => this.onAirplaneStartMove(e, airplane));
	}
	
	/**
	 * 从对象池创建飞机的子弹
	 * @private
	 */
	private createBullet(): void {
		let bullet: Laya.Sprite = Laya.Pool.getItemByCreateFun("Bullet", this.bullet.create, this.bullet);
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
	private createMonster(): void {
		let monster: Laya.Sprite = Laya.Pool.getItemByCreateFun("Monster", this.monster.create, this.monster);
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
		if (now - this.startTime > this.createBulletInterval) {
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
	private onAirplaneStartMove(e: any = null, airplane: Laya.Sprite = null): void {
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
		console.log("Game start");
		/** 创建玩家飞机 */
		this.createAirplane();
	}
	
	/**
	 * 游戏结束
	 */
	private stopGame(): void{
	
	}
}
