import { ui } from "../../ui/layaMaxUI";
import Map2Array from "../../game/Map2Array";
import BattleSession, { EQUIP_TYPE } from "../session/BattleSession";
import { Equip, SysItem, Res, SysCompose } from "../config/SysConfig";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import MyArray from "../../game/MyArray";
import BagListCell from "./BagListCell";
import HeChengEffect from "./HeChengEffect";
import MyEffect from "../effect/MyEffect";
import BagSession, { GOLD_TYPE } from "../session/BagSession";
import MyClip from "../../game/MyClip";
import Tips from "./Tips";
import TianFuSession from "../session/TianFuSession";
import DataSession from "../session/DataSession";
import LogType from "../session/LogType";

export default class RoleDialog extends ui.scene.RoleDialogUI{
    private bagSession:BagSession = null;
    private tianFuSession:TianFuSession = null;
    private dataSession:DataSession = null;
    private battleSession:BattleSession = null;

    constructor(){
        super();
        App.getInstance().injOne(this);
        
        this.list.itemRender = BagListCell;
        this.list.renderHandler = new Laya.Handler( this,this.renderFun );
        this.tab.selectHandler = new Laya.Handler( this,this.tabChangeFun );
        this.list.selectHandler = new Laya.Handler( this,this.listSelectFun );
        this.tabIndex_equipType[0] = EQUIP_TYPE.WEAPON;
        this.tabIndex_equipType[1] = EQUIP_TYPE.HEAD;
        this.tabIndex_equipType[2] = EQUIP_TYPE.BODY;
        this.tabIndex_equipType[3] = EQUIP_TYPE.HORSE;
        this.tabIndex_equipType[4] = EQUIP_TYPE.PET;
        this.clearSelect();
        this.heibox.visible = false;
        this.sellpricebox.visible = false;
        this.sellBtn.clickHandler = new Laya.Handler(this,this.sellFun);
        
        this.equipBtn.clickHandler = new Laya.Handler( this,this.equipBtnFun );
        this.refreshPlayer();
        this.setCompare(null);

        this.once(Laya.Event.UNDISPLAY,this,this.undisFun);
    }

    public undisFun():void{
        Laya.stage.offAllCaller( this );
        Laya.timer.clearAll(this);
    }
    
    /**
     * 换装备
     */
    public equipBtnFun():void{
        let e = this.list.selectedItem;
        if( e == null ){
            return;
        }
        this.bagSession.equipEquip(e);
        this.refresh();
        this.refreshPlayer();
    }

    public refreshPlayer():void {
        this.bagSession.setPlayerEquip( this.playerMv );
        this.playerMv.wait.play();
        this.label0.text = this.bagSession.playerEquip.attack + "";
        this.label1.text = this.bagSession.playerEquip.crit + "";
        this.label2.text = this.bagSession.playerEquip.defense + "";
        this.label3.text = this.bagSession.playerEquip.move + "";
        this.label4.text = this.bagSession.playerEquip.hitPoint + "";

        this.refreshPet();
    }

    public refreshPet():void {
        let equip = this.bagSession.playerEquipArr[ EQUIP_TYPE.PET ];
        if( equip == null ){
            this.dataSession.log( LogType.CODE_ERROR , this.dataSession.saveKey );
            return;
        }
        this.petImg.skin = "player/all/" + equip.id + ".png";
    }

    public zhengliFun():void{
        this.bagSession.sortByType( this.tabIndex_equipType[this.tab.selectedIndex] );
        this.refresh();
    }

    public refresh():void{
        this.tabChangeFun( this.tab.selectedIndex );
        this.refreshPet();
    }

    public isSellMode:boolean = false;

    /**
     * 点击按钮变成售卖模式
     */
    public sellFun():void{
        if( this.sellEquipArr.arr.length > 0 ){
            //已经选中了某些装备
            let d = new ui.scene.SellDialogUI();
            d.popup();
            d.yesBtn.clickHandler = new Laya.Handler(this,this.sellYesFun);
            return;
        }
        this.sellEquipArr.clear();
        if( this.isSellMode ){
            this.isSellMode = false;
            this.heibox.visible = false;
            this.sellBox.mouseThrough = true;
            this.btnLabelImg.skin = "sence/btnfanmai.png";
            this.list.selectedIndex = -1;
        }else{
            this.sellBox.mouseThrough = false;
            this.isSellMode = true;
            this.heibox.visible = true;
            this.btnLabelImg.skin = "sence/quxiao.png";
            this.list.selectedIndex = -1;
        }
    }

    public sellYesFun():void{
        for( let i of this.sellEquipArr.arr ){
            let sys = <SysItem>i.getSysItem();
            this.bagSession.bagMap.deleteData( sys.itemType , i , 1 );
        }
        console.log( this.bagSession.bagMap );
        this.bagSession.changeGold( this.getSellPrice() , GOLD_TYPE.SELL );
        this.sellEquipArr.clear();
        this.resetData();
        this.changePrice();
    }

    public resetData():void{
        this.refresh();
    }

    /**
     * 改变售出价格
     */
    public changePrice():void{
        if( this.sellEquipArr.arr.length > 0 ){
            this.btnLabelImg.visible = false;
            this.sellpricebox.visible = true;
            this.priceFc.value = this.getSellPrice() + "";
        }else{
            this.sellpricebox.visible = false;
            this.btnLabelImg.visible = true;
            this.btnLabelImg.skin = "sence/quxiao.png";
            this.btnLabelImg.centerX = 0;
        }
    }

    public getSellPrice():number{
        let a:number = 0;
        for( let i of this.sellEquipArr.arr ){
            let sys:SysItem = <SysItem>App.getInstance().configManager.getConfig( MyGameInit.sys_item , i.id );
            a += sys.sellPrice;
        }
        return a;
    }

    public clearSelect():void{
        this.logoImg.skin = null;
        this.selectImg.skin = "sence/meiyoukuang.png";
        this.l1.text = "0"
        this.l2.text = "0"
        this.l3.text = "0";
        this.l4.text = "0";
        this.l5.text = "0";
        this.gailvlabel.text = "";
        this.setCompare(null);
    }

    /**
     * 选中某个装备 显示他的详细数据
     * @param index 
     */
    public listSelectFun(index:number):void{
        if( this.isSellMode ){
            return;
        }
    }

    public setSelectEquip( index:number ):void{
        let equip:Equip = this.list.getItem(index);
        if( equip == null ){
            this.clearSelect();
            return;
        }
        let cell:ui.scene.BagListCellUI = <any>this.list.getCell( index );
        MyEffect.clickEffect(cell.box);

        let sys:SysItem = <SysItem>App.getInstance().configManager.getConfig( MyGameInit.sys_item , equip.id );
        this.logoImg.skin = "icons/" + equip.id + ".png";
        this.selectImg.skin = Res.getItemBorder( sys.itemQuality );
        this.l1.text = equip.attack + "";
        this.l2.text = equip.crit + "";
        this.l3.text = equip.defense + "";
        this.l4.text = equip.move + "";
        this.l5.text = equip.hitPoint + "";
        let sysc = <SysCompose>App.getConfig( MyGameInit.sys_compose , sys.id );
        let suc = sysc.random + this.tianFuSession.mergeEquip;
        suc = Math.min( suc,100 );
        this.gailvlabel.text = "下一级合成成功率：" + suc + "%";
        this.setCompare( equip );
        //Laya.SoundManager.playSound("sound/fx_itemSelect.wav");
        App.getInstance().gameSoundManager.playEffect( "sound/fx_itemSelect.wav" );
    }

    public setCompare( equip:Equip ):void{
        if( equip == null ){
            this.al0.text = "";
            this.al1.text = "";
            this.al2.text = "";
            this.al3.text = "";
            this.al4.text = "";
        }else{
            let e = this.bagSession.compare(equip);
            this.setCompareColor( this.al0 , e.attack );
            this.setCompareColor( this.al1 , e.crit );
            this.setCompareColor( this.al2 , e.defense );
            this.setCompareColor( this.al3 , e.move );
            this.setCompareColor( this.al4 , e.hitPoint );
        }
    }

    private setCompareColor( t:Laya.Text , value:number ):void{
        if( value == 0 ){
            t.text = "";
        }else{
            if( value < 0 ){
                t.text = "(" + value + ")";    
                t.color = "#ff0000";
            }else{
                t.text = "(+" + value + ")";
                t.color = "#00ff00";
            }
        }
    }

    public tabIndex_equipType:any = {};

    /**
     * @param index 切换tab标签
     */
    public tabChangeFun(index:number):void{
        this.list.selectedIndex = -1;
        let equipType:number = this.tabIndex_equipType[index];
        let a = this.dataMap.getData( equipType );
        let b = a.concat();
        b.length = 16;
        this.list.array = b;
        this.bagSession.deleteRed( equipType );
        if( equipType == EQUIP_TYPE.PET ){
            this.eggBox.visible = true;
            this.selectImg.visible = false;
            this.chuZhanSp.visible = true;
            this.zhuanBeiSp.visible = false;
        }else{
            this.eggBox.visible = false;
            this.selectImg.visible = true;
            this.chuZhanSp.visible = false;
            this.zhuanBeiSp.visible = true;
        }
    }

    /**
     * 售卖模式 点击装备
     */
    public clickFun(cell:BagListCell , index:number ):void{
        if( this.isSellMode == false ){
            this.setSelectEquip( index );
            return;
        }
        //售卖模式可以多选
        let item = this.list.getItem(index);
        if( item != null && item.isEquip ){
            return;
        }
        this.sellEquipArr.pushOrDelete( item );
        this.list.array = this.list.array;
        this.changePrice();
    }

    public sellEquipArr:MyArray = new MyArray();

    public renderFun(cell:BagListCell ,index:number):void{
        let e:Equip = this.list.getItem(index);
        let isSelect = false;
        if( this.isSellMode ){
            isSelect = this.sellEquipArr.contain( e );
        }else{
            isSelect = ( this.list.selectedIndex == index );
        }
        cell.gridIndex = index;
        cell.setEquip( e, isSelect ,this.isSellMode );
        cell.on( Laya.Event.CLICK ,this, this.clickFun , [cell , index] );
        cell.on( Laya.Event.MOUSE_DOWN , this, this.mouseDown , [e,cell] );
    }

    public mouseDown(e:Equip,bagCell:BagListCell):void{
        if( e == null ){
            return;
        }
        if( this.isSellMode ){
            return;
        }
        if( e.lv == BagSession.MAX_LV ){
            return;
        }
        this.startPo.x = Laya.stage.mouseX;
        this.startPo.y = Laya.stage.mouseY;
        Laya.stage.on(Laya.Event.MOUSE_MOVE,this,this.mouseMove,[e,bagCell]);
        Laya.stage.once(Laya.Event.MOUSE_UP , this,this.mouseUpFun2);
    }

    public startPo:Laya.Point = new Laya.Point();

    public mouseUpFun2():void{
        this.clearMouse();
    }
    
    /**
     * 必须移动一下 不然点一下就出效果了
     */
    public mouseMove(e:Equip,bagCell:BagListCell):void{
        if( this.startPo.distance( Laya.stage.mouseX , Laya.stage.mouseY ) < 20 ){
            return;
        }
        this.clearMouse();
        this.startDragFun(e,bagCell);
    }

    public startDragFun(e:Equip,bagCell:BagListCell):void{
        if( e == null ){
            return;
        }
        if( e.isEquip ){
            return;
        }
        let cell = new BagListCell();
        cell.gridIndex = bagCell.gridIndex;
        cell.setEquip( e,false,false );
        Laya.stage.addChild(cell);
        let p = bagCell.localToGlobal(new Laya.Point(0,0));
        cell.x = p.x + cell.width/2;
        cell.y = p.y + cell.height/2;
        cell.startDrag();
        cell.anchorX = 0.5;
        cell.anchorY = 0.5;
        cell.zOrder = 1000;
        this.mouseEnabled = false;
        bagCell.alpha = 0.6;
        Laya.stage.once(Laya.Event.MOUSE_UP , this,this.mouseUpFun,[  bagCell,cell ]);
        Laya.stage.on( Laya.Event.MOUSE_OUT , this,this.mouseUpFun,[  bagCell,cell ] );
        this.canHeChengEffect(e);
    }

    /**
     * 播放可以合成的特效
     */
    public canHeChengEffect(e:Equip):void{
        let a = this.list.cells;
        for ( let i of a ){
            let ii = <BagListCell><any>i;
            if( ii.equip && ii.equip.id == e.id ){
                if( e != ii.equip ){
                    ii.playEffect();
                }
            }
        }
    }

    public closeHeChengEffect():void{
        let a = this.list.cells;
        for ( let i of a ){
            let ii = <BagListCell><any>i;
            ii.stopEffect();
        }
    }
    
    public mouseUpFun(oldCell:BagListCell , dragCell:BagListCell):void{
        oldCell.alpha = 1;
        this.mouseEnabled = true;
        dragCell.stopDrag();
        dragCell.removeSelf();
        this.clearMouse();
        this.checkSynthetic( dragCell );
        this.closeHeChengEffect();
    }

    /**
     * 合成 碰撞检测 拖拽的方块碰到中心点
     */
    public checkSynthetic( cell:BagListCell ){
        for( let i of this.list.cells ){
            let p = i.localToGlobal( new Laya.Point( i.width/2 ,i.height/2) );
            if( cell.hitTestPoint(p.x,p.y) ){
                this.checkGridIndex( cell.gridIndex , i["gridIndex"] );
                return;
            }
        }
    }

    /**
     * 检测能否合成
     * @param oldIndex 
     * @param newIndex 
     */
    public checkGridIndex( dragIndex:number , newIndex:number ):void{
        if( dragIndex == newIndex ){
            return;
        }
        let a = this.list.getItem( dragIndex );
        let b = this.list.getItem( newIndex );
        if( a == null || b == null ){
            return;
        }
        if( a.id != b.id ){
            return;
        }
        
        if( a.lv == BagSession.MAX_LV ){
            Tips.show("暂未开启" + BagSession.MAX_LV + "级装备，敬请期待");
            return;
        }
        let mergeEquip = this.bagSession.mergeEquip( a,b );
        let cell = this.list.getCell( newIndex );
        let p = cell.localToGlobal( new Laya.Point(cell.width/2,cell.height/2) , true , this );//cell.width/2,cell.height/2
        //mergeEquip = null;
        if( mergeEquip == null ){
            //合成失败
            let fail = new ui.scene.MergeFailEffectViewUI();
            let myClip = new MyClip();
            //Laya.stage.addChild( fail );
            this.addChild( fail );
            myClip.setClip( fail.clip );
            myClip.removeSp = fail;
            myClip.playOnceAndRemove();
            fail.zOrder = 1001;
            fail.anchorX = fail.anchorY = 0.5;
            fail.pos( p.x , p.y );
        }else{
            let h = new HeChengEffect();
            h.anchorX = 0.5;
            h.anchorY = 0.5;
            this.addChild( h );
            //Laya.stage.addChild( h );
            h.pos( p.x , p.y );
            h.zOrder = 1001;
            h.play( a.getSysItem(), mergeEquip.getSysItem() );
        }
        this.refresh();
    }

    public static HAVE_AD_STAGE_5:boolean = false;

    public clearMouse():void{        
        Laya.stage.offAllCaller( this );
    }

    public dataMap:Map2Array;

    public setData(map:Map2Array):void{
        this.dataMap = map;
        this.tab.selectedIndex = -1;
        this.tab.selectedIndex = 0;
    }
}