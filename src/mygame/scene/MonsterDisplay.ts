import { ui } from "../../ui/layaMaxUI";
import HitObject from "./HitObject";
import { SysEnemy } from "../config/SysConfig";
import MyAnimation from "../../game/MyAnimation";
import MyProgressBar from "../../game/MyProgressBar";
import { DISPLAY_TYPE } from "./BattleDisplay";

export default class MonsterDisplay extends HitObject{
    public monster:ui.scene.MonsterViewUI;
    public myAni:MyAnimation = null;
    public sysEnemy:SysEnemy;

    public dieTween:Laya.Tween = new Laya.Tween();
    public tHandler:Laya.Handler = new Laya.Handler( this,this.tFun );

    constructor(){
        super();
        this.hitType = HitObject.ENEMY;
        this.monster = new ui.scene.MonsterViewUI();
        this.monster.y = -this.monster.height;
        this.setBar( this.monster.blood.bloodImg );
        this.addChild( this.monster );
    }

    public getHitBox():Laya.Sprite {
        return this.monster.hitBox;
    }

    public getDisplay():Laya.Sprite{
        return this.monster;
    }

    public setSysEnemy(sys:SysEnemy , style = -1 ):void{
        this.sysEnemy = sys;
        this.removeChildByName("ani");
        this.myAni = new MyAnimation();
        this.myAni.name = "ani";
        let m = sys.enemymode;
        if( style != -1 ){
            m = style;
        }
        this.myAni.load( "scene/monsterAni/" + m + ".ani" , "res/atlas/monsterAni/" + m + ".atlas" );
        this.addChild( this.myAni );
        this.myAni.interval = 1000/60;
        this.wait();
        this.myAni.x = this.monster.width/2;
        this.isDead = false;
        this.visible = true;
        this.alpha = 1;
        this.setMaxHp( sys.enemyHp );
        this.resetHp();
        this.monster.blood.visible = false;
        this.hitTest = true;
    }

    public setDisplayType( type:number ):void{
        super.setDisplayType( type );
        if( type == DISPLAY_TYPE.BOSS ){
            this.myAni.scale(2,2);
            this.getHitBox().scale(2,2);
            this.monster.blood.y = -100;
        }
    }

    public hitFun():boolean {
        this.monster.blood.visible = true;
        return false;
    }

    public setScaleX( value:number ):void{
        this.myAni.scaleX = value;
    }

    public getScaleX():number{
        return this.myAni.scaleX;
    }

    public getHurt():number {
        return this.sysEnemy.enemyAttk;
    }

    public die():void {
        this.hitTest = false;
        super.die();
        this.myAni.interval = 1000/60;
        this.myAni.play(0,false,"hit");
        this.myAni.once(Laya.Event.COMPLETE,this,this.dieOver);
    }

    public dieOver():void {
        this.dieTween.to( this , { alpha:0 } , 100 , null, this.tHandler );
    }

    public tFun():void {
        this.visible = false;
    }

    public hitIng():void{
        this.myAni.interval = 1000/60;
        this.myAni.play(0,false,"hit");
        this.myAni.once(Laya.Event.COMPLETE,this,this.wait);
    }

    public wait():void{
        this.myAni.play(0,true,"wait");
    }
}