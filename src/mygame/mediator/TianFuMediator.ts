import Mediator from "../../game/Mediator";
import { ui } from "../../ui/layaMaxUI";
import TianFuSession from "../session/TianFuSession";
import Tips from "../scene/Tips";
import App from "../../game/App";
import DataSession from "../session/DataSession";
import LogType from "../session/LogType";
import MyGameInit from "../MyGameInit";
import { SysTalentInfo } from "../config/SysConfig";

export default class TianFuMediator extends Mediator{

    public dataSession:DataSession = null;
    public tianFuSession:TianFuSession = null;
    
    public dataArr:Array<any> = [];

    constructor(){
        super();
        this.addData( "tianfu/PTkuang.png" , "tianfu/gongji.png"  , "tianfu/gongzi.png", 1 );
        this.addData( "tianfu/PTkuang.png" , "tianfu/sudu.png"    , "tianfu/yizi.png", 2 );
        this.addData( "tianfu/PTkuang.png" , "tianfu/xingyun.png" , "tianfu/xingzi.png", 3 );
    
        this.addData( "tianfu/JYkuang.png" , "tianfu/fangyu.png" , "tianfu/fangzi.png", 4 );
        this.addData( "tianfu/JYkuang.png" , "tianfu/shengming.png" , "tianfu/shengzi.png", 5 );
        this.addData( "tianfu/JYkuang.png" , "tianfu/jinbi.png" , "tianfu/diaozi.png", 6 );
    
        this.addData( "tianfu/SSkuang.png" , "tianfu/baoji.png" , "tianfu/baozi.png", 7 );
        this.addData( "tianfu/SSkuang.png" , "tianfu/lixian.png" , "tianfu/lizi.png", 8 );
        this.addData( "tianfu/SSkuang.png" , "tianfu/tiejiang.png" , "tianfu/tiezi.png", 9 );
    }

    private addData( bg:string , logo:string , font:string, id:number ):void{
        this.dataArr.push( { bg:bg , logo:logo , font:font , id:id } );
    }

    public dialog:ui.scene.TianFuDialogUI = null;

    public setSprite(sprite:Laya.Sprite):void{
        this.dialog = <any>sprite;
        this.dialog.list.renderHandler = new Laya.Handler( this,this.renderFun );
        this.dialog.list.selectHandler = new Laya.Handler( this,this.selectFun );
    }

    public selectFun(index:number):void{
        if( index == -1 ){
            this.dialog.tipBox.visible = false;
            return;
        }
        let lv = this.tianFuSession.lvArr[index];
        if( lv == 0 ){
            this.dialog.tipBox.visible = false;
        }else{
            this.dialog.tipBox.visible = true;
            let b = this.dialog.list.getCell(index);
            let p = b.localToGlobal( new Laya.Point(0,0) , true , this.dialog.box );
            this.dialog.tipBox.x = p.x - 130;
            this.dialog.tipBox.y = p.y + 200;
            let sys:SysTalentInfo = App.getConfig( MyGameInit.sys_talentinfo , (index + 1) );
            this.dialog.txt5.text = sys.talentInfo + ":" + this.tianFuSession.getTxt( index ) + "%";
        }
    }

    public renderFun( cell:ui.scene.TianFuCellUI , index:number ):void{
        let obj = this.dialog.list.getItem( index );
        cell.logo1.skin = obj.logo;
        cell.bg1.skin = obj.bg;
        cell.txtImg.skin = obj.font;
        let lv = this.tianFuSession.lvArr[index];
        cell.lv.value = lv + "";
        cell.box1.visible = cell.box2.visible = false;
        if( lv == 0 ){
            cell.box2.visible = true;
        }else{
            cell.box1.visible = true;
        } 
        cell.select.visible = (this.dialog.list.selectedIndex == index);
    }

    public init():void {
        this.dialog.list.array = this.dataArr;
        this.dialog.list.selectedIndex = -1;
        this.reset();
        this.dataSession.log( LogType.OPEN_TIANFU );
        this.dialog.tipBox.visible = false;
        this.onGOLD_UPDATE();
    }

    public reset():void{
        this.setLvText( this.tianFuSession.lvTimes );
        this.dialog.fc.value = this.tianFuSession.getLvUpGold() + "";
    }

    public setLvText( value:number ):void{
        this.dialog.lv.text = "已升级" + value + "次";
    }

    public btn_click():void {
        let stat = this.tianFuSession.lvUp();
        if( stat == -1 ){
            Tips.show("金币不够");
            App.dialog( MyGameInit.TimeGoldDialog , true );
            return;
        }else if( stat == -2 ){
            Tips.show("装备等级不够");
            App.dialog( MyGameInit.TreasureDialog , true );
            return;
        }
        this.mv( stat );
    }

    public mvTime:number = 4000;
    public mvValue:number = 0;
    public overIndex:number = 0;

    public mv( overIndex:number ):void{
        this.overIndex = overIndex;
        this.dialog.tipBox.visible = false;
        this.dialog.list.mouseEnabled = false;
        this.dialog.btn.mouseEnabled = false;
        this.mvValue = 0;
        this.nowIndex = 0;
        let t = new Laya.Tween();
        let target:number = 5000;
        t.to( this,{mvValue:target , update:new Laya.Handler(this,this.updateFun) },this.mvTime, Laya.Ease.cubicInOut,new Laya.Handler( this,this.mvComFun,[overIndex] ) );
    }

    public mvComFun( index:number ):void{
        this.mvFun( index );
        Laya.timer.once( 500 ,this,this.mvOverFun );
    }

    public mvOverFun():void{
        let sys = this.dataArr[this.overIndex];
        let o:any = {};
        o.type = 0;
        o.logo = sys.logo;
        o.txtImg = sys.font;

        App.dialog( MyGameInit.NewGetItemDialog , false , o );

        this.dialog.list.mouseEnabled = true;
        this.dialog.list.selectedIndex = -1;
        this.dialog.list.refresh();
        this.dialog.btn.mouseEnabled = true;
        this.reset();
        this.onGOLD_UPDATE();
    }

    public nowIndex:number = 0;

    public updateFun():void{
        let li = 40;
        if( this.nowIndex != Math.floor( this.mvValue/li ) ){
            let v = Math.floor( this.mvValue%9 );
            let n = Math.floor( Math.random() * 9 );
            this.mvFun( n );
            this.nowIndex = Math.floor( this.mvValue/li );
        }
    }

    public mvFun( v:number ):void {
        for( let i:number = 0; i < this.dialog.list.cells.length; i++ ){
            let c:ui.scene.TianFuCellUI = <any>this.dialog.list.cells[i];
            c.select.visible = (i == v);
        }
    }
    
    public onGOLD_UPDATE():void{
        this.dialog.btn.gray = !this.tianFuSession.check();// .checkGold();
    }

    getLoaderUrl():Array<string>{
        return ["res/atlas/tianfu.atlas"];
    }
}