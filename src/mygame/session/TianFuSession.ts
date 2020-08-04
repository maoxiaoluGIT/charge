import Session from "../../game/Session";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import { SysTalentCost, Equip, SysTalent } from "../config/SysConfig";
import BagSession, { GOLD_TYPE } from "./BagSession";
import DataSession from "./DataSession";
import MyEvent from "../MyEvent";

export default class TianFuSession extends Session{
    public bagSession:BagSession = null;
    public dataSession:DataSession = null;

    public equip:Equip = new Equip();
    /**
     * 升级了多少次
     */
    public lvTimes:number = 0;
    public lvArr:Array<number> = [];
    public mergeEquip:number = 0;
    public offLineGold:number = 0;
    public dropGold:number = 0;
    /**
     * 死亡不掉装备的几率
     */
    public deadLuck:number = 0;
    
    constructor(){
        super();
    }

    public onNEWER_INIT():void {
        this.setLvString(null);
    }
    
    public getLvString():string{
        return this.lvArr.join(",");
    }

    public setLvString( str:string ):void {
        if( str == null || str ==  "" ){
            for( let i:number=0; i < 9; i++ ){
                this.lvArr.push(0);
            }
            return;
        }
        let arr = str.split(",");
        for( let a of arr ){
            this.lvArr.push( parseInt( a ) );
        }
        this.updateEquip();
    }

    public updateEquip():void{
        this.equip.attack = this.getNumber( 0 ,"addAttack");
        this.equip.move = this.getNumber( 1 , "addMove" );
        this.deadLuck = this.getNumber( 2, "dropItem" );
        this.equip.defense = this.getNumber( 3, "addDefense" );
        this.equip.hitPoint = this.getNumber(  4, "hitPoint");
        this.dropGold = this.getNumber(5,"dropGold");
        this.equip.crit = this.getNumber( 6, "addCrit" );
        this.offLineGold = this.getNumber(7,"offlineGold");
        this.mergeEquip = this.getNumber(8,"addCompose");
    }

    public getTxt( index:number ):string{
        if( index == 0 ){
            return this.equip.attack + "";
        }else if( index == 1 ){
            return this.equip.move + "";
        }else if( index == 2 ){
            return this.deadLuck + "";
        }else if( index == 3 ){
            return this.equip.defense + "";
        }else if( index == 4 ){
            return this.equip.hitPoint + "";
        }else if( index == 5 ){
            return this.dropGold + "";
        }else if( index == 6 ){
            return this.equip.crit + "";
        }else if( index == 7 ){
            return this.offLineGold + "";
        }else if( index == 8 ){
            return  this.mergeEquip + "";
        }
    }

    public getNumber( index:number , p:string ):number{
        let lv = this.lvArr[index];
        if( lv == 0 ){
            return 0;
        }
        let sys = <SysTalent>App.getConfig(MyGameInit.sys_talent , lv );
        return sys[p];
    }

    /**
     * 升级任一天赋
     * -1 金币不够
     * -2 等级已经超了
     * 天赋的总等级 不能大于 装备的平均等级
     */
    public lvUp():number {
        let gold = this.getLvUpGold();
        if( gold > this.bagSession.gold ){
            return -1;
        }
        if( this.canLvUp() == false ){
            return -2;
        }
        this.bagSession.changeGold( -gold , GOLD_TYPE.TIANFU );
        this.lvTimes++;
        let index = Math.floor( Math.random() * this.lvArr.length );
        this.lvArr[index]++;
        this.dataSession.saveData();
        this.updateEquip();
        App.sendEvent(MyEvent.TALENT_UPDATE);
        return index;
    }

    public getLvUpGold():number{
        let sys = <SysTalentCost>App.getConfig( MyGameInit.sys_talentcost , this.lvTimes + 1 );
        return sys.talentCost;
    }

    /**
     * 能升级吗
     */
    public canLvUp():boolean{
        return this.lvTimes < this.bagSession.getAverageEquipLv();
    }

    public onGOLD_UPDATE():void {
        this.check();
    }

    public onEQUIP_UPDATE():void{
        this.check();
    }

    public checkGold():boolean{
        if( this.bagSession.gold < this.getLvUpGold() ){
            return false;
        }
        return true;
    }

    public check( send:boolean = true ):boolean{
        if( this.bagSession.gold < this.getLvUpGold() ){
            return false;
        }
        if( this.canLvUp() == false ){
            return false;
        }
        if( send ){
            App.sendEvent( MyEvent.TIAN_FU_UPDATE );
        }
        return true;
    }
}