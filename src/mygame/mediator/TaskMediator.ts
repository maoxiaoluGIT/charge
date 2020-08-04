import Mediator from "../../game/Mediator";
import TaskSession, { TaskData } from "../session/TaskSession";
import { ui } from "../../ui/layaMaxUI";
import { SysMission } from "../config/SysConfig";
import DataSession from "../session/DataSession";
import LogType from "../session/LogType";
import SdkSession from "../session/SdkSession";
import RotationEffect from "../scene/RotationEffect";

export default class TaskMediator extends Mediator{
    public taskSession:TaskSession = null;
    public dataSession:DataSession = null;
    public sdkSession:SdkSession = null;

    constructor(){
        super();
    }

    public dialog:ui.scene.TaskDialogUI;

    public setSprite(sp:Laya.Sprite):void{
        this.dialog = <any>sp;
        this.dialog.list1.renderHandler = new Laya.Handler(this,this.renderFun,[this.dialog.list1]);
        this.dialog.list2.renderHandler = new Laya.Handler(this,this.renderFun,[this.dialog.list2]);
        this.dialog.tab.selectHandler = new Laya.Handler( this,this.selectFun );
        this.dialog.list2.vScrollBarSkin = "";
    }

    public selectFun():void{
        if( this.dialog.tab.selectedIndex == -1 ){
            return;
        }
        this.dialog.list2.scrollTo(0);
        this.onTASK_UPDATE();
    }

    public init():void{
        this.dialog.tab.selectedIndex = -1;
        this.dialog.tab.selectedIndex = 0;

        this.dataSession.log( LogType.OPEN_TASK );
    }

    public renderFun( list:Laya.List , cell:ui.scene.TaskCellUI , index:number ):void{
        let sys = <SysMission>list.getItem( index );
        let td = this.taskSession.getTaskData( sys.id );
        let disNow:number = 0;
        if( td.now == -1 ){
            disNow = sys.max;
        }else{
            disNow = Math.min( td.now , sys.max );//now可能会超
        }
        cell.fc1.value = disNow + "";
        cell.fc2.value = sys.max + "";
        cell.t1.text = sys.missionTxt;
        cell.nei.visible = !(disNow == 0);
        if( cell.nei.visible ){
            cell.nei.scrollRect = new Laya.Rectangle( 0,0,cell.nei.width * ( disNow / sys.max ) , cell.nei.height );
        }
        if( td.now == -1 ){
            cell.lingqu.skin = "renwu/yilingquzi.png";
            cell.btn.disabled = false;
            cell.btn.mouseEnabled = false;
            cell.ani1.gotoAndStop(0);
        }else{
            cell.lingqu.skin = "renwu/lingquzi.png";
            cell.btn.disabled = td.now < sys.max;
            if( td.now >= sys.max ){
                cell.ani1.play( 0 , true );
                cell.btn.mouseEnabled = true;
            }else{
                cell.ani1.gotoAndStop(0);
                cell.btn.mouseEnabled = false;
            }
        }
        cell.btn.clickHandler = new Laya.Handler(this,this.clickFun,[sys.id,sys.gold]);
    }

    public clickId:number = 0;
    public nowR:ui.scene.TaskRewardUI = null;

    public clickFun( id:number ,gold:number ):void {
        this.clickId = id;
        let a = new ui.scene.TaskRewardUI();
        this.nowR = a;
        RotationEffect.play( a.light );
        a.popup(false);
        a.goldFc.value = gold + "";
        a.btn1Fc.value = gold + "";
        a.btn2Fc.value = (gold * 3) + "";
        a.LingBtn.clickHandler = new Laya.Handler( this,this.l1Fun,[id] );
        a.AdLingBtn.clickHandler = new Laya.Handler( this,this.l2Fun,[id] );
    }

    public l1Fun(id:number):void{
        this.nowR.close();
        this.taskSession.overTask( id );
    }
    
    public l2Fun(id:number):void{
        this.sdkSession.playAdVideo( SdkSession.TASK_REWARD ,new Laya.Handler(this,this.adFun) );
    }

    public adFun():void{
        this.nowR.close();
        this.taskSession.overTask( this.clickId , 3 );
    }

    public onTASK_UPDATE():void{
        this.dialog.list1.array = this.taskSession.getDayTask();
        if( this.dialog.tab.selectedIndex == 0 ){
            this.dialog.list2.array = this.taskSession.getAchievementTask( true );
        }else{
            this.dialog.list2.array = this.taskSession.getAchievementTask( false );
        }
    }

    public getLoaderUrl():Array<string>{
        return ["res/atlas/renwu.atlas"];
    }
}