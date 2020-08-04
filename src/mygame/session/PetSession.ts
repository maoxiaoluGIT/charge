import Session from "../../game/Session";
import { Equip, SysPet } from "../config/SysConfig";
import BagSession from "./BagSession";
import { EQUIP_TYPE } from "./BattleSession";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import MyEvent from "../MyEvent";

export default class PetSession extends Session {

    public bagSession: BagSession = null;

    constructor() {
        super();
    }

    public eggNum: number = 0;

    public addEgg(): void {
        this.changeEgg(1);
    }

    /**
     * 是否成功
     * @param value
     */
    public changeEgg(value:number):boolean{
        if( value < 0 ){
            if( (value + this.eggNum) < 0 ){
                return false;
            }
        }
        this.eggNum += value;
        App.sendEvent(MyEvent.EGG_UPDATE);
        if( this.eggNum > 0 ){
            this.bagSession.addRed( EQUIP_TYPE.PET );
        }
        return true;
    }

    /**
     * 砸开新的宠物蛋
     */
    public getNewPet(): Equip {
        if ( this.changeEgg(-1) == false ) {
            return null;
        }
        return this.getNewPetNoEgg();
    }

    public getNewPetArr():Array<Equip> {
        let num = this.bagSession.getBagNum( EQUIP_TYPE.PET );
        let openNum:number = Math.min( this.eggNum , num );
        let arr:Array<Equip> = [];
        for( let i :number = 0; i <  openNum; i++ ){
            arr.push(  this.getNewPet() );
        }
        return arr;
    }

    public getNewPetNoEgg():Equip{
        let petLv = this.getPetLv();
        let e = this.bagSession.getNewItem(EQUIP_TYPE.PET, petLv);
        this.bagSession.addEquipInBag(e);
        return e;
    }

    public getPetLv(): number {
        let lv = this.bagSession.getAverageEquipLv();
        lv = parseInt(lv + "");
        let sysarr: Array<SysPet> = SysPet.getSysPet(PetSession.PET_BOX);
        for (let s of sysarr) {
            if (lv >= s.playerEquipLvMin && lv <= s.playerEquipLvMax) {
                return App.getRandom2(s.petEquipLvMin, s.petEquipLvMax);
            }
        }
    }

    public static PET_BOX: number = 700001;
}