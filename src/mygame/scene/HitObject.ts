import { SysEnemy } from "../config/SysConfig";
import MyProgressBar from "../../game/MyProgressBar";
import { DISPLAY_TYPE } from "./BattleDisplay";
import BattleSceneMediator from "../mediator/BattleSceneMediator";

export default class HitObject extends Laya.Sprite {
    constructor(){
        super();
        this.once( Laya.Event.UNDISPLAY ,this, this.undisFun );
    }

    public undisFun():void{
        this.clear();
    }

    public static ENEMY:number = 0;
    public static BULLET:number = 1;
    public static ITEM:number = 2;
    public static BUFF:number = 3;

    /**
     * 碰撞类型
     * 他们被碰撞后 会按照类型处理
     */
    public hitType:number = -1;
    /**
     * 显示类型 比如你是boss 还是小兵
     */
    public disType:number = 0;

    public battle:BattleSceneMediator;

    /**
     * 是否进行碰撞检测
     */
    public hitTest:boolean = true;

    /**
     * 能否选中 比如龙上天 比如无敌时间
     */
    public select:boolean = true;

    public initPoint:Laya.Point = new Laya.Point();
    
    public isDead:boolean = false;
    /**
     * 得到碰撞盒
     */
    public getHitBox():Laya.Sprite {
        return null;
    }
    
    /**
     * 得到显示对象
     */
    public getDisplay():Laya.Sprite {
        return null;
    }
    /**
     * 清理所有资源和tween等等 防止报错
     */
    public clear():void{
        
    }

    public setDisplayType( type:number ):void{
        this.disType = type;
    }

    /**
     * 存储初始的位置
     */
    public savePos():void{
        this.initPoint.x = this.x;
        this.initPoint.y = this.y;
    }

    /**
     * 显示的时候调用
     */
    public onShow():void{
        this.visible = true;
    }

    /**
     * 隐藏的时候调用
     */
    public onHide():void{
        if( this.disType == DISPLAY_TYPE.MONSTER || this.disType == DISPLAY_TYPE.ADD_HP ){
            this.visible = false;
        }
    }

    /**
     * 碰撞的回调方法 如果返回true 就会从列表里移除
     */
    public hitFun():boolean {
        if( this.onceHitMode ){
            this.checked = true;
        }
        return false;
    }

    public unHitFun():void{
        this.checked = false;
    }

    public checked:boolean = false;

    public mybar:MyProgressBar = null;

    /**
     * 加减hp 加就是正的 减就是负的
     * @param hp
     */
    public changeHp( hp:number ):void {
        this.nowHp += hp;
        this.mybar.setValue( this.nowHp,this.maxHp );
        if( this.nowHp <= 0 ){
            this.isDead = true;
        }
    }

    /**
     * 设置最大血量
     * @param maxHp 
     */
    public setMaxHp( maxHp:number ):void{
        this.nowHp = maxHp;
        this.maxHp = maxHp;
        this.mybar.setValue( this.nowHp,this.maxHp );
    }

    public nowHp:number;
    public maxHp:number;

    /**
     * 如果设置了这个 就相当于有了血量
     * @param maxHp 
     * @param img 
     */
    public setBar( img:Laya.Image ):void {
        if( this.mybar == null ){
            this.mybar = new MyProgressBar();
            this.mybar.setScrollRectSprite( img );
        }
    }

    public die():void{
        this.isDead = true;
    }

    public dieMv():void{
        let t = new Laya.Tween();
        t.to( this, { alpha:0 } , 1000 );
    }

    /**
     * 被击中
     */
    public hitIng():void{
        
    }

    /**
     *  怪物对人造成的伤害
     */
    public getHurt():number{
        return 0;
    }

    /**
     * 得到伤害类型 这个一般是子弹用的
     */
    public getAttackObject():AttackObject{
        return null;
    }

    public getHp41():AttackObject {
        let hp = this.battle.bagSession.playerEquip.hitPoint / 4;
        let a = new AttackObject();
        a.type = AttackObject.FORCE_ATTACK;
        a.value = hp;
        return a;
    }

    /**
     * 回复血量
     */
    public resetHp():void {
        if( this.mybar ){
            this.mybar.setValue( this.maxHp , this.maxHp );
        }
        this.nowHp = this.maxHp;
    }

    /**
     * 恢复位置
     */
    public resetPos():void{
        this.x = this.initPoint.x;
        this.y = this.initPoint.y;
    }

    public setScaleX( value:number ):void{
        
    }

    public getScaleX():number{
        return 0;
    }

    public setSysEnemy(sys:SysEnemy):void{
        
    }

    /**
     * 一次碰撞检测
     * 开启这个功能 物品被碰撞一次后 不会持续检测
     */
    public onceHitMode:boolean = false;

    public drawHit():void{
        let a = this.getHitBox();
        a.graphics.clear();
        a.graphics.drawRect( 0,0,a.width,a.height , "#ffffff" );
    }
}

export class AttackObject{
    /**
     * 伤害数值
     */
    public value:number;
    /**
     * 伤害类型
     */
    public type:number;

    public static NORMAL_ATTACK:number = 0;
    public static FORCE_ATTACK:number = 1;
}