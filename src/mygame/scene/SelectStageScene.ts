import {ui} from "./../../ui/layaMaxUI";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import { SysStageInfo } from "../config/SysConfig";

export default class SelectStageScene extends ui.scene.SelectStageDialogUI{
    constructor(){
        super();
        //this.boss1.clickHandler = new Laya.Handler( this , this.boss1Fun );
        //this.boss2.clickHandler = new Laya.Handler( this, this.boss2Fun );
    }

    public boss1Fun():void{
        this.clickStageFun(null);
    }

    public boss2Fun():void{
        this.clickStageFun(null);
    }
    
    public static SELECT_STAGE:string = "SELECT_STAGE";

    public stageArr:Array<Laya.Box> = [];

    /**
     * @param sys 选择了某个关卡 发送事件
     */
    public clickStageFun( sys:SysStageInfo ):void{
        Laya.Dialog.manager.closeAll();
        this.event( SelectStageScene.SELECT_STAGE , sys );
        App.getInstance().openScene( MyGameInit.BattleScene );
    }

    /**
     * 根据box得到stageview
     * @param box
     */
    public getView( box:Laya.Box ):ui.scene.StageViewUI{
        return <ui.scene.StageViewUI>box.getChildByName("stageview");
    }

    /**
     * 设置当前打到第几关了
     * @param stageIndex 
     */
    public setNowStage( stageIndex:number ):void{
        for( let i:number = 0; i < this.stageArr.length; i++ ){
            this.stageArr[i].disabled = !(i <= stageIndex );
        }
        //this.s10.disabled = !(stageIndex >= 4);
        //this.s11.disabled = !(stageIndex >= 9);
    }
    
    public setTitle(title:string):void{
        
    }

    /**
     * 设置地图配置
     * @param arr 
     */
    public setSysArr(arr:Array<SysStageInfo>):void{
        let i:number = 0;
        while(true){
            let sys = arr[i];
            if( this[ "s" + i ] != null ){
                if( sys.stageType == 1 ){
                    let v = this.getView( this[ "s" + i ] );
                    v.img1.skin = "resselectstage/xiaoguan.png";
                    v.t1.text = (i+1) + "";
                    v.t1.visible = true;
                    this.stageArr.push( this[ "s" + i ] );
                    v.on(Laya.Event.CLICK,this,this.clickStageFun,[sys] );
                }else if( sys.stageType == 2 ){
                    this[ "s" + i ].on(Laya.Event.CLICK,this,this.clickStageFun,[sys] );
                }
                i++;
            }else{
                break;
            }
        }
    }

    public setRedTan( arr:Array<string> ):void{
        for( let a of arr ) {
            if( a == "" ){
                continue;
            }
            let red = this.getRed( a );
            red.visible = true;
            red.ani1.play(0,true);
        }
    }

    public getRed( num:string ):ui.scene.hongtanUI{
        if( num == "10" || num == "11" ){
            let b:Laya.Button = this["s" + num];
            return <any>b.getChildByName( "red" );
        }else{
            let v = this.getView( this["s" + num] );
            return v.red;
        }
    }
}