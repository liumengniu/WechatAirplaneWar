import Dialog = Laya.Dialog;
import Text = Laya.Text;

const {regClass, property} = Laya;

@regClass()
export class Monster extends Laya.Script {
	constructor() {
		super()
	}
	
	onEnable(): void {
		let bc: Laya.BoxCollider = this.owner.getComponent(Laya.BoxCollider);
		bc.label = "monster";
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
			owner.removeSelf();
		} else if (other.label === "airplane") {  //撞到玩家飞机，游戏结束
			this.createFailedBox()
		}
	}
	
	/**
	 * 游戏失败UI绘制
	 * @private
	 */
	private createFailedBox(): void{
		let txt: Text = new Text();
		txt.align = "center";
		txt.text = "游戏失败";
		txt.font = "Microsoft YaHei";
		txt.fontSize = 40;
		txt.color = "#333";
		txt.bold = true;
		let dialog:Dialog = new Dialog()
		dialog.addChild(txt);
		dialog.show()
	}
}
