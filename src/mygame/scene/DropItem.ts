import { Res, SysItem } from "../config/SysConfig";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import { EQUIP_TYPE } from "../session/BattleSession";
import HitObject from "./HitObject";
import { ui } from "../../ui/layaMaxUI";

export default class DropItem extends HitObject{
    public view:ui.scene.DropItemUI = null;
    constructor(){
        super();
        this.view = new ui.scene.DropItemUI();
        this.addChild(this.view);
        this.view.y = -this.view.height;
        this.onceHitMode = true;
    }

    /**
     * 是否碰撞上
     */
    public haveHit:boolean = false;

    public sysItem:SysItem;

    public setSysItem(sys:SysItem):void{
        this.sysItem = sys;
    }

    public getHitBox():Laya.Sprite{
        return this.view.hitbox;
    }

    public setItemId( itemId:number ):void{
        let s:SysItem = <SysItem>App.getInstance().configManager.getConfig( MyGameInit.sys_item , itemId );
        this.view.head.visible = false;
        this.view.body.visible = false;
        this.view.weapon.visible = false;
        this.view.horse.visible = false;
        this.view.egg.visible = false;
        
        if( s.itemType == EQUIP_TYPE.PET ){
            this.view.egg.visible = true;
        }else{
            let img:Laya.Image = null;
            if( s.itemType == EQUIP_TYPE.WEAPON ){
                img = this.view.weapon;
            }else if( s.itemType == EQUIP_TYPE.HORSE ){ 
                img = this.view.horse;
            }else if( s.itemType == EQUIP_TYPE.BODY ){
                img = this.view.body;
            }else if( s.itemType == EQUIP_TYPE.HEAD ){
                img = this.view.head;
            }
            img.visible = true;
            img.skin = null;
            img.skin = Res.getItemUrl( itemId );
        }
    }

    /**
     * 0在空中
     * 1在地上
     * @param stat 
     */
    public setStat(stat:number):void{
        this.view.di.visible = (stat == 1);
    }

    public hitFun():boolean {
        super.hitFun();
        return !this.battle.bagSession.isFull( this.sysItem.itemType );
    }
}
