import Mediator from "../../game/Mediator";
import { ui } from "../../ui/layaMaxUI";
import BagSession from "../session/BagSession";
import { EQUIP_TYPE } from "../session/BattleSession";
import App from "../../game/App";
import { Res, SysItem } from "../config/SysConfig";
import MyGameInit from "../MyGameInit";
import SdkSession from "../session/SdkSession";
import RotationEffect from "../scene/RotationEffect";
import MyEvent from "../MyEvent";
import DataSession from "../session/DataSession";
import LogType from "../session/LogType";

export default class ZhuanMediator extends Mediator{
    public bagSession:BagSession = null;
    public sdkSession:SdkSession = null;
    public dataSession:DataSession = null;

    constructor(){
        super();
    }

    public dialog:ui.scene.ZhuanUI;
    public arr:Array<ui.scene.ZhuanCellUI> = [];
    
    setSprite( sp:Laya.Sprite ):void{
        this.dialog = <any>sp;
        this.arr.push( this.dialog.s0 );
        this.arr.push( this.dialog.s1 );
        this.arr.push( this.dialog.s2 );
        this.arr.push( this.dialog.s3 );
        this.arr.push( this.dialog.s4 );
        this.arr.push( this.dialog.s5 );
    }

    public badEquipId:number = 0;

    setParam( p ):void{
        this.badEquipId = p;
    }

    init():void{
        //let arr = this.bagSession.badId.concat();
        let arr = [ String(this.badEquipId) ];
        if( arr.length < 6 ){
            let num = 6 - arr.length;
            for( let i:number = 0; i < num; i++ ){
                arr.push( this.getNewId() + "" );
            }
        }
        this.setArr( arr );

        this.dataSession.log( LogType.OPEN_ZHUAN );

        this.dialog.once( Laya.Event.UNDISPLAY , this, this.undisFun );
    }

    public undisFun():void{
        this.dataSession.log( LogType.CLOSE_ZHUAN_PAN );
    }

    public dataArr:Array<string>;

    public setArr( arr1:Array<string> ):void{
        this.dataArr = arr1;
        for( let i:number=0; i < this.arr.length; i++ ){
            let sp:ui.scene.ZhuanCellUI = this.arr[i];
            let itemId:number = parseInt( arr1[i] );
            sp.logo.skin = Res.getItemUrl( itemId );
            let sys:SysItem = App.getConfig( MyGameInit.sys_item,itemId );
            sp.s0.skin = Res.getItemBorder( sys.itemQuality );
            sp.fc.value = sys.itemLevel + "";
        }
    }

    public getNewId():number{
        let arr:Array<number> = [200001 , 300001  , 400001 , 500001 , 600001];
        return App.RandomByArray(arr);
    }

    public adBtn_click():void{
        this.sdkSession.playAdVideo( SdkSession.ZHUAN , new Laya.Handler( this, this.adFun ) );
    }

    public adFun(){
        this.play();
    }

    public play():void{
        this.dialog.adBtn.disabled = true;
        
        this.dialog.img.rotation = this.dialog.img.rotation%360;
        let arr:Array<number> = [0,1,2,3,4,5];
        let a = App.RandomByArray(arr);
        let itemId = this.dataArr[a];
        
        if( this.bagSession.badId[a] != null ){
            this.bagSession.badId.splice(a,1);
        }
        
        let max = -10 * 360 - a * 60 -30;
        let t = new Laya.Tween();
        t.to( this.dialog.img , {rotation:max} , 4000 , Laya.Ease.cubicOut , new Laya.Handler( this,this.comFun,[itemId] ) );
    }
    
    public comFun( itemId:number ):void {
        let sys = App.getConfig( MyGameInit.sys_item , itemId );
        this.bagSession.addEquipInBagBySys( sys );
        App.dialog( MyGameInit.NewGetItemDialog , true , sys );
        //App.getInstance().eventManager.once( MyEvent.GET_GOLD_CLOSE , this, this.onCloseFun );
        this.dialog.adBtn.disabled = false;
        this.dataSession.log( LogType.AD_ZHUAN );
    }

    public onCloseFun():void{
        this.init();
    }
}