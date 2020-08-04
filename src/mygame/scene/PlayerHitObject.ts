import { ui } from "../../ui/layaMaxUI";
import HitObject from "./HitObject";

export default class PlayerHitObject {
    /**
     * 攻击到敌人时回调
     */
    public attackTargetHandler:Laya.Handler = null;
    /**
     * 攻击结束 回到原位回调
     */
    public attackComHanlder:Laya.Handler = null;
    
    public isAttack:boolean = false;

    private player:ui.scene.playerUI;

    private targetHanlder:Laya.Handler = null;
    private comHanlder:Laya.Handler = null;

    private t1:Laya.Tween = new Laya.Tween();
    private t2:Laya.Tween = new Laya.Tween();
    
    private T1_TIME:number = 100;
    private T2_TIME:number = 50;

    private startX:number = 0;
    private startY:number = 0;

    public attackHO:HitObject = null;

    constructor(){
        
    }

    public setPlayer( p:ui.scene.playerUI ):void{
        this.player = p;
        this.startX = this.player.player.x;
        this.startY = this.player.player.y;
        this.targetHanlder = new Laya.Handler( this,this.targetFun );
        this.comHanlder = new Laya.Handler( this,this.attackComFun );
    }
    
    /**
     * 播放攻击动作
     */
    public attack( hitObject:HitObject ):void {
        this.attackHO = hitObject;
        this.t1.to( this.player.player , { x:110 , y:this.startY - 10 } ,this.T1_TIME , null , this.targetHanlder );
        this.isAttack = true;
    }

    /**
     * 正进攻一半呢 忽然中弹死了
     * 在这里进行清理
     */
    public stop():void {
        Laya.Tween.clearAll( this.player.player );
        this.player.x = this.startX;
        this.player.y = this.startY;
        this.isAttack = false;
    }

    private targetFun():void{
        this.attackTargetHandler.runWith( this.attackHO );
        this.t2.to( this.player.player , { x:this.startX , y:this.startY } , this.T2_TIME , null , this.comHanlder );
    }

    private attackTarget():void {
        if( this.attackHO.hitTest == false ){
            //如果这个时候 敌人消失了 比如飞天 遁地 就无法触发攻击
            return;
        }
        this.attackTargetHandler.runWith( this.attackHO );
        this.attackHO = null;
    }

    private attackComFun(): void {
        this.isAttack = false;
        this.attackComHanlder.run();
    }
}