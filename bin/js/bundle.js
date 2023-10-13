"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i = decorators.length - 1, decorator; i >= 0; i--)
      if (decorator = decorators[i])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result)
      __defProp(target, key, result);
    return result;
  };

  // src/Main.ts
  var Event = Laya.Event;
  var Sprite = Laya.Sprite;
  var Stage = Laya.Stage;
  var { regClass, property } = Laya;
  var Main = class extends Laya.Script {
    constructor() {
      super();
      this.startTime = 0;
      /** 飞机每隔 2000ms 发射一颗子弹 */
      this.createBulletInterval = 1e3;
      /** 飞机每隔 2000ms 发射一颗子弹 */
      this.createMonsterInterval = 2e3;
      /** 飞机位置 x **/
      this._x = 0;
      /** 飞机位置 y **/
      this._y = 0;
      /**是否停止每帧更新 */
      this.updateStop = false;
    }
    onAwake() {
      this.handleAdaptive();
      this.handleStageSetting();
    }
    /**
     * 屏幕自适应
     * @private
     */
    handleAdaptive() {
      console.log(Laya.stage, "====================================");
      Laya.stage.screenMode = Stage.SCREEN_VERTICAL;
      Laya.stage.designWidth = Laya.stage.width;
      Laya.stage.designHeight = Laya.stage.height;
      Laya.stage.on(Event.RESIZE, this, () => {
        console.log(Laya.stage, "9999999999999999999999999999999999999999999");
        Laya.stage.designWidth = Laya.stage.width;
        Laya.stage.designHeight = Laya.stage.height;
      });
    }
    onEnable() {
      let prefabArr = [
        "resources/prefab/Airplane.lh",
        "resources/prefab/Bullet.lh"
      ];
      Laya.loader.load(prefabArr).then((prefabList) => {
        Laya.stage.on(Laya.Event.BLUR, this, () => {
          this.updateStop = true;
        });
        Laya.stage.on(Laya.Event.FOCUS, this, () => {
          this.updateStop = false;
        });
      });
    }
    /**
     * 代码动态设置主舞台属性
     * todo 没有在IDE找到设置背景图的地方，有没有代码设置背景图的api，此处直接增加一个 子节点图片解决
     */
    handleStageSetting() {
      let sp2 = new Sprite();
      sp2.loadImage("resources/apes/background.png");
      sp2.width = Laya.stage.width;
      sp2.height = Laya.stage.height;
      Laya.stage.on(Event.RESIZE, this, () => {
        console.log(Laya.stage, "9999999999999999999999999999999999999999999");
        sp2.width = Laya.stage.width;
        sp2.height = Laya.stage.height;
      });
      this.owner.addChild(sp2);
    }
    /**
     * 从对象池创建飞机
     * @private
     */
    createAirplane() {
      let airplane = Laya.Pool.getItemByCreateFun("Airplane", this.airplane.create, this.airplane);
      airplane.pos((Laya.stage.designWidth - airplane.width) / 2, Laya.stage.designHeight - airplane.height - 100);
      this._x = (Laya.stage.designWidth - airplane.width) / 2;
      this._y = Laya.stage.designHeight - airplane.height - 100;
      this.owner.addChild(airplane);
      Laya.stage.on(Event.KEY_DOWN, this, (e) => this.onAirplaneStartMove(e, airplane));
    }
    /**
     * 从对象池创建飞机的子弹
     * @private
     */
    createBullet() {
      let bullet = Laya.Pool.getItemByCreateFun("Bullet", this.bullet.create, this.bullet);
      let bulletBody = bullet.addComponent(Laya.RigidBody);
      bulletBody.gravityScale = 0;
      bullet.addComponent(Laya.BoxCollider);
      bullet.pos(this._x + 102 / 2, this._y);
      this.owner.addChild(bullet);
    }
    /**
     * 创建怪物
     */
    createMonster() {
      let monster = Laya.Pool.getItemByCreateFun("Monster", this.monster.create, this.monster);
      let monsterBody = monster.addComponent(Laya.RigidBody);
      monster.addComponent(Laya.BoxCollider);
      monster.pos(Math.random() * (Laya.stage.designWidth - 100), -100);
      this.owner.addChild(monster);
    }
    /**
     * 每帧更新
     */
    onUpdate() {
      if (this.updateStop) {
        return;
      }
      let now = Date.now();
      if (now - this.startTime > this.createBulletInterval) {
        this.startTime = now;
        this.createBullet();
        this.createMonster();
      }
    }
    /**
     * 拖动飞机（鼠标）
     * @private
     */
    onAirplaneStartMove(e = null, airplane = null) {
      switch (e.keyCode) {
        case 87:
          this._y = airplane.y = airplane.y > 20 ? airplane.y - 20 : airplane.y;
          break;
        case 83:
          this._y = airplane.y = airplane.y + airplane.height < Laya.stage.designHeight ? airplane.y + 20 : airplane.y;
          break;
        case 68:
          this._x = airplane.x = airplane.x + airplane.width < Laya.stage.designWidth ? airplane.x + 20 : airplane.x;
          break;
        case 65:
          this._x = airplane.x = airplane.x > 20 ? airplane.x - 20 : airplane.x;
          break;
      }
    }
    /**
     * 游戏开始
     */
    onStart() {
      console.log("Game start");
      this.createAirplane();
    }
    /**
     * 游戏结束
     */
    stopGame() {
    }
  };
  __name(Main, "Main");
  __decorateClass([
    property({ type: Laya.Prefab })
  ], Main.prototype, "airplane", 2);
  __decorateClass([
    property({ type: Laya.Prefab })
  ], Main.prototype, "bullet", 2);
  __decorateClass([
    property({ type: Laya.Prefab })
  ], Main.prototype, "monster", 2);
  Main = __decorateClass([
    regClass("7bad1742-6eed-4d8d-81c0-501dc5bf03d6", "../src/Main.ts")
  ], Main);

  // src/prefab/AirPlane.ts
  var { regClass: regClass2, property: property2 } = Laya;
  var AirPlane = class extends Laya.Script {
    constructor() {
      super();
    }
    onEnable() {
      this._rig = this.owner.getComponent(Laya.RigidBody);
    }
    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    //onAwake(): void {}
    //组件被启用后执行，例如节点被添加到舞台后
    //onEnable(): void {}
    //组件被禁用时执行，例如从节点从舞台移除后
    //onDisable(): void {}
    //第一次执行update之前执行，只会执行一次
    //onStart(): void {}
    //手动调用节点销毁时执行
    //onDestroy(): void {}
    //每帧更新时执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
    onUpdate() {
    }
    //每帧更新时执行，在update之后执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
    //onLateUpdate(): void {}
    //鼠标点击后执行。与交互相关的还有onMouseDown等十多个函数，具体请参阅文档。
    //onMouseClick(): void {}
  };
  __name(AirPlane, "AirPlane");
  AirPlane = __decorateClass([
    regClass2("6bc25d4e-1457-4c39-9544-c51854163628", "../src/prefab/AirPlane.ts")
  ], AirPlane);

  // src/prefab/Bullet.ts
  var { regClass: regClass3, property: property3 } = Laya;
  var Bullet = class extends Laya.Script {
    constructor() {
      super();
    }
    onEnable() {
      let rig = this.owner.getComponent(Laya.RigidBody);
      rig.setVelocity({ x: 0, y: -10 });
    }
    /**
     * 子弹击中敌机
     * @param other
     * @param self
     * @param contact
     */
    onTriggerEnter(other, self, contact) {
      console.log(other, "=================", other.label);
      let owner = this.owner;
      if (self.label === "BoxCollider") {
        owner.removeSelf();
      }
    }
  };
  __name(Bullet, "Bullet");
  Bullet = __decorateClass([
    regClass3("644b6109-3923-4e68-ad07-091ffea940fe", "../src/prefab/Bullet.ts")
  ], Bullet);

  // src/prefab/Monster.ts
  var { regClass: regClass4, property: property4 } = Laya;
  var Monster = class extends Laya.Script {
    constructor() {
      super();
    }
    onEnable() {
      let rig = this.owner.getComponent(Laya.RigidBody);
    }
    /**
     * 敌机碰撞检测（被子弹击中/撞到了玩家飞机）
     * @param other
     * @param self
     * @param contact
     */
    onTriggerEnter(other, self, contact) {
      console.log(other, "=================", other.label);
      let owner = this.owner;
      if (self.label === "BoxCollider") {
        owner.removeSelf();
      }
    }
    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    //onAwake(): void {}
    //组件被启用后执行，例如节点被添加到舞台后
    //onEnable(): void {}
    //组件被禁用时执行，例如从节点从舞台移除后
    //onDisable(): void {}
    //第一次执行update之前执行，只会执行一次
    //onStart(): void {}
    //手动调用节点销毁时执行
    //onDestroy(): void {}
    //每帧更新时执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
    //onUpdate(): void {}
    //每帧更新时执行，在update之后执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
    //onLateUpdate(): void {}
    //鼠标点击后执行。与交互相关的还有onMouseDown等十多个函数，具体请参阅文档。
    //onMouseClick(): void {}
  };
  __name(Monster, "Monster");
  Monster = __decorateClass([
    regClass4("3148595d-541e-4a00-86da-17d470ad40bc", "../src/prefab/Monster.ts")
  ], Monster);
})();
//# sourceMappingURL=bundle.js.map
