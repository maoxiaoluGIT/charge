import HitObject from "./HitObject";
import { ui } from "../../ui/layaMaxUI";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import { SysEnemy } from "../config/SysConfig";

export default class BossDao extends HitObject{
    public view:ui.scene.Boss2DaoUI;
    constructor(){
        super();
        this.view = new ui.scene.Boss2DaoUI();
        this.addChild(this.view);
        this.view.y = -this.view.height;
        this.view.x = -this.view.width/2;
        this.view.ani.play( 0 , false, "ani1" );
        this.view.ani.once( Laya.Event.COMPLETE, this, this.comFun );
        this.select = false;
        this.hitType = HitObject.ENEMY;
        this.setBar( this.view.blood.bloodImg );
        let sys = App.getConfig(MyGameInit.sys_enemy,20146);
        this.setSysEnemy( sys );
        this.view.blood.visible = false;
    }

    public die():void {
        this.removeSelf();
        this.battle.removeHitObject( this );
    }

    public setSysEnemy( sys:SysEnemy ):void{
        this.setMaxHp( sys.enemyHp );
        this.resetHp();
    }

    public hitFun():boolean {
        this.view.blood.visible = true;
        return false;
    }

    public comFun():void{
        this.select = true;
    }

    public getHitBox():Laya.Sprite{
        return this.view.hitBox;
    }
}