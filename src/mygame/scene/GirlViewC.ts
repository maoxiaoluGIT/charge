import { ui } from "../../ui/layaMaxUI";
import MyEffect from "../effect/MyEffect";
import App from "../../game/App";
import MyEvent from "../MyEvent";
import GameEvent from "../../game/GameEvent";
import DataSession from "../session/DataSession";
import LogType from "../session/LogType";

export default class GirlViewC extends ui.scene.GrilViewUI {
    public dataSession:DataSession = null;

    public toulan(): void {
        //App.getInstance().eventManager.once( GameEvent.OPEN_SCENE,this,this.openFun );
    }

    public toulanFun():void{
        this.openFun();
    }

    public openFun():void{
        this.dataSession.log( LogType.NEWER_XINGLAI );
        this.disGirl( 1 , "大白天偷懒睡觉，梅林法师已经\n很久没有消息啦！" );
        Laya.timer.once( 2000,this,this.hideAll );
    }

    public diaocha():void{
        this.disGirl( 0 , "最近幽暗森林魔物越来越多，赶紧去调查一下。" );
    }

    constructor(){
        super();
        App.getInstance().injOne(this);
        this.talkbg.bottom = 0;
        this.height = Laya.stage.height;
        this.init();
    }

    public tailihai(): void {
        this.disGirl( 3,"太厉害了！点击角色按钮，进行查看。");
        Laya.timer.once( 3000,this,this.click2Fun );
        this.event( GirlViewC.NEXT );
    }

    public click2Fun():void{
        this.hideAll();
        //this.event( GirlViewC.NEXT );
    }

    /**
     * 隐藏全部
     */
    public hideAll():void{
        this.box1.visible = false;
        this.girl.visible = false;
        this.talkbg.visible = false;
    }

    public init():void{
        this.leftImg.graphics.drawRect(0,0,375,Laya.stage.height,"#000000");
        this.rightImg.graphics.drawRect(0,0,375,Laya.stage.height,"#000000");
        this.leftImg.alpha = 0.1;
        this.rightImg.alpha = 0.3;
        this.box1.visible = false;
    }

    public static NEXT:string = "NEXT";

    /**
     * 说第一句话
     */
    public startOne():void{
        this.disGirl( 1,"你还在磨蹭什么？魔龙开始侵袭！\n赶紧去增援！" );
        Laya.stage.once( Laya.Event.CLICK,this,this.clickFun );
    }

    public clickFun():void{
        this.dataSession.log( LogType.NEWER_FIRST_CLICK );
        this.event( GirlViewC.NEXT );
    }

    /**
     * 移动教学
     */
    public moveGuide():void{
        this.box1.visible = true;
        MyEffect.alhpa( this.box1 , 1 , 100 );
        this.girl.visible = false;
        this.talkbg.visible = false;
        Laya.timer.once( 3000,this,this.moveGuideOver );
    }

    private moveGuideOver():void {
        let t = new Laya.Tween();
        t.to( this.box1,{alpha:0} , 100,null,new Laya.Handler(this,this.moveGuideOver2) );
    }

    public moveGuideOver2():void{
        this.box1.visible = false;
    }

    /**
     * 你变的越来越强大
     * 之后让玩家干魔龙
     */
    public bianQiang():void{
        this.dataSession.log( LogType.NEWER_YUELAIYUEQIANGDA );
        this.disGirl( 3,"你变得越来越强大！"  );
        App.sendEvent(MyEvent.EQUIP_OVER_NEWER);
        this.click33Fun();
        //Laya.timer.once( 1500 ,this,this.hideAll );
        //Laya.stage.once(Laya.Event.CLICK,this,this.click33Fun);
    }

    public click33Fun():void{
        Laya.timer.once( 3000,this,this.hideAll );
        
    }


    /**
     * 显示女孩
     * @param stat 
     * @param text 
     */
    public disGirl( stat:number , text:string ):void{
        this.setGirlStat( stat );
        this.txt.text = text;
        this.girl.visible = true;
        this.talkbg.visible = true;
        this.box1.visible = false;
    }

    /**
     * 设置girl的脸
     * 0 默认的脸
     * 1 生气
     * 2 微笑
     * 3 大笑
     */
    private setGirlStat( stat:number ):void{
        this.nu.visible = false;
        this.xiao.visible = false;
        this.daxiao.visible = false;
        if( stat == 0 ){
            
        }else if( stat == 1 ){
            this.nu.visible = true;
        }else if( stat == 2 ){
            this.xiao.visible = true;
        }else if( stat == 3 ){
            this.daxiao.visible = true;
        }
    }
}