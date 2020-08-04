import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import { EQUIP_TYPE } from "../session/BattleSession";

export class SysStageMap {
    public id: number = 0;
    public name: string = "";
    public image: string = "";
    public sceneImage: string = "";
    public status: string = "";
    public mapType: string = "";
    public winCondition: string = "";
    public beforeId: string = "";
    public bgMusic: string = "";
    public npcDamagescale: string = "";
    public npcHealthscale: string = "";
    public description: string = "";
}

export class SysStageInfo {
    public id: number = 0;
    public starID: number = 0;
    public stageType: number = 0;
    
    public monsterArr:Array<number> = [];
    
    public set monsterGroups( value:string ){
        let arr = value.split(",");
        for( let i of arr ){
            this.monsterArr.push( parseInt(i) ); 
        }
    }

    public monsterBoss: number = 0;
    
    public monsterGold:number = 0;
    public bossGold:number = 0;
    
    public set dropGold( value:string ){
        let a = value.split(",");
        this.monsterGold = parseInt( a[0] );
        if( a.length == 1 ){
            this.bossGold = this.monsterGold;
        }else{
            this.bossGold = parseInt( a[1] );
        }
    }
    
    public dropbuff: string = "";

    public lvMin:number = 0;
    public lvMax:number = 0;

    public set collect( value:string ){
        let a = value.split(",");
        this.lvMin = parseInt(a[0]);
        if( a.length == 1 ){
            this.lvMax = this.lvMin;
        }else{
            this.lvMax = parseInt(a[1]); 
        }
    }

    public collectDrop:number = 0;

    public nextId:number = 0;

    public static init():void{
        let arr = App.getInstance().configManager.getDataArr(MyGameInit.sys_stageinfo);
        let sys:SysStageInfo = null;
        for( let i of arr ){
            if( i.stageType == 2 ){
                continue;
            }
            if( sys != null ){
                sys.nextId = i.id;
            }
            sys = i;
        }
    }

    public static getStageInfo( stageId:number ):Array<SysStageInfo>{
        let arr = App.getInstance().configManager.getDataArr(MyGameInit.sys_stageinfo);
        let arr1:Array<SysStageInfo> = [];
        for( let i of arr ){
            if( i.starID == stageId ){
                arr1.push(i);
            }
        }
        return arr1;
    }

    public stageNum:number = 0;
    public stageCd:number = 0;
    public hangUp:number = 0;
}

export class SysEnemy {
    public id: number = 0;
    public enemyLevel: number = 0;
    public enemyHp: number = 0;
    public enemyAttk: number = 0;
    public enemymode: number = 0;
    public skillArr:Array<number> = [];
    
    public set skillId(value:string){
        let arr = value.split(",");
        for( let i of arr ){
            this.skillArr.push( parseInt(i) ); 
        }
    }
}

export class SysItem {
    public id: number = 0;
    public name: string = "";
    public itemType: number = 0;
    public itemLevel: number = 0;
    public itemQuality: number = 0;
    public attack: number = 0;
    public crit: number = 0;
    public defense: number = 0;
    public hitPoint: number = 0;
    public move: number = 0;
    public sellPrice: number = 0;
    public dnaCost: number = 0;
    public dnaCostadd: number = 0;
    private _attributes:string = "";
    
    public attributesValue:Array<number> = [];
    public attributesRandom:Array<number> = [];

    public effect:number = 0;
    
    public set attributes(value:string) {
        let s = value.split("|");
        for( let i of s ){
            let a = i.split(",");
            this.attributesValue.push( parseInt( a[0] ) );
            this.attributesRandom.push( parseInt( a[1] ) );
        }
    }

    /**
     * 随机出几个属性
     */
    public getAttNum():number{
        return App.RandomWeight( this.attributesValue , this.attributesRandom );
    }

    public static ItemMap:object = {};

    public static init():void{
        let arr = App.getInstance().configManager.getDataArr( MyGameInit.sys_item );
        for( let i of arr ){
            SysItem.ItemMap[ i.itemType + "_" + i.itemLevel ] = i;
        }
    }

    public getArr():Array<any> {
        if( this.itemType == EQUIP_TYPE.WEAPON ){
            return [ "攻击力" , this.attack];
        }else if( this.itemType == EQUIP_TYPE.HEAD ){
            return ["防御力" , this.defense];
        }else if( this.itemType == EQUIP_TYPE.PET ){
            return ["暴击" , this.crit];
        }else if( this.itemType == EQUIP_TYPE.BODY ){
            return ["血量" , this.hitPoint];
        }else if( this.itemType == EQUIP_TYPE.HORSE ){
            return ["移动" , this.move];
        }
    }
}

export class SysCompose{
    public id:number = 0;
    public itemId:number = 0;
    public set meterial1(value:string){
        this.itemId = parseInt( value.split(",")[0] ); 
    }
    public item2:number = 0;
    public random:number = 0;
}

export class SysPet{
    public id:number = 0;
    public itemId:number = 0;
    
    public playerEquipLvMin:number = 0;
    public playerEquipLvMax:number = 0;
    
    public set equipmentLevel(value:string){
        let arr = value.split(",");
        this.playerEquipLvMin = parseInt( arr[0] );
        this.playerEquipLvMax = parseInt( arr[1] );
    }

    public petEquipLvMin:number = 0;
    public petEquipLvMax:number = 0;

    public set petDrop(value:string){
        let arr = value.split(",");
        this.petEquipLvMin = parseInt( arr[0] );
        this.petEquipLvMax = parseInt( arr[1] );
    }

    public petNum:number = 0;

    public equipLvMin:number;
    public equipLvMax:number;
    
    public set equipmentDrop( value:string ){
        let arr = value.split(",");
        this.equipLvMin = parseInt( arr[0] );
        this.equipLvMax = parseInt( arr[1] );
    }
    
    public equipmentNum:number = 0;
    public boxCost:number = 0;
    public gold:number = 0;
    public txt:string = "";

    public static getSysPet( itemId:number ):Array<SysPet>{
        let sys:Array<SysPet> = App.getInstance().configManager.getDataArr( MyGameInit.sys_pet );
        let arr:Array<SysPet> = [];
        for ( let i of sys ){
            if( i.itemId == itemId){
                arr.push(i);
            }
        }
        return arr;
    }

    public static getLv( itemId:number , value:number ):SysPet{
        let arr = SysPet.getSysPet(itemId);
        for( let i of arr ){
            if( value >= i.playerEquipLvMin && value <= i.playerEquipLvMax ){
                return i;
            }
        }
        return null;
    }
}

export class SysSkill{
    public id:number = 0;
    public skillName:string = "";
    public skillDescription:string = "";
    public skillRange:number = 0;
    public skillSpeed:number = 0;
    public skillStatus:number = 0;
    public skillTime:number = 0;
}

export class SysTalentInfo{
    public id:number = 0;
    public talentInfo:string = "";
}

export class Equip{
    /**
     * 部位
     */
    public type:number = 0;
    public attack: number = 0;
    public crit: number = 0;
    public defense: number = 0;
    public hitPoint: number = 0;
    public move: number = 0;
    public lv:number = 0;
    public isEquip:boolean = false;
    public id:number = 0;
    
    public reset():void{
        this.attack = 0;
        this.crit = 0;
        this.defense = 0;
        this.hitPoint = 0;
        this.move = 0;
    }

    public reset1():void{
        this.attack = 1;
        this.crit = 1;
        this.defense = 1;
        this.hitPoint = 1;
        this.move = 1;
    }

    public getSysItem():SysItem{
        return <SysItem>App.getInstance().configManager.getConfig( MyGameInit.sys_item , this.id );
    }

    public add( equip:Equip ):void{
        this.attack += equip.attack;
        this.crit += equip.crit;
        this.defense += equip.defense;
        this.hitPoint += equip.hitPoint;
        this.move += equip.move;
    }

    public multiply( equip:Equip ):void{
        this.attack *= equip.attack;
        this.crit *= equip.crit;
        this.defense *= equip.defense;
        this.hitPoint *= equip.hitPoint;
        this.move *= equip.move;
        
        this.attack = Math.ceil( this.attack );
        this.crit = Math.ceil( this.crit );
        this.defense = Math.ceil( this.defense );
        this.hitPoint = Math.ceil( this.hitPoint );
        this.move = Math.ceil( this.move );
    }

    public reduce( equip:Equip ):void{
        this.attack -= equip.attack;
        this.crit -= equip.crit;
        this.defense -= equip.defense;
        this.hitPoint -= equip.hitPoint;
        this.move -= equip.move;
    }

    public copy():Equip{
        let e = new Equip();
        e.attack = this.attack;
        e.crit = this.crit;
        e.defense = this.defense;
        e.hitPoint = this.hitPoint;
        e.move = this.move;
        return e;
    }

    public copyPercent():Equip{
        let e = new Equip();
        e.attack = this.attack/100;
        e.crit = this.crit/100;
        e.defense = this.defense/100;
        e.hitPoint = this.hitPoint/100;
        e.move = this.move/100;
        return e;
    }
}

export class SysTalent {
    public id:number = 0;
    public addAttack:number = 0;
    public hitPoint:number = 0;
    public addMove:number = 0;
    public addDefense:number = 0;
    public addCrit:number = 0;
    public dropGold:number = 0;
    public addCompose:number = 0;
    public dropItem:number = 0;
    public offlineGold:number = 0;
}

export class SysTalentCost {
    public id:number = 0;
    public talentCost:number = 0;
}

export class SysMission{
    public id:number = 0;
    public missionType:number = 0;
    public missionNamesign:number = 0;
    public previousId:number = 0;
    public missionBegin:number = 0;
    
    public set conditions( value:string ){
        if( value == "0" ){
            return;
        }
        let arr = value.split(",");
        this.type = parseInt(  arr[0] );
        if( arr.length == 1 ){
            this.max = 1;
        }else if( arr.length == 2 ){
            this.max = parseInt( arr[1] );
        }else{
            this.subType = parseInt( arr[1] );
            this.max = parseInt( arr[2] );
        }
    }

    public gold:number = 0;

    public set missionGold( value:string ){
        let a = value.split(",");
        this.gold = parseInt( a[1] );
    }

    public missionIteamId:string = "";
    public missionName:string = "";
    public missionTxt:string = "";

    public type:number = 0;
    /**
     * -1 没有子条件
     */
    public subType:number = -1;
    public max:number = 0;
}

export class Res{
    constructor(){
        
    }
    
    public static getItemUrl( id:number ):string{
        return "icons/" + id + ".png";
    }

    public static getItemBorder( quality:number ):string{
        return "sence/kuang" + (quality-1) + ".png"
    }
}