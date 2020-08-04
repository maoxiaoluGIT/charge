import HitObject, { AttackObject } from "./HitObject";
import IBoss from "./IBoss";
import { ui } from "../../ui/layaMaxUI";
import { SysEnemy, SysSkill } from "../config/SysConfig";
import BossDao from "./BossDao";
import RotationEffect from "./RotationEffect";

export default class Boss2 extends HitObject implements IBoss{
    public ani:Laya.Animation;
    public view:ui.scene.Boss2ViewUI;
    
    constructor() {
        super();
        this.hitType = HitObject.ENEMY;
        this.view = new ui.scene.Boss2ViewUI();
        this.ani = this.view.bossAni;
        this.addChild( this.view );
        this.view.y = -this.view.height;
        this.view.x = -this.view.width/2;
        this.setBar( this.view.blood.bloodImg );
        this.view.visible = false;
    }

    public die():void{
        super.die();
        this.dieMv();
        this.clear();
    }

    public getHurt():number{
        return this.sys.enemyAttk;
    }

    public clear():void {
        Laya.timer.clearAll( this );
        this.ani.offAllCaller(this);
    }

    public sys:SysEnemy;
    public setSysEnemy( sys:SysEnemy ):void{
        this.sys = sys;
        this.setMaxHp( sys.enemyHp );
        this.resetHp();
    }

    public getHitBox():Laya.Sprite{
        return this.view.hitBox;
    }

    public startMv():void {
        this.view.visible = true;
        this.ani.interval = 1000/15;
        this.ani.play(0,false,"att1_2");
        this.nextWait();
    }

    private nextWait():void{
        this.ani.once(Laya.Event.COMPLETE ,this, this.wait);
    }

    private startMvOver():void{
        
    }

    public startAttackTime():void{
        this.attackOnce();
    }

    private attackOnce():void {
        let skillId:number = 0;
        if( 0.5 < Math.random() ){
            skillId = 1;
        }else{
            skillId = 2;
        }
        //let sys = <SysSkill>App.getConfig( MyGameInit.sys_skill,skillId );
        Laya.timer.once( 10000 , this, this.bossTimerFun,[skillId] );
    }

    public bossTimerFun( skillId:number ):void{
        if( skillId == 1 ){
            this.atk1Fun();
        }else{
            this.atk2Fun();
        }
        this.attackOnce();
    }

    public daoArr:Array<HitObject> = [];

    public clearDao():void{
        for( let i of this.daoArr ){
            if( i.parent ){
                i.removeSelf();
                this.battle.removeHitObject( i );
            }
        }
        this.daoArr.length = 0;
    }

    public atk1Fun():void {
        this.select = false;
        this.view.blood.visible = false;
        this.ani.interval = 1000/24;
        this.ani.play(0,false,"att1");
        this.ani.once(Laya.Event.COMPLETE,this,this.atk1ComFun);
    }

    public atk1ComFun():void{
        let left = new BossDao();
        let right = new BossDao();
        left.battle = this.battle;
        right.battle = this.battle;
        this.battle.addHitObject( left );
        this.battle.addHitObject( right );
        this.battle.setY( left );
        this.battle.setY( right );
        this.battle.battleSp.addChild( left );
        this.battle.battleSp.addChild( right );
        left.x = this.battle.playerView.x - 150;
        right.x = this.battle.playerView.x + 150;
        this.daoArr.push( left );
        this.daoArr.push( right );
        Laya.timer.once( Boss2.BOSS_DOWN_TIME , this,this.downFun );
        
    }

    public downFun():void {
        let v = new ATK1();
        v.battle = this.battle;
        this.battle.addHitObject( v );
        this.battle.battleSp.addChild( v );
        v.x = this.battle.playerView.x;
        this.battle.setY( v );
        Laya.timer.once( 1500,this,this.downFunOver);
    }

    public downFunOver():void{
        this.clearDao();
        this.ani.interval = 1000/60;
        this.ani.play(0,false,"att1_2");
        this.nextWait();
        this.select = true;
        this.view.blood.visible = true;
    }

    public static BOSS_DOWN_TIME:number = 5000;
    public startX:number = 0;

    public atk2Fun():void{
        this.select = false;
        this.view.blood.visible = false;
        this.ani.interval = 1000/24;
        this.ani.play(0,false,"att1");
        this.ani.once(Laya.Event.COMPLETE,this,this.atk2ComFun);
    }

    public atk2ComFun():void {
        this.visible = false;
        this.resetTemp();
        
        this.tsp.x = this.battle.playerView.x - 250;
        this.tAni.scaleX = -1;
        this.tAni.interval = 1000/24;
        this.tAni.play(0,false,"att1_2");
        this.tAni.once(Laya.Event.COMPLETE,this,this.atk3ComFun);
    }

    public tsp:Laya.Sprite;
    public tAni:Laya.Animation;
    
    public resetTemp():void{
        let sp:Laya.Sprite = new Laya.Sprite();
        this.tsp = sp;
        let t = new ui.scene.Boss2ViewUI();
        this.tAni = t.bossAni;
        sp.addChild(t);
        t.y = -t.height;
        t.x = -t.width/2;
        t.blood.visible = false;
        this.battle.battleSp.addChild( sp );
        this.battle.setY( <any>sp );
    }

    public atk3ComFun():void{
        this.tAni.interval = 1000/24;
        this.tAni.play(0,false,"att4");
        //放蛋刀的动作
        this.tAni.once(Laya.Event.COMPLETE,this,this.atk4ComFun);
    }

    public atk4ComFun():void{
        this.fly();
        //起飞
        this.tAni.interval = 1000/24;
        this.tAni.play(0,false,"att1");
        this.tAni.once(Laya.Event.COMPLETE,this,this.atk5ComFun);
    }

    public fly():void{
        let a = new ATK2();
        let b = new ATK2();
        a.battle = this.battle;
        b.battle = this.battle;
        this.battle.battleSp.addChild( a );
        this.battle.battleSp.addChild( b );
        this.battle.addHitObject( a );
        this.battle.addHitObject( b );
        this.battle.setY( a );
        this.battle.setY( b );
        a.x = this.tsp.x;
        b.x = this.tsp.x;
        a.zOrder = b.zOrder = 1000;
        a.start( this.tsp.x + 500 );
        b.start( this.tsp.x - 500 );
    }

    public atk5ComFun():void {
        this.tsp.removeSelf();
        //移除拷贝
        //this.x = this.startX;
        //this.view.bossAni.scaleX = 1;
        this.visible = true;
        this.ani.interval = 1000/24;
        this.ani.play(0,false,"att1_2");
        this.nextWait();
        this.select = true;
        this.view.blood.visible = true;
    }

    public wait():void{
        this.ani.interval = 1000/24;
        this.ani.play(0,true,"wait");
    }
}

export class ATK2 extends HitObject{
    public view:ui.scene.Boss2Atk2UI;
    constructor(){
        super();
        this.hitType = HitObject.BULLET;
        this.view = new ui.scene.Boss2Atk2UI();
        this.view.x = -this.view.width/2;
        this.view.y = -this.view.height;
        this.addChild(this.view);
        RotationEffect.play( this.view.img , 10 );
    }

    public getHitBox():Laya.Sprite {
        return this.view.hitbox;
    }

    public sx:number = 0;
    public start( target:number ):void{
        this.sx = this.x;
        let t = new Laya.Tween();
        t.to( this, {x:target} , 3000 , null , new Laya.Handler(this,this.com1) );
    }

    public com1():void{
        let t = new Laya.Tween();
        t.to( this, {x:this.sx} , 1000 , null , new Laya.Handler(this,this.com2) );
    }

    public com2():void{
        this.removeSelf();
        this.battle.removeHitObject(this);
    }

    public hitFun():boolean{
        this.view.img.visible = false;
        this.view.yinying.visible = false;
        this.hitEffect();
        return true;
    }

    public hitEffect():void{
        Laya.Tween.clearAll( this );
        this.view.clipZha.visible = true;
        this.view.clipZha.play( 0 , this.view.clipZha.total - 1 );
        this.view.clipZha.once( Laya.Event.COMPLETE,this,this.cccFun );
    }

    public cccFun():void {
        this.removeSelf();
    }

    public clear():void {
        Laya.Tween.clearAll( this );
        this.removeSelf();
    }

    public getAttackObject():AttackObject{
        return this.getHp41();
    }
}

export class ATK1 extends HitObject{
    public view:ui.scene.Boss2Atk1UI;
    constructor(){
        super();
        this.hitType = HitObject.BULLET;
        this.view = new ui.scene.Boss2Atk1UI();
        this.view.redView.ani1.play(0,true);
        this.addChild(this.view);
        this.view.y = -this.view.height;
        let t = new Laya.Tween();
        let targetY:number = this.view.height + 200;
        this.view.dan.y = -1000;
        this.view.x = -this.view.width/2;
        t.to( this.view.dan , {y:targetY} , 1500 , null ,new Laya.Handler(this,this.comFun) );
    }

    public hitFun():boolean{
        this.hitEffect();
        return true;
    }

    /**
     * 爆炸效果
     */
    private hitEffect():void{
        this.clear();
        this.view.clipZha.visible = true;
        this.view.clipZha.play( 0, this.view.clipZha.total - 1 );
        this.view.clipZha.once(Laya.Event.COMPLETE,this,this.comFun2);
        this.view.dan.visible = false;
    }

    public clear():void{
        Laya.Tween.clearAll(this);
        this.view.clipZha.offAllCaller(this);
    }

    private comFun2():void{
        this.removeSelf();
    }

    /**
     * 伊利丹落地了 没砸到人
     */
    public comFun():void {
        this.battle.removeHitObject( this );
        this.hitEffect();
    }

    public zhaComFun():void{
        this.removeSelf();
    }

    public getHitBox():Laya.Sprite{
        return this.view.hitbox;
    }

    public getAttackObject():AttackObject{
        return this.getHp41();
    }
}