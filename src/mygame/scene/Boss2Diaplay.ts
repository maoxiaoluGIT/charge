import { BattleDisplay, DISPLAY_TYPE } from "./BattleDisplay";
import { SysEnemy } from "../config/SysConfig";

export default class Boss2Diaplay extends BattleDisplay{
    setType(arg0: any): any {
        throw new Error("Method not implemented.");
    }
    constructor(){
        super();
        this.setType( DISPLAY_TYPE.BIG_BOSS );
    }
}