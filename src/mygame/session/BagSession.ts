import Session from "../../game/Session";
import Map2Array from "../../game/Map2Array";
import BattleSession, { EQUIP_TYPE } from "./BattleSession";
import { Equip, SysItem, SysCompose, SysSkill } from "../config/SysConfig";
import App from "../../game/App";
import GameEvent from "../../game/GameEvent";
import MyGameInit from "../MyGameInit";
import MyEvent from "../MyEvent";
import { ui } from "../../ui/layaMaxUI";
import DataSession from "./DataSession";
import NewerSession from "./NewerSession";
import PetSession from "./PetSession";
import Tips from "../scene/Tips";
import TianFuSession from "./TianFuSession";
import RoleDialog from "../scene/RoleDialog";

export default class BagSession extends Session {

    public dataSession:DataSession = null;
    public newerSession:NewerSession = null;
    public canAddred:boolean = true;
    public battleSession:BattleSession = null;

    constructor() {
        super();
        this.initBagMap();
        this.buffEquip.reset1();
    }

    public initBagMap():void{
        this.bagMap.getData( EQUIP_TYPE.WEAPON );
        this.bagMap.getData( EQUIP_TYPE.BODY );
        this.bagMap.getData( EQUIP_TYPE.HEAD );
        this.bagMap.getData( EQUIP_TYPE.HORSE );
        this.bagMap.getData( EQUIP_TYPE.PET );
    }

    public onCONFIG_OVER():void {
        let arr: Array<SysItem> = App.getInstance().configManager.getDataArr(MyGameInit.sys_item);
        for (let i of arr) {
            this.sysMap.setData(i.itemType, i);
        }
    }

    /**
     * 初始化9级装备
     */
    public onNEWER_INIT():void {
        this.canAddred = false;
        this.initPlayerEquipNewer();
    }

    /**
     * 新手引导结束
     */
    public onNEWER_OVER():void {
        //清空背包
        this.bagMap.map = {};
        this.initBagMap();
        this.playerEquipArr.length = 0;
        this.initPlayerEquip();
        this.canAddred = true;
    }
    
    public gold:number = 1;

    /**
     * 
     * @param value 金币改变
     */
    public changeGold( value:number , type:number ):void{
        if( value == null ){
            value = 0;
        }
        let old = this.gold;
        this.gold += value;
        App.sendEvent( MyEvent.GOLD_UPDATE , [ old ,this.gold , type] );
    }

    public initPlayerEquipNewer():void{
        this.addPlayerEquip( EQUIP_TYPE.WEAPON , 9 );
        this.addPlayerEquip( EQUIP_TYPE.BODY , 9 );
        this.addPlayerEquip( EQUIP_TYPE.HEAD , 9);
        this.addPlayerEquip( EQUIP_TYPE.HORSE , 9);
        this.addPlayerEquip( EQUIP_TYPE.PET, 9 );
        this.resetEquip();
    }

    /**
     * 进入游戏
     */
    public onDATA_FROM_SERVER():void{
        this.resetEquip();
    }

    /**
     * 初始化玩家装备
     */
    public initPlayerEquip():void 
    {
        this.addPlayerEquip( EQUIP_TYPE.WEAPON ,1 );
        this.addPlayerEquip( EQUIP_TYPE.BODY ,1);
        this.addPlayerEquip( EQUIP_TYPE.HEAD ,1);
        this.addPlayerEquip( EQUIP_TYPE.HORSE,1 );
        this.addPlayerEquip( EQUIP_TYPE.PET ,1 );
        this.resetEquip();
    }

    /**
     * 添加某个部位的初始化装备
     * @param type 
     */
    public addPlayerEquip( type:EQUIP_TYPE , lv:number ):void{
        let a = this.getNewItem( type , lv );
        this.equipEquip(a);
        this.addEquipInBag(a);
    }

    /**
     * 装备装备
     * @param equip 
     */
    public equipEquip( equip:Equip ):void{
        //卸载旧的
        let old = this.playerEquipArr[ equip.type ];
        if( old ){
            old.isEquip = false;
        }
        this.playerEquipArr[ equip.type ] = equip;
        equip.isEquip = true;
        App.sendEvent(MyEvent.EQUIP_UPDATE);
        this.resetEquip();
        Laya.timer.callLater( this,this.nextSaveRankFun );
    }

    public nextSaveRankFun():void{
        this.dataSession.saveRank();
    }

    public compare( equip:Equip ):Equip{
        let old = this.playerEquip.copy();
        let e = this.playerEquip.copy();
        let noweq = this.playerEquipArr[equip.type];
        e.reduce(noweq);
        e.add(equip);
        e.reduce( old );
        return e;
    }

    /**
     * 配置文件分组
     */
    public sysMap: Map2Array = new Map2Array();
    /**
     * 玩家背包
     */
    public bagMap:Map2Array = new Map2Array();
    /**
     * 玩家穿上装备后的所有属性
     */
    public playerEquip:Equip = new Equip();
    /**
     * 玩家装备数组
     */
    public playerEquipArr:Array<Equip> = [];
    /**
     * 红点
     */
    public redMap:any = {};

    public getBagNum( type:number ):number{
        let a = 0;
        let arr = this.bagMap.getData(type);
        for( let i:number = 0 ; i < arr.length; i++ ){
            if( arr[i] == null ){
                a++;
            }
        }
        return a;
    }

    public haveNewEquip():boolean{
        let arr:Array<number> = [ EQUIP_TYPE.WEAPON,EQUIP_TYPE.HEAD,EQUIP_TYPE.BODY,EQUIP_TYPE.HORSE];
        if( this.petSession.eggNum > 0 ){
            return true;
        }
        for ( let a of arr ){
            if( this.redMap[a] != null ){
                return true;
            }
        }
        return false;
    }

    public petSession:PetSession = null;

    public haveNewPet():boolean{
        return this.petSession.eggNum > 0;
    }

    /**
     * @param equip 添加一件装备到背包里
     */
    public addEquipInBag(equip: Equip , toIndex:number = -1 ): boolean {
        let arr = this.bagMap.getData( equip.type );
        arr.length = BagSession.BAG_LENGTH;
        if( toIndex == -1 ){
            toIndex = this.getFirstNull( equip.type );
            if( toIndex == -1 ){
                return false;
            }
        }
        arr[toIndex] = equip;
        this.addRed( equip.type );
        Laya.timer.callLater( this, this.nextFun2 );
        App.sendEvent( MyEvent.EQUIP_LV_NUM , equip.lv );
        return true;
    }

    public getFirstNull( type:number ):number{
        let arr = this.bagMap.getData( type );
        arr.length = BagSession.BAG_LENGTH;
        for( let i:number = 0; i < arr.length; i++ ){
            if( arr[i] == null ){
                return i;
            }
        }
        return -1;
    }

    public nextFun2():void{
        this.nextFun();
        App.sendEvent(MyEvent.BAG_UPDATE);
    }

    public isFull(type:number):boolean {
        let arr = this.bagMap.getData( type );
        arr.length = BagSession.BAG_LENGTH;
        for( let i:number = 0; i < arr.length; i++ ){
            if( arr[i] == null ){
                return false;
            }
        }
        return true;
    }

    public addRed(type:number):void{
        if( this.newerSession.isNew ){
            return;
        }
        if( this.canAddred == false ){
            return;
        }
        this.redMap[type] = 1;
        App.sendEvent(MyEvent.RED_UPDATE);
    }

    public deleteRed(type:number):void{
        this.redMap[type] = null;
        App.sendEvent(MyEvent.RED_UPDATE);
    }

    public nextFun():void{
        this.dataSession.saveData();
    }

    public static BAG_LENGTH:number = 16;

    public addEquipInBagBySys( sys:SysItem ):boolean{
        let e = this.getEquipBySys(sys);
        return this.addEquipInBag( e );
    }

    public getEquipBySys( sys:SysItem ):Equip{
        let e = new Equip();
        e.type = sys.itemType;
        e.lv = sys.itemLevel;
        e.id = sys.id;
        e.attack = sys.attack;
        e.defense = sys.defense;
        e.move = sys.move;
        e.hitPoint = sys.hitPoint;
        e.crit = sys.crit;
        return e;
    }

    /**
     * 重新计算玩家属性
     */
    public resetEquip():void {
        this.playerEquip.reset();
        for( let i of this.playerEquipArr ){
            if( i == null ){
                continue;
            }
            this.playerEquip.add( i );
        }
        let buff = this.buffEquip.copy();
        let talent = this.tianFuSession.equip.copyPercent();
        buff.add( talent );
        this.playerEquip.multiply( buff );
        App.sendEvent( MyEvent.ATTRIBUTE_UPDATE );
    }

    public tianFuSession:TianFuSession = null;

    public resetBuffByType( type:number ):void{
        let pname:string = "";
        if( type == EQUIP_TYPE.BUFF_ATT ){
            pname = "attack";
        }else if( type == EQUIP_TYPE.BUFF_CRIT )  {
            pname = "crit";
        }else if( type == EQUIP_TYPE.BUFF_DEF ){
            pname = "defense";
        }else if( type == EQUIP_TYPE.BUFF_SPEED ){
            pname = "move";
        }
        this.buffEquip[pname] = 1;
    }

    public setBuffer( type:number ):void{
        let skillId:number = 0;
        let pname:string = "";
        if( type == EQUIP_TYPE.BUFF_ATT ){
            skillId = 3;
            pname = "attack";
        }else if( type == EQUIP_TYPE.BUFF_CRIT )  {
            skillId = 4;
            pname = "crit";
        }else if( type == EQUIP_TYPE.BUFF_DEF ){
            skillId = 5;
            pname = "defense";
        }else if( type == EQUIP_TYPE.BUFF_SPEED ){
            skillId = 6;
            pname = "move";
        }
        let sysSkill:SysSkill = App.getConfig( MyGameInit.sys_skill , skillId );
        let per = sysSkill.skillStatus/100;
        this.buffEquip[pname] += per;
        this.resetEquip();
    }

    public buffEquip:Equip = new Equip();

    public static MAX_LV = 26;

    /**
     * 合成装备
     * @param dragEquip1 拖拽的装备 他会被删除
     * @param changeEquip 数据被改变的装备
     * @return 返回null 代表合成失败
     */
    public mergeEquip(dragEquip: Equip, changeEquip: Equip): Equip 
    {
        if( dragEquip.lv == BagSession.MAX_LV  || changeEquip.lv == BagSession.MAX_LV ){
            Tips.show("暂未开启" + BagSession.MAX_LV + "级装备，敬请期待");
            return null;
        }
        let maxLv = this.getMaxLv( changeEquip.type );
        let res:boolean = false;
        let sys:SysCompose = <SysCompose>App.getConfig( MyGameInit.sys_compose, dragEquip.id );
        let r = Math.random() * 100;
        let resEquip:Equip = null;
        if( this.newerSession.isNew ){
            r = 0;
        }
        console.log( "合成概率是:" , r , sys.random );
        if( r < ( sys.random + this.tianFuSession.mergeEquip ) ){
            //合成成功
            let sysitem:SysItem = App.getConfig(MyGameInit.sys_item , sys.item2 );
            resEquip = this.getNewItem( dragEquip.type , sysitem.itemLevel );
            changeEquip.attack = resEquip.attack;
            changeEquip.defense = resEquip.defense;
            changeEquip.crit = resEquip.crit;
            changeEquip.hitPoint = resEquip.hitPoint;
            changeEquip.move = resEquip.move;
            changeEquip.lv = sysitem.itemLevel;
            changeEquip.id = sysitem.id;
            //Laya.SoundManager.playSound("sound/fx_itemGood.wav");
            App.getInstance().gameSoundManager.playEffect( "sound/fx_itemGood.wav" );
            
            if( this.newerSession.isNew == false ){
                App.sendEvent( MyEvent.MERGE );
                
                //RoleDialog.HAVE_AD_STAGE_5 == false && this.battleSession.stageNum == 5

                let target = 0;

                if( this.battleSession.stageNum <= 5 ){
                    target = 20;
                }else if( this.battleSession.stageNum <= 10 ){
                    target = 10;
                }else{
                    target = 5;
                }
                if( (Math.random() * 100) < target ){
                    App.dialog( MyGameInit.AD_MERGE_DIALOG , false, changeEquip );
                    RoleDialog.HAVE_AD_STAGE_5 = true;
                }else{
                    if( changeEquip.lv > maxLv ){
                        App.dialog( MyGameInit.SHARE_MERGE_DIALOG , false , changeEquip );
                    }
                }
            }
        }else{
            //Laya.SoundManager.playSound("sound/fx_itemBad.wav");
            App.getInstance().gameSoundManager.playEffect( "sound/fx_itemBad.wav" );
            this.addBadEquip( dragEquip.id );
            // Laya.timer.once( 500 , null , ()=>{
                
            // } );
            Tips.show("合成失败");
            App.dialog( MyGameInit.ZHUAN , true, dragEquip.id );
        }

        //无论合成成功还是失败 被拖拽的物品都消失
        this.bagMap.deleteData( dragEquip.type ,dragEquip ,1 );
        this.resetEquip();
        App.sendEvent(MyEvent.EQUIP_UPDATE);
        App.sendEvent(MyEvent.MERGE_EQUIP);
        Laya.timer.callLater( this, this.nextFun );
        if( changeEquip.isEquip ){
            this.dataSession.saveRank();
        }
        return resEquip;
    }

    public getMaxLv( type:number ):number{
        let arr = this.bagMap.getData(type);
        let elv:number = 0;
        for( let a of arr ){
            if( a ) {
                elv = Math.max( a.lv ,  elv );
            }
        }
        return elv;
    }

    public badId:Array<string> = [];

    public addBadEquip( id:number ):void{
        return;
        if( this.badId.length >= 6 ){
            this.badId.shift();
        }
        this.badId.push( id + "" );
    }

    public deleteBad(id:number):void{
        let a = this.badId.indexOf( id + "" );
        this.badId.splice( a , 1 );
    }

    public getBadString():string{
        return this.badId.join(",");
    }

    public setBadString( str:string ):void{
        if( str == null || str == "" ){
            return;
        }
        this.badId = str.split(",");
    }

    public getNewItemByLv( lv:number ):Equip {
        //,EQUIP_TYPE.PET
        let typeArr:Array<number> = [ EQUIP_TYPE.BODY , EQUIP_TYPE.WEAPON ,EQUIP_TYPE.HEAD ,EQUIP_TYPE.HORSE ];
        let etype = App.RandomByArray( typeArr );
        return this.getNewItem( etype , lv );
    }

    /**
     * 生成新装备
     * @param type  部位
     * @param lv 等级 从1开始 根据配置表走
     */
    public getNewItem( type:EQUIP_TYPE , lv:number ):Equip{
        let ressys = new Equip();
        ressys.type = type;
        ressys.lv = lv;
        let sys:SysItem = this.sysMap.getData( type )[lv-1];
        ressys.id = sys.id;
        
        ressys.attack = sys.attack;
        ressys.defense = sys.defense;
        ressys.crit = sys.crit;
        ressys.hitPoint = sys.hitPoint;
        ressys.move = sys.move;
        return ressys;
    }
    
    /**
     * @param type 得到主文件的属性名
     */
    public getMain( type:EQUIP_TYPE ):string{
        if( type == EQUIP_TYPE.WEAPON ){
            return "attack";
        }else if( type == EQUIP_TYPE.HEAD ){
            return "defense";
        }else if( type == EQUIP_TYPE.BODY ){
            return "hitPoint";
        }else if( type == EQUIP_TYPE.HORSE ){
            return "move";
        }
    }

    /**
     * 根据类型整理背包
     * @param type 
     */
    public sortByType(type:number):void{
        let a = this.bagMap.getData(type);
        a.sort( this.sortFun );
    }

    public sortFun(a:Equip,b:Equip):number{
        let alv = a?a.lv:0;
        let blv = b?b.lv:0;
        return blv - alv;
    }

    /**
     * 设定玩家形象
     * @param p 
     */
    public setPlayerEquip( p:ui.scene.playerAniUI ):void{
        let obj:any = {};
        obj[EQUIP_TYPE.HORSE] = ["ma","horse"];
        obj[EQUIP_TYPE.HEAD] = ["kui","head"];
        obj[EQUIP_TYPE.BODY] = ["jia","equip"];
        obj[EQUIP_TYPE.WEAPON] = ["wuqi","weapon"];
        for( let i of this.playerEquipArr ){
            if( i == null ){
                continue;
            }
            let arr = obj[i.type];
            if( arr == null ){
                continue;
            }
            let imgname = arr[0];
            let urlb = arr[1];

            if( obj[i.type] != null )
            {
                let img:Laya.Image = p[ imgname ];
                img.skin = "player/all/" + i.id + ".png";
                if( i.type == EQUIP_TYPE.WEAPON ){
                    let item = <SysItem>App.getConfig( MyGameInit.sys_item, i.id );
                    if( item.effect == 0 ){
                        p.guang.visible = false;
                    }else{
                        p.guang.visible = true;
                        p.guang.skin = "player/all/e" + i.id + ".png";
                    }
                }
            }
        }
    }

    public static setEquip( p:ui.scene.playerAniUI , arr:Array<string> ):void{
        let obj:any = {};
        obj[EQUIP_TYPE.HORSE] = ["ma","horse"];
        obj[EQUIP_TYPE.HEAD] = ["kui","head"];
        obj[EQUIP_TYPE.BODY] = ["jia","equip"];
        obj[EQUIP_TYPE.WEAPON] = ["wuqi","weapon"];
        for( let i of arr ){
            if( i == null || i == "" ){5
                continue;
            }
            let sysItem = <SysItem>App.getConfig( MyGameInit.sys_item , parseInt(i) );
            let arr = obj[sysItem.itemType];
            if( arr == null ){
                continue;
            }
            let imgname = arr[0];
            let urlb = arr[1];
            let img:Laya.Image = p[ imgname ];
            img.skin = "player/all/" + sysItem.id + ".png";
            if( sysItem.itemType == EQUIP_TYPE.WEAPON ){
                if( sysItem.effect == 0 ){
                    p.guang.visible = false;
                }else{
                    p.guang.visible = true;
                    p.guang.skin = "player/all/e" + sysItem.id + ".png";
                }
            }
        }
    }
    
    /**
     * 随机损坏一件装备 不能是已经装备的
     */
    public destoryItem():Equip{
        if( Math.random() * 100 < this.tianFuSession.deadLuck ){
            return null;
        }
        let arr:Array<Equip> = [];
        for( let i in this.bagMap.map ){
            let arr1 = this.bagMap.map[i];
            for( let j of arr1 ){
                if( j && j.isEquip == false ){
                    arr.push( j );
                }
            }
        }
        if( arr.length == 0 ){
            return null;
        }
        let e = App.RandomByArray( arr );
        this.bagMap.deleteData( e.type,e,1);
        this.addBadEquip( e.id );
        Laya.timer.callLater( this, this.nextFun );
        return e;
    }

    /**
     * 得到玩家装备的平均等级
     */
    public getAverageEquipLv():number{
        let allLv:number = 0;
        for( let a of this.playerEquipArr ){
            if( a && a.getSysItem().itemType != EQUIP_TYPE.PET ){
                allLv += a.getSysItem().itemLevel;
            }
        }
        let c = allLv / 4;
        if( c < 1 ){
            return 1;
        }
        return c;
    }

    public getItemString():string{
        this.initBagMap();
        let str:string = "";
        for( let i in this.bagMap.map ){
            if( i == null || i == "undefined" ){
                continue;
            }
            let arr = this.bagMap.map[i];
            let str2:string = "";
            let haveEquip:boolean = false;
            for(let ii in arr ){
                let e = arr[ii];
                if( e ){
                    str2 += e.id;
                    if( e.isEquip ){
                        haveEquip = true;
                        str2 = ii + "," + str2;
                    }
                }
                str2 += ",";
            }
            if( haveEquip ){
                str = str + str2 + ":";
            }else{
                return "";
            }
        }
        return str;
    }

    public setItemString(str:string):void
    {
        this.initBagMap();
        let arr = str.split(":");
        for( let i of arr ){
            let arr2 = i.split(",");
            
            let equipIndex = parseInt(arr2.shift()); 
            arr2.pop();

            let etype = this.getType( arr2 );
            let earr = this.bagMap.getData( etype );
            earr.length = BagSession.BAG_LENGTH;
            
            for( let i:number = 0; i < arr2.length; i++ ){
                let str = arr2[i];
                if( str == "" ){
                    earr[i] = null;
                    continue;
                }
                let itemId:number = parseInt(str);
                let e = new Equip();
                e.id = itemId;
                let sys = e.getSysItem();
                earr[i] = e;
                e.type = sys.itemType;
                e.attack = sys.attack;
                e.crit =  sys.crit;
                e.defense = sys.defense;
                e.hitPoint = sys.hitPoint;
                e.move = sys.move;
                e.lv =  sys.itemLevel;
                e.isEquip = false;
                if( i == equipIndex ){
                    e.isEquip = true;
                    this.playerEquipArr[e.type] = e;
                }
            }
        }
        this.resetEquip();
    }

    public getType( arr:Array<string> ):number{
        for( let i of arr ){
            if( i != null && i != "" ){
                let sys = <SysItem>App.getConfig( MyGameInit.sys_item , parseInt(i) );    
                return sys.itemType;
            }
        }
    }

    /**
     * 或者装备弹窗
     * @param arr
     */
    public getEquipDialog( arr:Array<any> , comHandler:Laya.Handler , closeOther:boolean = true):void{
        App.dialog( MyGameInit.NewGetItemDialog , closeOther ,  arr );
        if( comHandler ){
            App.onceEvent( MyEvent.GET_GOLD_CLOSE , this , this.cItemFun , [comHandler] );
        }
    }

    private cItemFun( h:Laya.Handler ):void{
        h.run();
    }

    public nextGoldFun( c , a ):void{
        App.dialog(MyGameInit.NewGetItemDialog, c,a );
    }

    public getGoldAndMain():void{
        App.getInstance().eventManager.once( MyEvent.GET_GOLD_CLOSE , this  , this.goldFun );
    }

    public goldFun():void{
        App.getInstance().openScene(MyGameInit.MainScene , true, MyGameInit.SelectStage );
    }

    /**
     * 天赋更新了
     */
    public onTALENT_UPDATE():void{
        this.resetEquip();
    }
}

export enum GOLD_TYPE{
    FLY_BOX = 0,
    GAME_OVER_NORMAL = 1,
    GAME_OVER_AD = 2,
    TREASURE1 = 3,
    SELL = 4,
    TASK = 5,
    TIME_GOLD = 6,
    KILL_BOSS = 7,
    TREASURE2 = 8,
    KILL_MONSTER = 9,
    TIANFU = 10
}