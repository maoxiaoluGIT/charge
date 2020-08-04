import Mediator from "../../game/Mediator";
import DataSession from "../session/DataSession";
import { ui } from "../../ui/layaMaxUI";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import SdkSession from "../session/SdkSession";

export default class RankMediator extends Mediator{
    public dataSession:DataSession = null;
    public dialog:ui.scene.RankDialogUI;
    public sdkSession:SdkSession = null;

    constructor(){
        super();
    }

    public setSprite( a:Laya.Sprite ):void{
        this.dialog = <any>a;
        this.dialog.isShowEffect = false;
    }

    public init():void {
        this.dialog.list.vScrollBarSkin = "";
        this.dialog.tab.selectHandler = new Laya.Handler( this,this.selectFun );
        this.dialog.tab.selectedIndex = -1;
        this.dialog.tab.selectedIndex = 0;
        this.dialog.list.renderHandler = new Laya.Handler( this,this.renderFun );
        this.dialog.list.selectEnable = true;
        this.dialog.list.selectHandler = new Laya.Handler( this,this.listSelectFun );
        if( Laya.Browser.onMiniGame == false ){
            return;
        }
        if( this.sdkSession.haveRight ){
            return;    
        }else{
            this.dialog.tab.disabled = true;   
            Laya.timer.callLater( this,this.shouQuan );
        }
    }

    public shouQuan():void{
        this.sdkSession.addUserInfoBtn( <any>this.dialog.tab , new Laya.Handler(this,this.useFun ) );
    }

    /**
     * 授权成功
     */
    public useFun():void {
        this.dataSession.saveRank();
        this.dialog.tab.disabled = false;
        this.dialog.tab.selectedIndex = 1;
    }

    public listSelectFun(index:number):void{
        if( index == -1 ){
            return;
        }
        let obj = this.dialog.list.getItem(index);
        App.dialog( MyGameInit.RANK_INFO , false , obj );
        this.dialog.list.selectedIndex = -1;
    }

    public rankSkin:Array<string> = ["rank/jinpai.png","rank/tongpai.png","rank/yinpai.png"];

    public renderFun(cell:ui.scene.RankCellUI,index:number):void{
        cell.bg.visible = false;
        let obj = this.dialog.list.getItem(index);
        cell.jifen.value = parseInt( obj.score + "" ) + "";
        cell.mingzi.text = obj.name;
        let rank = parseInt( obj.rank );
        cell.img.skin = obj.url;
        if( rank < 3 ){
            cell.title.visible = true;
            cell.mingci.visible = false;
            cell.title.skin = this.rankSkin[rank];
        }else{
            cell.title.visible = false;
            cell.mingci.visible = true;
            cell.mingci.value = (rank + 1) + "";
        }
    }

    public selectFun( index:number ):void{
        if( index == -1 ){
            return;
        }
        this["tab" + index]();
    }

    public tab0():void {
        this.dialog.wxopen.visible = true;
        this.dialog.list.visible = false;
        this.dialog.myText.visible = false;
        if( Laya.Browser.onMiniGame == false ){
            return;
        }
        var obj:any = {};
        obj.type = 0;
        obj.openId = this.dataSession.saveKey;
        Laya.Browser.window.wx.getOpenDataContext().postMessage(obj);
    }

    public tab1():void {
        this.dialog.list.array = [];
        this.dialog.wxopen.visible = false;
        this.dialog.list.visible = true;
        this.dialog.myText.visible = true;
        this.dataSession.getRank( this, this.rankFun );
    }

    public rankFun( str:string ):void{
        if( this.dialog.tab.selectedIndex != 1 ){
            return;
        }
        //console.log( "排行榜服务器返回的字符串是" , str );
        let obj = JSON.parse( str );
        let myobj = obj.my;
        let arr:Array<any> = obj.list;
        
        //this.sortList(arr);
        this.dialog.list.array = arr;

        let rank = parseInt(myobj.rank) + 1;
        this.dialog.myText.text = "当前排名:" + rank;
    }

    public sortList( arr:Array<any> ):void{
        // let obj = this.dialog.list.getItem(index);
        // cell.jifen.value = parseInt( obj.score + "" ) + "";
        // cell.mingzi.text = obj.name;
        // let rank = parseInt( obj.rank );
        // cell.img.skin = obj.url;
        arr.sort( this.sortFun );
        for( let i:number = 0; i < arr.length; i++ ){
            arr[i].rank = i;
        }
    }

    private sortFun( a , b ):number{
        return parseInt(b.score) - parseInt(a.score);
    }
}