import MyAnimation from "../../game/MyAnimation";
import MyArray from "../../game/MyArray";
import MyProgressBar from "../../game/MyProgressBar";
import { SysSkill, SysEnemy } from "../config/SysConfig";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";

import IBoss from "./IBoss";
import MyEvent from "../MyEvent";
import { ui } from "../../ui/layaMaxUI";
import { BattleDisplay } from "./BattleDisplay";
import HitObject, { AttackObject } from "./HitObject";

export default class Boss1 extends HitObject implements IBoss{
    public ani:Laya.Animation;
    public view:ui.scene.Boss1ViewUI;
    
    constructor() {
        super();
        this.hitType = HitObject.ENEMY;
        this.view = new ui.scene.Boss1ViewUI();
        this.ani = this.view.bossAni;
        this.addChild( this.view );
        this.view.y = -this.view.height;
        this.view.x = -this.view.width/2;
        this.setBar( this.view.blood.bloodImg );
        this.view.visible = false;
    }

    public showTalk():void{
        this.view.talk.visible = true;
    }

    public closeTalk():void{
        this.view.talk.visible = false;
    }

    public clearAll():void{
        this.select = false;
        Laya.timer.clearAll(this);
        this.ani.offAllCaller(this);
        this.ani.gotoAndStop(0);
        this.wait();
    }

    /**
     * 起飞
     */
    public flyaway():void{
        this.select = false;
        Laya.timer.clearAll(this);
        this.ani.offAllCaller(this);
        this.ani.gotoAndStop(0);
        this.ani.play( 0, false , "att2" );
        this.ani.once( Laya.Event.COMPLETE , this, this.mfun );
    }

    public mfun():void{
        this.visible = false;
        Laya.timer.once( 500 , this, this.flFun );
    }

    public flFun():void{
        this.event( BattleDisplay.FLYOVEREVENT );
    }

    public die():void{
        super.die();
        this.dieMv();
        this.clear();
    }

    public getHitBox():Laya.Sprite{
        return this.view.hitBox;
    }
    
    public getHurt():number{
        return this.sys.enemyAttk;
    }

    public sys:SysEnemy;

    public setSysEnemy( sys:SysEnemy ):void{
        this.sys = sys;
        this.setMaxHp( sys.enemyHp );
        this.resetHp();
    }

    public startMv():void{
        this.view.visible = true;
        this.ani.play(0,false,"luo");
        this.ani.once(Laya.Event.COMPLETE ,this, this.startMvOver);
    }

    private startMvOver():void {
        this.ani.interval = 1000/24;
        this.ani.play(0,false,"att1");
        this.nextWait();
    }
    
    private nextWait():void{
        this.ani.once(Laya.Event.COMPLETE ,this, this.wait);
    }

    private wait():void{
        this.ani.play( 0,true,"wait");
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
        let sys = <SysSkill>App.getConfig( MyGameInit.sys_skill,skillId );
        Laya.timer.once( sys.skillTime , this, this.bossTimerFun,[skillId] );
    }

    public bossTimerFun( skillId:number ):void{
        if( skillId == 1 ){
            this.atk1Fun();
            App.sendEvent(MyEvent.FLASH_RED);
        }else{
            this.atk2Fun();
        }
        this.attackOnce();
    }

    /**
     * 飞上天
     */
    public atk2Fun():void{
        this.select = false;
        this.ani.gotoAndStop(0);
        this.ani.play( 0, false , "att2" );
        this.ani.once( Laya.Event.COMPLETE , this, this.moveFun );
    }

    public clear():void {
        this.ani.offAllCaller(this);
        Laya.timer.clearAll(this);
    }

    public moveFun():void{
        Laya.timer.once( 1000,this,this.flyStopFun );
    }

    public flyStopFun():void {
        this.ani.play( 0, false , "luo" );
        this.nextWait();
        Laya.timer.once( 300,this,this.downFireFun );
    }

    public downFireFun():void {
        this.select = true;
        for( let i:number = 0 ; i < 6; i++ ){
            this.addOneDown( 300 + i * 200 , 0 );
        }
    }

    public addOneDown( x1:number , time:number ):void{
        time = Math.random() * 3000;
        let a = new BossAtk2( time);
        a.battle = this.battle;
        a.x = this.x - x1;
        a.y = this.y;
        this.battle.battleSp.addChild( a );
        this.battle.addHitObject( a );
    }
        
    /**
     * 张嘴横着喷火球
     */
    public atk1Fun():void{
        this.ani.interval = 1000/24;
        this.ani.play( 0, false , "att1" );
        this.nextWait();
        Laya.timer.once( 1500, this, this.addFireBall );
    }

    /**
     * 横着飞火球
     */
    public addFireBall():void {
        let b = new BossAtk1();
        b.battle = this.battle;
        b.x = this.x;
        b.y = this.y;
        b.move();
        this.battle.battleSp.addChild( b );
        this.battle.addHitObject( b );
    }
}

export class BossAtk2 extends HitObject {
    public view:ui.scene.Attack2UI;
    
    constructor( time:number ){
        super();
        this.hitType = HitObject.BULLET;
        this.view = new ui.scene.Attack2UI();
        this.addChild(this.view);
        this.view.y = -this.view.height;
        this.view.redView.ani1.play( 0,true );
        let targetY:number = this.view.clip_luo.y;
        this.view.clip_luo.y = -1000;
        this.view.clip_luo.play();
        let t = new Laya.Tween();
        t.to( this.view.clip_luo , {y:targetY} , 1500,null,new Laya.Handler(this,this.luoOverFun) , time );
    }

    public getHitBox():Laya.Sprite{
        return this.view.hitBox;
    }

    public luoOverFun():void{
        this.battle.removeHitObject( this );
        this.zhaEffect();
    }

    public hitFun():boolean{
        this.zhaEffect();
        this.view.clipZha.y = this.view.clip_luo.y - 10;
        return true;
    }

    public zhaEffect():void{
        Laya.Tween.clearAll( this );
        this.view.clip_luo.visible = false;
        this.view.redView.visible = false;
        this.view.clipZha.visible = true;
        this.view.clipZha.play(0, this.view.clipZha.total -1 );
        this.view.clipZha.on(Laya.Event.COMPLETE,this,this.comFun);
    }

    getSkill():SysSkill{
        return App.getConfig( MyGameInit.sys_skill,"2" );
    }

    public comFun():void{
        this.removeSelf();
    }

    public clear():void {
        this.view.clipZha.offAllCaller(this);
        Laya.Tween.clearAll( this.view.clip_luo );
        Laya.Tween.clearAll( this );
    }

    public getAttackObject():AttackObject{
        return this.getHp41();
    }
}

export class BossAtk1 extends HitObject
{
    public view:ui.scene.BossFireBallUI;
    
    constructor(){
        super();
        this.hitType = HitObject.BULLET;
        this.view = new ui.scene.BossFireBallUI();
        this.view.fireClip.play();
        this.addChild(this.view);
        this.view.y = -this.view.height;
    }

    public getHitBox():Laya.Sprite{
        return this.view.hitBox;
    }

    public clear():void{
        Laya.Tween.clearAll(this);
        this.view.clipZha.offAllCaller(this);
    }

    public move():void{
        let t = new Laya.Tween();
        t.to( this , {x:this.x - 800} , 800/0.6, null , new Laya.Handler(this,this.moveOver) );
    }

    private moveOver():void {
        this.removeSelf();
        this.battle.removeHitObject( this );
    }

    public hitFun():boolean{
        this.hitEffect();
        return true;
    }

    getSkill():SysSkill{
        return App.getConfig( MyGameInit.sys_skill,"1" );
    }

    private hitEffect():void{
        this.clear();
        this.view.fireClip.visible = false;
        this.view.clipZha.visible = true;
        this.view.clipZha.play( 0, this.view.clipZha.total - 1 );
        this.view.clipZha.once(Laya.Event.COMPLETE,this,this.comFun);
    }

    private comFun():void{
        this.removeSelf();
    }

    public getAttackObject():AttackObject{
        return this.getHp41();
    }
}