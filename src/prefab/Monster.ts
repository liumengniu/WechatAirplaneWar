import Event = Laya.Event;
import Image = Laya.Image;
import Animation = Laya.Animation;
import MainRT from "../MainRT";

const {regClass, property} = Laya;

@regClass()
export class Monster extends Laya.Script {
	private monsterAtlas: string = "resources/animation/monster_one.atlas";
	private airplaneAtlas: string = "resources/animation/airplane.atlas";
	private monster_one: string = "resources/apes/monster1.png";
	private monster_two: string = "resources/apes/monster2.png";
	
	constructor() {
		super()
	}
	
	onEnable(): void {
		let ran: number = Math.random();
		let bc: Laya.BoxCollider = this.owner.getComponent(Laya.BoxCollider);
		bc.label = "monster";
		bc.width = ran > 0.5 ? 57 : 69;
		bc.height = ran > 0.5 ? 43 : 99;
		let img: any = this.owner.getChildByName("image");
		img.skin = ran > 0.5 ? this.monster_one : this.monster_two;
	}
	
	/**
	 * 敌机碰撞检测（被子弹击中/撞到了玩家飞机）
	 * @param other
	 * @param self
	 * @param contact
	 */
	onTriggerEnter(other: any, self: any, contact: any): void {
		let owner: Laya.Sprite = this.owner as Laya.Sprite;
		if (other.label === "bullet") { //被子弹击中
			let destroyAni = this.loadAlbumAni(this.monsterAtlas);
			destroyAni.pos(owner.x, owner.y);
			owner?.parent?.addChild(destroyAni);
			destroyAni.play(0, false);
			destroyAni.on(Event.COMPLETE, this, () => {
				destroyAni.destroy();
			})
			owner?.removeSelf();
			MainRT.instance.addScore(1)
		} else if (other.label === "airplane") {  //撞到玩家飞机，游戏结束
			let destroyAni = this.loadAlbumAni(this.airplaneAtlas);
			destroyAni.pos(other.owner.x, other.owner.y);
			other.owner?.parent?.addChild(destroyAni);
			destroyAni.play(0, true);
			destroyAni.on(Event.COMPLETE, this, () => {
				other.owner?.removeSelf();
				//等待60帧播放动画后，结束游戏
				Laya.timer.frameOnce(60, this, () => {
					destroyAni.destroy();
					MainRT.instance.stopGame();
				})
			})
		}
	}
	
	/**
	 * 加载图集动画（被击中的爆炸效果）
	 */
	loadAlbumAni(atlas: string): Animation {
		let ani = new Animation();
		ani.loadAtlas(atlas);
		return ani;
	}
}
