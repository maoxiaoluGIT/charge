export class BattleDisplay extends Laya.Sprite{
    public static FLYOVEREVENT:string = "FLYOVEREVENT";
}

/**
 * boss普通的关底小boss
 * bigboss 单独关的boss
 */
export enum DISPLAY_TYPE {
    MONSTER = 1,
    ADD_HP = 2,
    BOSS = 3,
    BUFF = 4,
    BIG_BOSS = 5
}