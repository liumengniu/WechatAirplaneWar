const {regClass, property} = Laya;

@regClass()
export class Bullet extends Laya.Script {
	
	constructor() {
		super();
	}
	
	onEnable(): void {
		let rig: Laya.RigidBody = this.owner.getComponent(Laya.RigidBody);
		rig.setVelocity({ x: 0, y: -10 });
	}
	
	/**
	 * 子弹击中敌机
	 * @param other
	 * @param self
	 * @param contact
	 */
	onTriggerEnter(other: any, self: any, contact: any): void {
		console.log(other, '=================', other.label)
		let owner: Laya.Sprite = this.owner as Laya.Sprite;
		if (self.label === "BoxCollider") {
			owner.removeSelf();
		}
	}
}
