import { BattleDisplay, DISPLAY_TYPE } from "./BattleDisplay";
import { SysEnemy } from "../config/SysConfig";
import HitObject from "./HitObject";

export default class Boss1Diaplay extends HitObject{
    constructor(){
        super();
        //this.setType( DISPLAY_TYPE.BIG_BOSS );
    }

    public setSysEnemy( sys:SysEnemy , isBoss:boolean = false , id:number = -1  ,style:number = -1):void{
        ///this.sysEnemy = sys;
    }
}