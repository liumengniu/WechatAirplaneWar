const {regClass, property} = Laya;

@regClass()
export class Bullet extends Laya.Script {
	
	constructor() {
		super();
	}
	
	onEnable(): void {
		let rig: Laya.RigidBody = this.owner.getComponent(Laya.RigidBody);
		let bc: Laya.BoxCollider = this.owner.getComponent(Laya.BoxCollider);
		// 为碰撞体打标签（标识符，代表子弹），重要
		bc.label = "bullet";
		// 子弹行径属性
		rig.setVelocity({x: 0, y: -10});
	}
	
	/**
	 * 子弹击中敌机
	 * @param other
	 * @param self
	 * @param contact
	 */
	onTriggerEnter(other: any, self: any, contact: any): void {
		let owner: Laya.Sprite = this.owner as Laya.Sprite;
		if (other.label === "monster") {
			owner.removeSelf();
		}
	}
}
