const {regClass, property} = Laya;

@regClass()
export class AirPlane extends Laya.Script {
	constructor() {
		super();
	}
	
	onEnable(): void {
		let bc: Laya.BoxCollider = this.owner.getComponent(Laya.BoxCollider);
		bc.label = "airplane";
	}
}
