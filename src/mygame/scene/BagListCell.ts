import { ui } from "../../ui/layaMaxUI";
import { Equip, SysItem, Res } from "../config/SysConfig";
import RoleDialog from "./RoleDialog";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";

export default class BagListCell extends ui.scene.BagListCellUI {
    constructor(){
        super();
    }

    public gridIndex:number = 0;

    public sys:SysItem = null;
    public equip:Equip = null;

    public setEquip( equip:Equip , selected:boolean , isSellMode:boolean = false ):void{
        
        this.equip = equip;
        if( equip == null ){
            this.sys = null;
        }else{
            this.sys = <SysItem>App.getInstance().configManager.getConfig( MyGameInit.sys_item , equip.id );
        }
        this.selected( selected , isSellMode );
        this.setBorder( equip );
        this.setLogo( equip );
        this.setIsEquip();
        this.setEquipLv();
        this.stopEffect();
    }

    /**
     * 播放合成预览特效
     */
    public playEffect():void{
        this.canHeEffectView.visible = true;
        this.canHeEffectView.ani1.play(0,true);
    }

    /**
     * 
     */
    public stopEffect():void{
        this.canHeEffectView.visible = false;
        this.canHeEffectView.ani1.stop();
    }

    public setEquipLv():void{
        if( this.equip == null ){
            this.bg2Img.visible = false;
            this.fc.visible = false;
        }else{
            this.bg2Img.visible = true;
            this.fc.visible = true;
            this.fc.value = this.sys.itemLevel + "";
        }
    }

    /**
     * 设置是否装备中
     * @param value 
     */
    public setIsEquip():void{
        if( this.equip == null ){
            this.useImg.visible = false;
            return;
        }
        if( this.equip.isEquip ){
            this.useImg.visible = true;
        } else{
            this.useImg.visible = false;
        }
    }

    /**
     * 设置logo
     * @param equip 
     */
    public setLogo(equip:Equip):void{
        this.logoImg.skin = null;
        if( equip == null ){
            this.logoImg.visible = false;
        }else{
            this.logoImg.visible = true;
            this.logoImg.skin = Res.getItemUrl( equip.id );
        }
    }

    /**
     * 设置边框
     * @param equip 
     */
    public setBorder( equip:Equip ):void{
        if( equip == null ){
            this.bgImg.skin = "sence/zhuangbeikong.png"; 
        }else{
            this.bgImg.skin = Res.getItemBorder( this.sys.itemQuality );
        }
    }

    /**
     * 是否选中
     * @param value 
     * @param isSellMode 
     */
    public selected(value:boolean,isSellMode:boolean):void{
        this.selectImg.visible = value;
        if( isSellMode ){
            this.selectImg.skin = "sence/xuanzhong.png";
        }else{
            this.selectImg.skin = "sence/xuanzhong1.png";
        }
    }

    public reset():void{
        
    }

    public empty():void{
        
    }
}