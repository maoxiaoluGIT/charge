import { ui } from "./../../ui/layaMaxUI";
import { Equip, Res } from "../config/SysConfig";
import { EQUIP_TYPE } from "../session/BattleSession";
import { DISPLAY_TYPE } from "./BattleDisplay";
import MyEffect from "../effect/MyEffect";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";

export default class BattleScene extends ui.scene.BattleSceneUI {
    constructor() {
        super();
        this.bloodRect.width = this.bloodImg.width;
        this.bloodRect.height = this.bloodImg.height;
        
        this.whiteRect.width = this.bloodWhite.width;
        this.whiteRect.height = this.bloodWhite.height;

        
        this.initPool();
    }

    private initPool():void {
        for( let i:number = 0; i < 3; i++ ){
            Laya.Pool.recover( "hitEf" , this.createHitEf() );
        }
        for( let i:number = 0; i < 30; i++ ){
            let img = new Laya.Image("sence/dongjin.png");
            Laya.Pool.recover( "flygold" , img );
        }
        for( let i:number = 0; i < 13; i++ ){
            let isCrit = (i > 10);
            let f = new Laya.FontClip();
            if( isCrit ){
                f.skin = "battlescene/hurt1.png";
                f.sheet = "0123 4567 89+- x1%=";
            }else{
                f.skin = "battlescene/hurt2.png";
                f.sheet = "0123 4567 89+- x1=%";
            }
            f.anchorX = 0.5;
            f.anchorY = 0.5;
            Laya.Pool.recover( "flyFc" + isCrit , f );
        }
    }

    /**
     * 设置玩家属性 
     */
    public setAttribute(equip: Equip): void {
        this.l0.text = equip.attack + "";
        this.l1.text = equip.crit + "";
        this.l2.text = equip.defense + "";
        this.l3.text = equip.move + "";
        this.l4.text = equip.hitPoint + "";
    }

    /**
     * 设置玩家的装备
     */
    public setEquipment(arr: Array<Equip>): void {
        this.setEquipmentByPart(this.e0, arr[EQUIP_TYPE.WEAPON]);
        this.setEquipmentByPart(this.e1, arr[EQUIP_TYPE.HEAD]);
        this.setEquipmentByPart(this.e2, arr[EQUIP_TYPE.BODY]);
        this.setEquipmentByPart(this.e3, arr[EQUIP_TYPE.HORSE]);
    }

    public setEquipmentByPart( img:Laya.Image , equip:Equip ):void{
        let image:Laya.Image = <Laya.Image>img.getChildAt(0);
        if( equip == null ){
            image.skin = null;
            return;
        }
        let sys = equip.getSysItem();
        img.skin = Res.getItemBorder( sys.itemQuality );
        image.skin = Res.getItemUrl( sys.id );
    }

    public bloodRect:Laya.Rectangle = new Laya.Rectangle(0,0);
    public whiteRect:Laya.Rectangle = new Laya.Rectangle(0,0);
    public twover: boolean = true;
    
    public setNowHp( value:number ):void{
        if( value <= 0 ){
            this.bloodImg.visible = false;
            this.bloodWhite.visible = false;
            return;
        }
        let lastWidth = this.bloodRect.width;
        this.bloodRect.width = this.bloodImg.width * value;
        this.bloodImg.scrollRect = this.bloodRect;
        if (this.twover) {
            this.twover = false;
            this.whiteRect.width = lastWidth;
            this.bloodWhite.scrollRect = this.whiteRect;
            Laya.timer.frameLoop(1, this, this.whiteLoopFun);
        }
    }

    public whiteLoopFun(e: Laya.Event): void {
        let len = Laya.timer.delta * 0.12;//速度是0.5像素每毫秒
        let nowWid = this.bloodWhite.scrollRect.width - len;
        this.whiteRect.width = nowWid;
        this.bloodWhite.scrollRect = this.whiteRect;
        if ( this.whiteRect.width <= this.bloodRect.width) {
            Laya.timer.clear(this, this.whiteLoopFun);
            this.twover = true;
        }
    }

    /**
     * 只更新血
     * @param value 
     */
    public onlyResetHp( value:number ):void{
        this.bloodRect.width = this.bloodImg.width * value;
        this.whiteRect.width = this.bloodWhite.width * value;
        this.bloodImg.scrollRect = this.bloodRect;
        this.bloodWhite.scrollRect = this.whiteRect;
        this.bloodImg.visible = true;
        this.bloodWhite.visible = true;
    }

    public hpMax():void {
        let t = new Laya.Tween();
        t.to( this.bloodRect , { width:this.bloodImg.width , update:new Laya.Handler(this,this.hpmaxFun) },  200 ,Laya.Ease.strongOut );

        let tt = new Laya.Tween();
        tt.to( this.blood , { scaleX:1,scaleY:1.2}, 100, null ,new Laya.Handler( this,this.bloodComfun)  );
    }

    private hpmaxFun():void{
        this.bloodImg.scrollRect = this.bloodRect;
    }

    private bloodComfun():void {
        this.blood.scale(1,1);
    }

    public createHitEf():Laya.Animation{
        let c = new Laya.Animation();
        c.interval = 1000/60;
        c.source = "scene/texiao/gongji.ani";
        c.zOrder = 1001;
        c.scale(2,2);
        return c;
    }

    /**
     * 冒红色的光
     */
    public playHitEffect( isCrit:boolean ,ex:number,ey:number ): void {
        let c = Laya.Pool.getItem("hitEf");
        if( c == null ){
            c = this.createHitEf();
        }
        c.once(Laya.Event.COMPLETE, this, this.playHitEffectOver, [c]);
        c.pos( ex,ey );
        c.play( 0,false );
        this.battleSp.addChild(c);
        if( isCrit ) {
            //Laya.SoundManager.playSound("sound/comboEffect1.wav");
            App.getInstance().gameSoundManager.playEffect("sound/comboEffect1.wav");
        }else{
            App.getInstance().gameSoundManager.playEffect("sound/fx_Hit.wav");
            //Laya.SoundManager.playSound("sound/fx_Hit.wav");
        }
    }

    private playHitEffectOver(c:Laya.Animation): void {
        c.removeSelf();
        Laya.Pool.recover( "hitEf" , c );
    }

    public flyHitEffect(num: number, isCrit: boolean, x1:number,y1:number): void
    {
        let f = Laya.Pool.getItem("flyFc" + isCrit );
        if( f == null ){
            f = new Laya.FontClip();
            if( isCrit ){
                f.skin = "battlescene/hurt1.png";
                f.sheet = "0123 4567 89+- x1%=";
            }else{
                f.skin = "battlescene/hurt2.png";
                f.sheet = "0123 4567 89+- x1=%";
            }
            f.anchorX = 0.5;
            f.anchorY = 0.5;
        }
        f.scaleX = 1;
        f.scaleY = 1;
        f.alpha = 1;
        f.visible = true;
        f.value = "-" + num + "";
        f.zOrder = 1002;
        this.battleSp.addChild(f);
        f.x = x1;
        f.y = y1;
        let t = new Laya.Tween();
        if( isCrit ){
            let tt = new Laya.Tween();
            f.scale(0,0);
            tt.to( f,{ scaleX:1,scaleY:1 } , 200 , Laya.Ease.backOut );
        }
        t.to(f, { y: f.y - 200, alpha:0 } , 2000, null, new Laya.Handler(this, this.effectFun, [f,isCrit]));
    }

    public effectFun(f: Laya.Sprite ,isCrit: boolean ): void {
        f.removeSelf();
        Laya.Pool.recover( "flyFc" + isCrit , f );
    }

    public nowGold:number = 0;

    public flyGold( x1:number,y1:number,gold:number ):void{
        let flyGoldNum: number = 5;
        let goldEvery: number = gold / flyGoldNum;
        for (let i: number = 0; i < flyGoldNum; i++) {
            let img = Laya.Pool.getItem("flygold"); 
            if( img == null ){
                img = new Laya.Image("sence/dongjin.png");
            }
            Laya.stage.addChild(img);
            img.scaleX = 1;
            img.scaleY = 1;
            img.x = x1 + Math.random() * 80 - 50;
            img.y = y1 + Math.random() * 80 - 150;
            img.alpha = 0;
            this.flyEffect(img , goldEvery);
        }
    }

    private flyEffect(img: Laya.Image, gold: number): void {
        let p = this.goldImg.localToGlobal( MyEffect.getP00() );
        let t = new Laya.Tween();
        img.anchorX = img.anchorY = 0.5;
        MyEffect.BigSmallEffect(img);
        t.to(img, { x: p.x + 10, y: p.y + 10, scaleX: 0.6, scaleY: 0.6 }, 700, Laya.Ease.backIn, new Laya.Handler(this, this.flyGoldOverFun, [img, gold]), Math.random() * 500);
    }
    
    public flyGoldOverFun(img: Laya.Image, gold: number): void {
        img.removeSelf();
        Laya.Pool.recover( "flygold",img );
        
        let t = new Laya.Tween();
        t.to(this.goldImg , { scaleX: 0.7, scaleY: 0.7 }, 80);

        let t1 = new Laya.Tween();
        t1.to(this.goldImg , { scaleX: 1, scaleY: 1 }, 60, null, null, 80);

        this.nowGold += gold;

        this.goldFc.value = parseInt( Math.ceil( this.nowGold ) + "" ) + "";
    }

    public setNowGold( value:number ):void{
        this.goldFc.value = value + "";
        this.nowGold = value;
    }

    public flyNum:number = 0;
    public FLY_BOX_TIME:number = 10 * 1000;
    public FLY_BOX_TIME_SECOND:number = 2 * 60 * 1000;

    public flyBoxStart():void{
        let time:number = 0;
        if( this.flyNum == 0 ){
            time = this.FLY_BOX_TIME;
        }else{
            time = this.FLY_BOX_TIME_SECOND;
        }
        Laya.timer.once( time , this, this.flyBoxFun );
        this.flyNum++;
    }

    public flyBoxFun():void{
        let a = new ui.scene.feibaoxiangUI();
        a.mouseThrough = true;
        this.addChild( a );
        a.x = -750;
        a.ani1.play( 0,true );
        let t = new Laya.Tween();
        a.box.on(Laya.Event.CLICK,this,this.flyBoxClickFun);
        t.to( a,{ x:0 },1000,null,new Laya.Handler(this,this.fly2Fun,[a]) );
    }
    
    public flyBoxClickFun():void{
        App.dialog( MyGameInit.FlyBoxDialog );
    }
    
    public fly2Fun( a:ui.scene.feibaoxiangUI ):void{
        let t = new Laya.Tween();
        t.to( a,{ x:750 },500,null,new Laya.Handler(this,this.flyOverFun,[a]) ,3000);
    }

    public flyOverFun(a:ui.scene.feibaoxiangUI):void{
        a.removeSelf();
        this.flyBoxStart();
    }
}