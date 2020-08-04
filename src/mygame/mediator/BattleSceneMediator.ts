import Mediator from "../../game/Mediator";
import App from "../../game/App";
import MyGameInit from "../MyGameInit";
import BattleSession, { EQUIP_TYPE } from "../session/BattleSession";
import BagSession, { GOLD_TYPE } from "../session/BagSession";
import BattleScene from "../scene/BattleScene";
import PetSession from "../session/PetSession";
import TimeLogo from "../scene/TimeLogo";
import GirlViewC from "../scene/GirlViewC";
import { ui } from "../../ui/layaMaxUI";
import MyEvent from "../MyEvent";
import NewerSession from "../session/NewerSession";
import { SysEnemy, Equip, Res, SysItem } from "../config/SysConfig";
import DataSession from "../session/DataSession";
import LogType from "../session/LogType";
import Tips from "../scene/Tips";
import GameEvent from "../../game/GameEvent";
import PlayerHitObject from "../scene/PlayerHitObject";
import HitObject, { AttackObject } from "../scene/HitObject";
import { DISPLAY_TYPE, BattleDisplay } from "../scene/BattleDisplay";
import TianFuSession from "../session/TianFuSession";
import Boss1 from "../scene/Boss1";
import MyEffect from "../effect/MyEffect";
import DropItem from "../scene/DropItem";
import DropBuff from "../scene/DropBuffer";
import MyClip from "../../game/MyClip";
import MonsterDisplay from "../scene/MonsterDisplay";
import AddHpDiaplay from "../scene/AddHpDisplay";
import Boss2 from "../scene/Boss2";
import CurveMove from "../../game/CurveMove";
import IBoss from "../scene/IBoss";
import MyAni from "../../game/MyAni";

export default class BattleSceneMediator extends Mediator 
{
    public bagSession: BagSession = null;
    public petSession:PetSession = null;
    public battleSession:BattleSession = null;
    public newerSession:NewerSession = null;
    public dataSession:DataSession = null;
    public tianFuSession:TianFuSession = null;
    
    public battleScene:BattleScene;
    public playerView:ui.scene.PlayerViewUI;
    public player:ui.scene.playerUI;
    public playerAni:ui.scene.playerAniUI;
    public pet:ui.scene.xiaoguaiUI;
    public buffLayer:ui.scene.BufferLayerUI;
    public playerHitObject:PlayerHitObject;
    public battleSp:Laya.Sprite;

    public static SCREEN: number = 750;

    /**
     * 每隔几个敌人 出现一个加血站
     */
    public static ENEMY_ADD_HP: number = 7;
    /**
     * 一个场景内 一共有多少组敌人
     */
    public static ENEMY_GROUP: Number = 7;//7
    /**
     * 小兵之间的距离
     */
    public static ENEMY_DISTANCE: number = 280;

    /**
     * 怪到加血站之间的距离
     */
    public static ENEMY_ADD_HP_DISTANCE: number = 400;

    /**
     * 玩家一上来 距离怪物有多远
     */
    public static PLAYER_FIRST_ENEMY_DISTANCE: number = 400;

    public static BOSS_DISTANCE: number = 400;

    public static roleY: number = 750;

    constructor() {
        super();
        if( Laya.Browser.onMiniGame == false ){
            Laya.stage.on(Laya.Event.KEY_PRESS ,this,this.kkk);    
        }
        
        this.configOne( EQUIP_TYPE.BUFF_ATT , 90 , 78 , 1.5 , "res/atlas/texiao/jiagongji.atlas" , ["texiao/jiagongji/" ,1,14 ] );
        this.configOne( EQUIP_TYPE.BUFF_DEF , 107 ,111 ,2 , "res/atlas/texiao/jiafangyu.atlas" ,["texiao/jiafangyu/" ,1,12 ]);
        this.configOne( EQUIP_TYPE.BUFF_SPEED , 101 , 53 , 2, "res/atlas/texiao/jiasudu.atlas" ,["texiao/jiasudu/" ,1,9 ] );
        this.configOne( EQUIP_TYPE.BUFF_CRIT ,101, 78 ,2 , "res/atlas/texiao/jiabaoji.atlas" , ["texiao/jiabaoji/" ,1,13 ] );
        this.configOne( 100 , 90 , 46 , 2  , "res/atlas/texiao/jiaxue.atlas" , ["texiao/jiaxue/" ,1,14 ] );
    }

    public configOne( type:number , x1:number ,y1:number,scale:number ,atlas:string, arr:Array<any> ):void{
        let a1:Array<any> = [];
        let t:string = arr[0];
        let start:number = arr[1];
        let end:number = arr[2];
        for( let i:number = start; i <= end; i++ ){
            let str = "";
            if( i <= 9 ){
                str = "0" + i;
            }else{
                str = i + "";
            }
            a1.push( t +  str + ".png" );
        }
        this.buffConfig[type] = { x1:x1,y1:y1,scale:scale,atlas:atlas,arr:a1 };
    }

    public buffConfig:any = {};

    public kkk():void{
        let lv = 26;

        let a = App.getConfig(MyGameInit.sys_item, 200000 + lv );
        this.bagSession.addEquipInBagBySys( a );

        let b = App.getConfig(MyGameInit.sys_item, 300000 + lv );
        this.bagSession.addEquipInBagBySys( b );

        let c = App.getConfig(MyGameInit.sys_item, 400000 + lv );
        this.bagSession.addEquipInBagBySys( c );

        let d = App.getConfig(MyGameInit.sys_item, 500000 + lv );
        this.bagSession.addEquipInBagBySys( d );

        let e = App.getConfig(MyGameInit.sys_item, 600000 + lv );
        this.bagSession.addEquipInBagBySys( e );
    }
    
    public setSprite(sp:Laya.Sprite): void {
        this.battleScene = <any>sp;
        this.playerView = new ui.scene.PlayerViewUI();
        this.playerView.anchorX = 0.5;
        this.playerView.anchorY = 1;
        this.player = this.playerView.player;
        this.playerAni = this.player.player;
        this.pet = new ui.scene.xiaoguaiUI();
        this.player.addChild( this.pet );
        this.battleSp = this.battleScene.battleSp;
        this.pet.pos(-130, 55);
        this.setY( <any>this.playerView );
        this.playerView.x = 200;
        this.playerView.zOrder = 105;
        this.playerHitObject = new PlayerHitObject();
        this.playerHitObject.setPlayer( this.player );
        this.playerHitObject.attackTargetHandler = new Laya.Handler(this,this.atkTargetFun);
        this.playerHitObject.attackComHanlder = new Laya.Handler(this,this.atkComFun);
        this.playerAni.guang.visible = false;
    }

    public init(): void {

        this.bagSession.buffEquip.reset1();

        BattleSceneMediator.ENEMY_GROUP = this.battleSession.sys.stageNum;

        this.battleScene.once(Laya.Event.UNDISPLAY,this,this.undisFun);
        this.battleSp.scale(1,1);
        this.battleSp.x = 0;
        this.battleSp.y = 0;
        this.battleSp.addChild( this.playerView );
        this.playerView.x = 200;
        this.player.scaleX = 1;
        
        this.onEQUIP_UPDATE();
        this.onATTRIBUTE_UPDATE();
        this.onGOLD_UPDATE();
        this.onEGG_UPDATE();
        this.battleScene.gold.on(Laya.Event.CLICK,this,this.gold_click);

        let t = new TimeLogo();
        t.setUI( this.battleScene.gold );
        this.battleScene.guaJiClip.index = 0;
        App.sendEvent(MyEvent.ENTER_BATTLE_SCENE);

        this.onRED_UPDATE();

        if( this.newerSession.isNew ){
            let c = Laya.Browser.now() - DataSession.START_TIME;
            this.dataSession.log( LogType.LOGIN_TIME , c + "" );
        }else{
            this.battleScene.tiaoguo.visible = false;
            this.battleScene.rightHand.visible = false;
        }
        this.battleScene.guaJiClip.visible = true;
        if( this.battleSession.sys.stageType == 2 ){
            this.battleScene.guaJiClip.visible = false;
        }
        if( this.battleSession.stageNum == this.battleSession.sys.id  ){
            this.battleScene.guaJiClip.visible = false;
        }
        
        this.battleScene.guaJiClip.on(Laya.Event.CLICK,this,this.clickGuaBtnFun);

        if( this.battleSession.isBossStage() == false ){
            //Laya.SoundManager.playMusic( "sound/BGM_Stage1.mp3" );
            App.getInstance().gameSoundManager.playBgm( "sound/BGM_Stage1.mp3" );
        }else{
            //Laya.SoundManager.playMusic( "sound/BGM_Dungeon.mp3" );
            App.getInstance().gameSoundManager.playBgm( "sound/BGM_Dungeon.mp3" );
        }

        if( this.battleSession.isBossStage() == false && this.newerSession.isNew == false ){
            this.battleScene.flyBoxStart();
        }

        this.isHangUp = false;

        this.lastDropEquipTime = Laya.Browser.now();

        //if( this.battleSession.sys.id <= 2 ){
            BattleSceneMediator.DROP_ITEM_TIME = this.battleSession.sys.stageCd;   //4000;
            BattleSceneMediator.HANG_UP_DROP_TIME = this.battleSession.sys.hangUp; //8000;
        //}

        this.battleSession.deleteNoPlayStage( this.battleSession.sys.id );
        
        App.getInstance().eventManager.once(GameEvent.OPEN_SCENE_START, this,this.exitFun);
    
        // if( this.newerSession.isNew == false ){
        //     if( this.buffLayer == null ){
        //         this.buffLayer = new ui.scene.BufferLayerUI();
        //         //this.player.addChild( this.buffLayer );
        //         this.setBuffPos( this.buffLayer.att , EQUIP_TYPE.BUFF_ATT );
        //         this.setBuffPos( this.buffLayer.crit , EQUIP_TYPE.BUFF_CRIT );
        //         this.setBuffPos( this.buffLayer.def , EQUIP_TYPE.BUFF_DEF );
        //         this.setBuffPos( this.buffLayer.speed , EQUIP_TYPE.BUFF_SPEED );
        //     }else{
        //         this.buffLayer.att.visible = false;
        //         this.buffLayer.crit.visible = false;
        //         this.buffLayer.def.visible = false;
        //         this.buffLayer.speed.visible = false;
        //     }
        // }
        
        this.calculationWidth();
        this.equipUpdateFun();
        
        this.nowHp = this.bagSession.playerEquip.hitPoint;
        this.maxHp = this.nowHp;
        this.onlyResetHp();
        this.attUpdateFun();
        
        if ( this.isBossStage() ) {
            this.moveToBoss();
        }
        if( this.newerSession.isNew ){
            this.playerCanMove = false;
        }else{
            this.playerCanMove = true;
        }
        
        this.setPlayerStat(1);
        this.startGame();

        this.battleScene.fightbox.on(Laya.Event.MOUSE_DOWN,this,this.moveFun);
        Laya.stage.on( Laya.Event.MOUSE_UP ,this, this.mouseUpFun );

        this.playerAni.dead.gotoAndStop(0);
        this.playerAni.wait.gotoAndStop(0);
        this.playerStop();

        this.isGameOver = false;
        this.isDead = false;

        this.nowPlayerStat = -1;

        this.playerView.guaJiSp.visible = false;

        this.battleScene.setNowGold( this.bagSession.gold );
    }

    public atkTargetFun( ho:HitObject ):void{
        this.attacking( ho );
    }

    public atkComFun( ho:HitObject ):void{
        
    }

    /**
     * 攻击计算公式
     */
    public attacking( monster: HitObject ): void {
        let atk = this.bagSession.playerEquip.attack;
        let isCrit = Math.random() * 1000 < this.bagSession.playerEquip.crit;
        if ( isCrit ) {
            atk *= 1.5;
        }
        atk = Math.ceil(atk - 0 + Math.random() * 10 );
        monster.changeHp( -atk );
        this.flyHitEffect( atk, isCrit, monster );
        this.playHitEffect( isCrit );
        
        this.changeHp( this.getHurtHp( monster.getHurt() ) );

        if ( monster.nowHp <= 0 ) {
            this.killMonster( monster );
        } else {
            monster.hitIng();//挨打动画
            //怪物没死 他会反击
            //let myhp = this.getHurtHp( monster.getHurt() );//monster.sysEnemy.enemyAttk
            //this.setNowPlayerHp(this.nowHp -= myhp);
            
        }
        if (monster.disType == DISPLAY_TYPE.MONSTER) {
            //只有小怪有后退动作
            monster.x += ( monster.getScaleX() * 20 );
        }
        this.isRebirth = false;
    }

    public getHurtHp( atk:number ):number{
        let myhp = atk - this.bagSession.playerEquip.defense;
        if (myhp <= 0) {
            myhp = Math.ceil( Math.random() * 20 ) + 1;
            //没破防 随机费5滴血
        }
        if( this.newerSession.isNew ){
            myhp = 50;
        }
        return myhp;
    }

    public changeHp( value:number ):void{
        this.setNowPlayerHp( this.nowHp - value );
    }

    public maxHp: number = 0;
    public nowHp: number = 0;
    private sendhpevent:boolean = false;
    
    public setNowPlayerHp(value: number): void {
        if( this.nowHp <= 0 ){ 
            return;
        }
        this.nowHp = value;
        this.nowHp = Math.max(this.nowHp, 0);
        if( this.newerSession.isNew && ( this.sendhpevent == false) ){
            if( this.nowHp < (this.maxHp/2) ){
                this.sendhpevent = true;
                this.longFly();
            }
        }
        this.nowHp = Math.min(this.maxHp, this.nowHp);
        this.resetNowBlood(this.nowHp);
        if ( this.nowHp <= 0 ) {
            this.isDead = true;
            this.playerDie();
        }
    }
    
    /**
     * 添加子弹
     * @param ho 
     */
    public addHitObject(ho:HitObject):void{
        this.spriteArr.push(ho);
        ho.zOrder = 105;
    }

      /**
     * 一般用来移除子弹
     * @param ho 
     */
    public removeHitObject(ho:HitObject):void{
        let i = this.spriteArr.indexOf(ho);
        if( i != -1 ){
            this.spriteArr.splice( i , 1 );
        }
    }

    /**
     * player死亡
     */
    public playerDie(): void {
        //Laya.SoundManager.stopMusic();
        App.getInstance().gameSoundManager.stopBgm();
        //Laya.SoundManager.playSound("sound/fx_lose.wav");
        
        App.getInstance().gameSoundManager.playEffect( "sound/fx_lose.wav" );

        this.deadFun();
        let e = this.bagSession.destoryItem();
        if (e == null) {
            //没有可以损毁的装备
            return;
        }
        let m = new ui.scene.maozhuangbeiUI();
        m.kuang.skin = Res.getItemBorder(e.getSysItem().itemQuality);
        m.ic.skin = Res.getItemUrl(e.getSysItem().id);
        this.battleScene.addChild(m);
        m.ani1.play(0, false);
        m.ani1.on(Laya.Event.COMPLETE, this, this.destoryItemAniFun, [m, m.clip]);
    }

    public destoryItemAniFun(m: Laya.Sprite, c: Laya.Clip): void {
        c.play(0, c.total - 1);
        c.on(Laya.Event.COMPLETE, this, this.itemDestoryfun, [m, c]);
    }

    public itemDestoryfun(m: Laya.Sprite, c: Laya.Clip): void {
        m.removeSelf();
    }
    
    public isGameOver:boolean = false;

    /**
     * 放大镜头
     */
    public deadFun(): void {
        this.isGameOver = true;
        this.playerCanMove = false;
        //this.stopEf();
        this.clearCarmer();
        this.clearBg();
        this.player.run.gotoAndStop(0);
        this.playerAni.dead.interval = 1000 / 4;
        this.playerAni.dead.play(0, false);
        //放大镜头
        let t = new Laya.Tween();
        let p = this.playerView.localToGlobal(new Laya.Point(this.player.width / 2, 0) );
        let l1 = this.playerView.x * 1.5;
        let xx = - (l1 - p.x);
        let y1 = this.playerView.y;
        let yy = y1 - this.playerView.y * 1.5;
        t.to( this.battleSp , { x: xx, y: yy, scaleX: 1.5, scaleY: 1.5 }, 5000);
        Laya.timer.once(3000, this, this.deadOverFun);
    }

    public deadOverFun(): void {
        App.getInstance().openScene(MyGameInit.MainScene , true, MyGameInit.SelectStage );
        this.playerAni.dead.gotoAndStop(0);
    }

    public clearCarmer():void {
        Laya.timer.clear(this,this.resetScreen);
    }
    
    /**
     * 计算出来的场景宽度
     */
    public sceneWidth: number;
    public cameraSpeed:number = 0.7;

    public bg1:Laya.Sprite = new Laya.Sprite();
    public bg2:Laya.Sprite = new Laya.Sprite();
    public bg3:Laya.Sprite = new Laya.Sprite();
   
    public shu1:Laya.Sprite = new Laya.Sprite();
    public shu2:Laya.Sprite = new Laya.Sprite();

    public shu3:Laya.Sprite = new Laya.Sprite();
    public shu4:Laya.Sprite = new Laya.Sprite();

    /**
     * 让屏幕对准玩家
     */
    public resetScreen(): void {
        let sp = this.battleScene.battleSp;
        let tx = -this.playerView.x + BattleSceneMediator.SCREEN / 2 - 100 * this.player.scaleX;
        tx = Math.min(tx, 0);
        tx = Math.max(tx, -this.sceneWidth + BattleSceneMediator.SCREEN);

        let len2 = Math.abs( sp.x - tx );

        let realSpeed = 2 * (len2 /700);
        realSpeed = Math.max( realSpeed  , this.cameraSpeed );
        
        let len = realSpeed * this.getDelta();
        
        if( len2 < len ){
            sp.x = tx;
        } else {
            sp.x -= ( ( (tx < sp.x)?1:-1 ) * len );
        }

        let xx = -sp.x - 200;
        let xxend = xx + 750 + 200;

        for( let a of this.spriteArr ){
            if( a.x > xx && a.x < xxend ){
                a.onShow();
            }else{
                a.onHide();
            }
        }
    }

    public spriteArr:Array<HitObject> = [];

    public bgArr:Array<Laya.Sprite> = [];
    
    public setSceneWidth(value: number): void  {
        this.bgArr.length = 0;
        let c = null;
        if( this.battleSession.sys.starID == 1001 ){
            c = ui.scene.Stage1ViewUI;
        }else if( this.battleSession.sys.starID == 2001 ){
            c = ui.scene.Stage2ViewUI;
        }else if( this.battleSession.sys.starID == 3001 ){
            c = ui.scene.Stage3ViewUI;
        }
        for( let i:number = 0; i < 2; i++ ){
            let ins = new c();
            this.bgArr.push( ins );
            this.battleSp.addChild( ins );
            ins.zOrder = -1;
            (<Laya.Sprite>ins).cacheAs = "normal";
        }
        this.startBg();
        this.startCarmer();
    }

    public startCarmer():void{
        Laya.timer.frameLoop(1,this,this.resetScreen);
    }

    public startBg():void{
        Laya.timer.frameLoop(1,this,this.bgFun);
    }

    public bgFun():void {
        let wid = this.bgArr[0].width;
        this.bgArr[0].x = -Math.ceil( this.battleSp.x / wid ) * wid;
        this.bgArr[1].x = this.bgArr[0].x + wid;
    }

    public speed: number = 0.4;
    public static MIN_SPEED:number = 0.4;
    public static MAX_SPEED: number = 0.5;

    public playerStat:number = 0;

    public direction:number = 1;
    /**
     * 移动方向
     */
    public moveStat:number = 0;

    public clearBg():void{
        Laya.timer.clear(this,this.bgFun);
    }

    public resetNowBlood(nowHp: number): void  {
        this.battleScene.setNowHp( nowHp / this.maxHp );
    }
    
    public playerMove( value: number ): void {
        this.moveStat = value;
        this.direction = value;
    }

    public twover: boolean = true;
    public bossHo:IBoss;
    /**
     * 主角自己死亡
     */
    public isDead: boolean = false;
    
    public longFly():void{
        this.clearMouse();
        if( this.bossHo instanceof Boss1 ){
            this.bossHo.clearAll();
            this.bossHo.showTalk();
            Laya.timer.once( 3000,this,this.fly );
        }
    }

    public fly():void{
        if( this.bossHo instanceof Boss1 ){
            this.bossHo.closeTalk();
            this.bossHo.flyaway();
            this.bossHo.once( BattleDisplay.FLYOVEREVENT , this,this.flyawayover);
        }
    }

    public flyawayover():void{
        App.sendEvent(MyEvent.HP_HALF);
    }

    /**
     * 角色能够移动
     */
    public playerCanMove:boolean = true;

    public clearMouse():void{
        Laya.timer.clearAll(this);
        this.playerCanMove = false;
        this.setPlayerStat( 1 );
    }

     /**
     * 现在角色的状态
     */
    private nowPlayerStat:number = -1;
    /**
     * 0 jump
     * 1 wait
     * @param stat 
     */
    public setPlayerStat(stat: number): void {
        if( this.nowPlayerStat == stat ){
            return;
        }
        this.nowPlayerStat = stat;
        this.player.run.gotoAndStop(0);
        this.player.player.wait.gotoAndStop(0);
        //this.pet.wait.gotoAndStop(0);
        this.pet.walk.gotoAndStop(0);
        if (stat == 0) {
            this.player.run.interval = 1000 / 40;
            this.player.run.play();
            this.pet.walk.interval = 1000 / 40;
            this.pet.walk.play(0, true);
        } else {
            this.player.player.wait.play();
            //this.pet.wait.play(0, true);
            Laya.SoundManager.stopSound("sound/fx_move.wav");
        }
    }

    /**
    * 是否已经复活了怪物
    */
    public isRebirth: boolean = false;

    /**
     * 击杀敌人的处理方法
     * @param monster 
     */
    public killMonster( monster:HitObject ):void{
        monster.die();
        let addGold = 0;
        if ( monster.disType == DISPLAY_TYPE.MONSTER ) {
            addGold = this.battleSession.sys.monsterGold;
            addGold *= ( 1 + this.tianFuSession.dropGold/100 ) ;
            addGold = Math.floor( addGold );
            this.flyItem(monster);
            this.flyGold(monster, addGold);
        } else {
            addGold = this.battleSession.sys.bossGold;
            //this.bagSession.gold += addGold;
            this.bagSession.changeGold( addGold , GOLD_TYPE.KILL_BOSS );
        }
        if ( monster.disType == DISPLAY_TYPE.BOSS ) {
            //如果杀死的是boss
            this.gameOver();
            this.dataSession.saveData();
        }else if( monster.disType == DISPLAY_TYPE.BIG_BOSS ){
            this.bossGameOver();
        }
    }

    /**
     * 弹出奖励框
     */
    public bossGameOver():void{
        this.stopEf();
        this.isGameOver = true;
        //Laya.SoundManager.stopMusic();
        App.getInstance().gameSoundManager.stopBgm();
        //Laya.SoundManager.playSound("sound/fx_success.wav");
        App.getInstance().gameSoundManager.playEffect( "sound/fx_success.wav" );
        this.clear();
        this.battleSession.killBoss();
        App.dialog(MyGameInit.KillBossDialog);
    }

    /**
     * 击败boss 游戏结束
     */
    public gameOver(): void {
        this.stopEf();
        this.isGameOver = true;
        //Laya.SoundManager.stopMusic();
        App.getInstance().gameSoundManager.stopBgm();
        App.getInstance().gameSoundManager.playEffect("sound/fx_success.wav");
        //Laya.SoundManager.playSound("sound/fx_success.wav");
        this.battleSession.gameOver();
        this.dataSession.saveData(true);
        App.dialog(MyGameInit.GameOverDialog);
    }

    public stopEf():void{
        this.playerCanMove = false;
    }

    public flyGold(sp: Laya.Sprite, addGold: number): void {
        this.bagSession.gold += addGold;
        //this.bagSession.changeGold( addGold, GOLD_TYPE.KILL_MONSTER );
        let p = sp.localToGlobal( MyEffect.getP00() );
        this.battleScene.flyGold( p.x , p.y , addGold );
    }

    /**
     * 飞道具
     * @param i 
     */
    public flyItem(i: HitObject): void
    {
        if( !this.newerSession.isNew ){
            if( this.isHangUp ){
                if ( (Laya.Browser.now() - this.lastDropEquipTime) < BattleSceneMediator.HANG_UP_DROP_TIME ) {
                    return;
                }
            }else{
                if ( (Laya.Browser.now() - this.lastDropEquipTime) < BattleSceneMediator.DROP_ITEM_TIME) {
                    return;
                }
            }
        }
        this.lastDropEquipTime = Laya.Browser.now();
        let any1 = this.battleSession.getNewItem();
        let drop:HitObject = null;
        
        if( any1 instanceof SysItem ){
            let sysi:SysItem = any1;
            let drop1 = new DropItem();
            drop1.battle = this;
            drop1.setSysItem(sysi);
            drop1.setItemId(sysi.id);
            drop1.setStat(0);
            drop = drop1;
        }else{
            let buffid = <number>any1;
            let dis = new DropBuff();
            dis.setBuffType( buffid );
            drop = dis;
        }
        this.battleScene.battleSp.addChild(drop);
        this.spriteArr.push(drop);
        let c = new CurveMove();
        let fangxiang:number = 0;
        if( i.x < this.playerView.x ){
            fangxiang = -1;
        }else{
            fangxiang = 1;
        }
        let endX = i.initPoint.x + BattleSceneMediator.ENEMY_DISTANCE * 1.2 * fangxiang;
        endX = Math.max(endX,0);
        c.start(new Laya.Handler(this, this.flyUpdateFun, [drop]), new Laya.Handler(this, this.flyOverFun, [drop, endX , fangxiang]), 500, 2000, i.x,  BattleSceneMediator.DISPLAY_Y , endX, BattleSceneMediator.DISPLAY_Y );
    }
    
    public static DISPLAY_Y:number = 740;

    private flyOverFun(img: Laya.Sprite, endx: number , sss:number): void {
        let c = new CurveMove();
        let realEndx:number = endx + BattleSceneMediator.ENEMY_DISTANCE * 1 * sss;
        realEndx = Math.max( realEndx ,0 );
        c.start(new Laya.Handler(this, this.flyUpdateFun, [img]), new Laya.Handler(this, this.flyOver2Fun, [img]), 600, 2000, endx, BattleSceneMediator.DISPLAY_Y , realEndx , BattleSceneMediator.DISPLAY_Y );
    }

    private flyOver2Fun(img: Laya.Sprite): void {
        if( img instanceof DropItem ){
            img.setStat(1);
        }else if( img instanceof DropBuff ){
            img.setMv();
        }
    }

    private flyUpdateFun(img: Laya.Sprite, p: Laya.Point): void {
        img.x = p.x;
        img.y = p.y;
    }

    /**
     * 冒红色的光
     */
    public playHitEffect( isCrit:boolean ): void {
        let x = this.playerView.x + ( 55  + this.playerView.width / 2 ) * this.player.scaleX;
        let y = this.playerView.y - this.playerView.height / 2;
        this.battleScene.playHitEffect( isCrit , x,y );
    }

     /**
     * 飞伤害的那个数字
     * 冒字
     * @param num 
     * @param isCrit 
     * @param i 
     */
    public flyHitEffect(num: number, isCrit: boolean, i: HitObject): void 
    {
        let x1:number = i.x;
        let y1:number = i.y - 200;
        if( i.disType == DISPLAY_TYPE.BIG_BOSS ){
            let ho = <HitObject>i;
            y1 = i.y - ho.getHitBox().height - 100;
        }
        this.battleScene.flyHitEffect( num ,isCrit , x1, y1 );
    }

    public buffMap:any = {};

    public setBuffPos( c:Laya.Animation , t:number ):void{
        this.buffMap[t] = c;
    }

    public setY(ho:HitObject):void{
        ho.y = BattleSceneMediator.DISPLAY_Y;
    }

    public attUpdateFun(): void {
        let per = this.bagSession.playerEquip.move / 100;
        this.speed =  BattleSceneMediator.MIN_SPEED + per * ( BattleSceneMediator.MAX_SPEED - BattleSceneMediator.MIN_SPEED );
    }

    public equipUpdateFun(): void {
        this.bagSession.setPlayerEquip(this.player.player);
        //更新宠物
        let p = this.bagSession.playerEquipArr[ EQUIP_TYPE.PET ];
        if( p == null ){
            this.pet.visible = false;
        }else{
            this.pet.visible = true;
            this.pet.img1.skin = "player/all/" + p.id + ".png";
        }
    }

    public isBossStage(): boolean {
        return this.battleSession.sys.stageType == 2;
    }

     /**
     * 动态计算屏幕宽度
     */
    public calculationWidth(): void {
        this.sceneWidth = 0;
        if( this.newerSession.isNew ){
            this.sceneWidth += ( Laya.stage.width + 100 );
            this.makeSprite( DISPLAY_TYPE.MONSTER , this.battleSession.sys.monsterArr[0] , 20033 );
            this.sceneWidth += (BattleSceneMediator.ENEMY_DISTANCE );
            this.makeSprite( DISPLAY_TYPE.MONSTER , this.battleSession.sys.monsterArr[1] , 20019 );
            this.sceneWidth += (BattleSceneMediator.ENEMY_DISTANCE * 8 );
            this.makeSprite( DISPLAY_TYPE.BIG_BOSS , this.battleSession.sys.monsterBoss );
            this.sceneWidth += 300;
            this.setSceneWidth(this.sceneWidth);
            
        }else if ( this.isBossStage() )  {
            this.sceneWidth += BattleSceneMediator.PLAYER_FIRST_ENEMY_DISTANCE;
            this.sceneWidth += (BattleSceneMediator.ENEMY_DISTANCE * 7);
            this.makeSprite( DISPLAY_TYPE.BIG_BOSS , this.battleSession.sys.monsterBoss );
            this.sceneWidth += 300;
            this.setSceneWidth(this.sceneWidth);
        } else {
            this.sceneWidth += BattleSceneMediator.PLAYER_FIRST_ENEMY_DISTANCE;
            for (let i: number = 0; i < BattleSceneMediator.ENEMY_GROUP; i++) {
                for (let j: number = 0; j < BattleSceneMediator.ENEMY_ADD_HP; j++) {
                    this.makeSprite(DISPLAY_TYPE.MONSTER);
                    this.sceneWidth += BattleSceneMediator.ENEMY_DISTANCE;
                }
                this.sceneWidth += BattleSceneMediator.ENEMY_ADD_HP_DISTANCE;
                this.makeSprite(DISPLAY_TYPE.ADD_HP);
                this.sceneWidth += BattleSceneMediator.ENEMY_ADD_HP_DISTANCE;
            }
            this.AUTO_TURN_X = this.sceneWidth;
            this.sceneWidth += BattleSceneMediator.ENEMY_DISTANCE;
            this.makeSprite(DISPLAY_TYPE.BOSS);
            this.sceneWidth += (BattleSceneMediator.ENEMY_DISTANCE * 2);
            this.setSceneWidth(this.sceneWidth);
        }
    }

    public makeSprite( type: DISPLAY_TYPE , id:number = -1 ,style:number = -1 ): void {
        let ho:HitObject = null;
        if ( type == DISPLAY_TYPE.MONSTER || type == DISPLAY_TYPE.BOSS ) {
            let monster = new MonsterDisplay();
            if( type == DISPLAY_TYPE.MONSTER ){
                if( id == -1 ){
                    monster.setSysEnemy( this.battleSession.getNewMonster()  );
                }else{
                    monster.setSysEnemy( App.getConfig(MyGameInit.sys_enemy , id ) , style );
                }
            }else{
                monster.setSysEnemy( this.battleSession.getBossSys() );
            }
            ho = monster;
        } else if ( type == DISPLAY_TYPE.ADD_HP ) {
            ho = new AddHpDiaplay();
        } else if( type == DISPLAY_TYPE.BIG_BOSS ) {
            let sys = this.battleSession.getBossSys();
            if( sys.enemymode == 20034 ){
                ho = new Boss1();
            }else{
                ho = new Boss2();
            }
            ho.setSysEnemy( sys );
            this.bossHo = <any>ho;
        }
        ho.setDisplayType( type );
        this.spriteArr.push(ho);
        this.battleScene.battleSp.addChild( ho );
        ho.y = BattleSceneMediator.DISPLAY_Y;
        ho.x = this.sceneWidth;
        ho.savePos();
        ho.battle = this;
    }

    public exitFun():void{
        Laya.SoundManager.stopAllSound();
        this.clear();
    }

    public clear():void{
        console.log( "&&&&&&&&&&&&&&&&&&&&&&清理了" );
        for( let i:number = 0  ; i < this.battleScene.battleSp.numChildren; i++ ){
            let a = this.battleScene.battleSp.getChildAt(i);
            if( a instanceof HitObject ){
                if( a.hitType == HitObject.BULLET ){
                    a.clear();
                    a.visible = false;
                }
            }
        }
        this.spriteArr.length = 0;
    }

    /**
     * 掉落时间
     * 4000
     * 8000
     */
    public static DROP_ITEM_TIME: number = 6 * 1000;
    public static HANG_UP_DROP_TIME:number = 10 * 1000;
    public lastDropEquipTime: number = 0;

    public undisFun():void {
        Laya.timer.clearAll(this);
        Laya.stage.offAllCaller(this);
        this.battleScene.battleSp.removeChildren();
        Laya.Tween.clearTween( this );
        Laya.Tween.clearTween( this.battleSp );
        Laya.Tween.clearTween( this.battleScene );
        this.playerAni.wait.interval = 1000 / 24;
        this.playerAni.wait.gotoAndStop(0);
    }

    /**
     * 更新最大血量
     */
    public updateMaxHp():void {
        this.maxHp = this.bagSession.playerEquip.hitPoint;
        this.nowHp = Math.min( this.maxHp , this.nowHp );
        this.onlyResetHp();
    }

    /**
     * 单独刷新血
     */
    public onlyResetHp():void{
        this.battleScene.onlyResetHp( this.nowHp / this.maxHp );
    }

    public playerStop(): void {
        this.moveStat = 0;
        Laya.timer.clear(this, this.efFun);
        this.setPlayerStat(1);
    }
    
    public AUTO_TURN_X:number = 0;
    public playerMaxRight:number = 0;

    /**
     * 移动
     */
    public efFun(): void {
        if( this.moveStat == 0 ){
            return;
        }
        if (this.isDead) {
            return;
        }
        let oldX:number = this.playerView.x;
        this.playerView.x += (this.direction * this.speed * this.getDelta() );
        this.playerView.x = Math.max(0, this.playerView.x);
        this.playerView.x = Math.min(this.sceneWidth , this.playerView.x);
        if( this.playerMaxRight != 0 ){
            this.playerView.x = Math.min( this.playerMaxRight , this.playerView.x );    
        }
        
        let ho = this.hitTest( false );
        if( ho && ho.hitType == HitObject.ENEMY ){
            this.playerView.x = oldX;
        }
        if ( this.direction > 0 ) {
            this.playerView.player.scaleX = 1;
        } else {
            this.playerView.player.scaleX = -1;
        }
        this.setPlayerStat(0);
    }

    public getDelta():number {
        let t = 1000 / 60;
        if( Laya.timer.delta < t ){
            return Laya.timer.delta;
        }
        return t;
    }

    /**
     * 全局碰撞检测
     */
    public hitTest( onlyCheckbullet:boolean ): HitObject {
        let pRect = this.getGlobalRect( this.playerView.hitbox );
        for( let i:number = 0, len:number = this.spriteArr.length; i < len; i++ ){
            let ho:HitObject = this.spriteArr[i];
            //ho.drawHit();
            if( onlyCheckbullet && ho.hitType != HitObject.BULLET ){
                continue;
            }
            if( ho.hitTest == false ){
                continue;
            }
            if( ho.isDead ){
                continue;
            }
            if( Math.abs( ho.x - this.playerView.x ) > BattleSceneMediator.SCREEN ){
                //太远的不检测
                continue;
            }
            
            let hoRect = this.getGlobalRect( ho.getHitBox() );
            
            if( pRect.intersects( hoRect ) == false ){
                if( ho.onceHitMode && ho.checked ){
                    ho.unHitFun();
                }
                continue;
            }
            if( ho.onceHitMode && ho.checked ){
                continue;
            }
            if( ho.select ){
                if( ho.hitFun() ){
                    this.spriteArr.splice( i , 1 );
                }
                this.hitHandle( ho );    
            }
            return ho;
        }
        return null;
    }

    /**
     * 碰撞到的回调
     * @param ho
     */
    public hitHandle(ho:HitObject):void {
        if( ho.disType == DISPLAY_TYPE.ADD_HP ){
            this.addHpFun();
        }else if( ho.hitType == HitObject.ENEMY ){
            this.playerHitObject.attack( ho );
            this.setPlayerStat( 1 );
        }else if( ho instanceof DropItem ){
            this.addItem(ho);
        }else if( ho instanceof DropBuff ){
            this.addBuffer(ho);
        }else if( ho.hitType == HitObject.BULLET ){
            this.changeHpByBullet(ho);
        }
    }

    public changeHpByBullet(ho:HitObject):void{
        let a = ho.getAttackObject();
        if( a.type == AttackObject.FORCE_ATTACK ){
            this.changeHp( a.value );
        }else{
            this.changeHp( this.getHurtHp( a.value ) );
        }
    }

    public addBuffer( dropBuff:DropBuff ):void{
        dropBuff.removeItem();
        App.getInstance().gameSoundManager.playEffect("sound/fx_openBox.wav");
        this.setPlayerBuff( dropBuff.type );
    }

    public myBuffMap:any = {};

    /**
     * 播放buff动画
     * @param type 
     */
    public setPlayerBuff(type:number):void{
        let my = this.playMyAni( type );
        this.bagSession.setBuffer( type );
        Laya.timer.once( BattleSceneMediator.BUFF_TIME , this,this.buffOverFun , [my,type] , false );
    }

    public playMyAni( type:number ):MyAni{
        let sys = this.buffConfig[type];
        let my:MyAni = this.myBuffMap[type];
        if( my == null ){
            my = new MyAni();
            my.time = 1000 / 20;
            my.anchorX = my.anchorY = 0.5
            my.x = sys.x1;
            my.y = sys.y1;
            my.scaleX = my.scaleY = sys.scale;
            my.setUrl( sys.atlas , sys.arr );
            this.myBuffMap[type] = my;
            //my.cacheAs = "bitmap";
        }
        this.player.addChild( my );
        my.play();
        return my;
    }

    public static BUFF_TIME:number = 5000;
    
    public buffOverFun( ani:MyAni ,type:number ):void{
        ani.removeSelf();
        this.bagSession.resetBuffByType(type);
        this.bagSession.resetEquip();
    }

    /**
     * 把物品飞包里去
     * @param dropItem 
     */
    public addItem( dropItem:DropItem ):void{
        if ( dropItem.sysItem.itemType == EQUIP_TYPE.PET ) {
            this.petSession.addEgg();
            this.flyToBagIcon( dropItem );
            return;
        }
        if ( this.bagSession.addEquipInBagBySys( dropItem.sysItem) ) {
            this.flyToBagIcon( dropItem );
            App.sendEvent( MyEvent.GET_NEW_ITEM );
            if( this.newerSession.isNew ){
                this.checkNewer3();
            }
            return;
        }
        let str = this.getEquipName( dropItem.sysItem.itemType );
        Tips.show( str + "栏已满");
    }

    public getEquipName(type:number):string{
        if( type == EQUIP_TYPE.WEAPON ){
            return "武器";
        }else if( type == EQUIP_TYPE.BODY ){
            return "盔甲";
        }else if( type == EQUIP_TYPE.HEAD ){
            return "头盔";
        }else if( type == EQUIP_TYPE.HORSE ){
            return "坐骑";
        }
    }

    public flyToBagIcon(d: DropItem): void {
        App.getInstance().gameSoundManager.playEffect( "sound/fx_openBox.wav" );
        //Laya.SoundManager.playSound("sound/fx_openBox.wav");
        d.setStat(0);
        //MyEffect.flyToTarget(d, this.battleScene.roleBtn);
        MyEffect.flyToTarget(d, this.battleScene.btnBox );
    }

    public addHpFun():void {
        this.rebirthMonster();
        if (this.nowHp == this.maxHp) {
            return;
        }
        this.hpMax();
        let my = this.playMyAni( 100 );
        my.once( Laya.Event.COMPLETE,this,this.addHpComFun , [my] );
        App.getInstance().gameSoundManager.playEffect( "sound/fx_openBox.wav" );
        let myclip = new MyClip();
        myclip.playOnceAndRemove(1);
    }

    public addHpComFun( my:MyAni ):void {
        //this.buffLayer.addhp.visible = false;
        my.removeSelf();
    }

    public hpMax():void {
        this.nowHp = this.maxHp;
        this.battleScene.hpMax();
    }

    /**
     * 复活怪物
     */
    public rebirthMonster(): void {
        if( this.isRebirth ){
            return;
        }
        
        this.isRebirth = true;
        for (let i of this.spriteArr) {
            if( i.disType == DISPLAY_TYPE.MONSTER || i.disType == DISPLAY_TYPE.BOSS ) {
                if ( i.isDead ) {
                    i.setSysEnemy(this.battleSession.getNewMonster());
                    i.resetPos();
                    if ( i.x < this.playerView.x ) {
                        i.setScaleX(-1);
                        //修改怪物复活时的朝向
                    } else {
                        i.setScaleX(1);
                    }
                }else{
                    i.resetHp();
                }
            }
        }
    }

    public checkNewer3():void{
        if( this.newerSession.itemnum >= 2 ){
            this.clearMouse();
            App.getInstance().eventManager.once( MyEvent.EQUIP_OVER_NEWER, this,this.newerFun10 );
        }
    }
    
    public newerFun10():void {
        this.playerCanMove = true;
        this.huifu();
        this.battleScene.tiaoguo.visible = true;
        this.battleScene.rightHand.visible = true;
        this.battleScene.tiaoguo.on(Laya.Event.CLICK,this,this.tiaoFun);
    }

    public tiaoFun():void{
        this.flyawayover();
    }

    public huifu():void{
        this.startGame();
        this.startCarmer();
        this.startBg();
    }

    /**
     * 开始游戏
     */
    public startGame():void{
        Laya.timer.frameLoop( 1, this, this.gameLoop );
    }

    public gameLoop():void {
        //子弹是无论如何都要检测的
        this.hitTest( true );
        if( this.playerHitObject.isAttack ){
            //只要是在进攻中 就啥都不能做了
            return;
        }
        if( this.playerCanMove ){
            this.efFun();
        }
    }

    /**
     * 
     * @param s 得到全局rect
     */
    public getGlobalRect(s: Laya.Sprite ): Laya.Rectangle {
        let r = new Laya.Rectangle();
        let p = s.localToGlobal( MyEffect.getP00() );
        r.x = p.x;
        r.y = p.y;
        r.width = s.width * s.globalScaleX;
        r.height = s.height * s.globalScaleY;
        return r;
    }

    public recheck():void{
        if( Laya.stage.mouseX < Laya.stage.width/2 ){
            this.playerMove( -1 );
        }else{
            this.playerMove( 1 );
        }
    }

    public mousemoveFun():void{
        this.recheck();
    }

    /**
     * 点击挂机按钮
     */
    public clickGuaBtnFun():void{
        if( this.newerSession.isNew ) {
            return;
        }
        this.isHangUp = !this.isHangUp;
        if( this.isHangUp ){
            this.dataSession.log( LogType.HANGUP_START , this.battleSession.sys.id + "" );
        }else{
            this.dataSession.log( LogType.HANGUP_OVER , this.battleSession.sys.id + "" );
        }
        this.battleScene.guaJiClip.index = (this.isHangUp?1:0);
        // this.battleScene.fightbox.on(Laya.Event.MOUSE_DOWN,this,this.moveFun);
        // Laya.stage.on( Laya.Event.MOUSE_UP ,this, this.mouseUpFun );
        if( this.isGameOver ){
            return;
        }
        if( this.isHangUp ){
            this.playerMove( 1 );
            Laya.timer.frameLoop(1,this,this.autoTurn);
            this.playerView.guaJiSp.visible = true;
        } else {
            this.playerStop();
            Laya.timer.clear(this,this.autoTurn);
            this.playerView.guaJiSp.visible = false;
        }
    }

    public autoTurn():void{
        if( this.playerView.x > this.AUTO_TURN_X ){
            this.playerMove(-1);
        }else if( this.playerView.x <= 100 ){
            this.playerMove(1);
        }
    }

    public moveFun(e:Laya.Event):void
    {
        if( this.isHangUp ){
            Tips.show( "请您先取消挂机" );
            return;
        }
        this.recheck();
        Laya.stage.on(Laya.Event.MOUSE_MOVE , this,this.mousemoveFun);
    }

    public mouseUpFun():void{
        if( this.isHangUp ){
            return;
        }
        this.playerStop();
        Laya.stage.off(Laya.Event.MOUSE_MOVE , this,this.mousemoveFun);
    }

    public isHangUp:boolean = false;    

    /**
     * 刷新装备 宠物 和 属性
     */
    public onEQUIP_UPDATE(): void {
        this.battleScene.setEquipment( this.bagSession.playerEquipArr );
        this.bagSession.setPlayerEquip( this.playerAni );
        let p = this.bagSession.playerEquipArr[ EQUIP_TYPE.PET ];//"player/pet/" + equip.id + ".png";
        this.pet.img1.skin = "player/all/" + p.id + ".png"; //Res.getItemUrl( p.id ); Res.getItemUrl( p.id );
    }

    /**
     * 播放新手引导镜头
     */
    public onSTART_NEWER_MV():void{
        this.newerMv();
    }

    public newerMv():void {
        this.moveToBoss();
    }

    public moveToBoss():void{
        this.playerCanMove = false;
        let t = new Laya.Tween();
        t.to( this.battleSp , {x:(-this.sceneWidth + Laya.stage.width) } , 1500, null , new Laya.Handler(this,this.bossJumpFun)  );
        this.clearCarmer();
        this.banFun();
    }

    public banFun():void{
        let a = new ui.scene.daguaishouUI();
        a.centerY = 0;
        this.battleScene.addChild(a);
        a.ani1.play(0,false);
        a.ani1.once(Laya.Event.COMPLETE,this,this.guaiFun,[a]);
    }

    public guaiFun( a:Laya.View ):void{
        a.removeSelf();
    }

    public bossJumpFun():void {
        this.bossHo.startMv();
        Laya.timer.once( 2500,this,this.bossMvOverFun );
    }

    public bossMvOverFun():void{
        let t = new Laya.Tween();
        t.to( this.battleSp , {x:0 } , 1000, null, new Laya.Handler(this,this.bossBackFun) );
    }

    public bossBackFun():void {
        this.bossHo.startAttackTime();
        App.sendEvent( MyEvent.JINGTOU_BACK );
        this.startCarmer();
        this.playerCanMove = true;
    }

    /**
     * 刷新玩家各项属性
     */
    public onATTRIBUTE_UPDATE(): void {
        this.battleScene.setAttribute( this.bagSession.playerEquip );
        this.updateMaxHp();
    }

    public onGOLD_UPDATE():void{
        //this.battleScene.goldFc.value = this.bagSession.gold + "";
        this.battleScene.setNowGold( this.bagSession.gold );
    }

    public onEGG_UPDATE():void{
        this.battleScene.diamondFc.value = this.petSession.eggNum + "";
        //this.btnred( this.battleScene.petBtn , this.petSession.eggNum > 0 );
    }
    

    public setBtn_click():void{
        if( this.newerSession.isNew ) {
            return;
        }
        App.dialog( MyGameInit.SettingDialog );
    }

    public roleBtn_click():void{
        if( this.newerSession.isNew && this.newerSession.itemnum < 2 ) {
            return;
        }
        App.dialog( MyGameInit.RoleDialog );
    }

    public gold_click():void{
        if( this.newerSession.isNew ) {
            return;
        }
        App.dialog( MyGameInit.TimeGoldDialog );
    }
    
    public petBtn_click():void{
        App.dialog(MyGameInit.PetDialog);
    }

    public getLoaderUrl():Array<string>{
        let arr:Array<string> = [];
        if( this.newerSession.isNew ){
            arr.push( "monsterAni/20034/clip_huoqiu.png" );
            arr.push( "monsterAni/20034/clip_huoqiuzha.png" );
            arr.push( "monsterAni/20034/hongdian.png" );
            arr = arr.concat( this.getArr("20034") );
            arr = arr.concat( this.getArr("20033") );
            arr = arr.concat( this.getArr("20019") );
        } else {
            //let arr1:Array<string> = [];
            // arr1.push( "res/atlas/texiao/jiabaoji.atlas" );
            // arr1.push( "res/atlas/texiao/jiafangyu.atlas" );
            // arr1.push( "res/atlas/texiao/jiagongji.atlas" );
            // arr1.push( "res/atlas/texiao/jiasudu.atlas" );
            // Laya.loader.load( arr1 ,null,null,null,4);
            
            // arr.push( "res/atlas/texiao/jiaxue.atlas" );
        }
        
        arr.push( "res/atlas/texiao/gongji.atlas" );
        arr.push( "res/atlas/girl.atlas" );
        arr.push( "res/atlas/battlescene.atlas" );
        
        // arr.push( "res/atlas/player/equip.atlas" );
        // arr.push( "res/atlas/player/head.atlas" );
        // arr.push( "res/atlas/player/horse.atlas" );
        // arr.push( "res/atlas/player/tou.atlas" );
        // arr.push( "res/atlas/player/pet.atlas" );
        // arr.push( "res/atlas/player/weapon.atlas" );
        
        arr.push( "res/atlas/player/all.atlas" );

        //arr.push( "res/atlas/player/weaponeffect.atlas" );
        arr.push( "scene/texiao/gongji.ani" );
        
        if( this.newerSession.isNew == false ){
            let s = this.battleSession.sys;
            let arr2 = s.monsterArr.concat();
            arr2.push( s.monsterBoss );
            // for( let i of arr2 ){
            //     let syse = <SysEnemy>App.getConfig(MyGameInit.sys_enemy,i );
            //     if( syse != null ){
            //         arr = arr.concat( this.getArr(syse.enemymode + "") );
            //     }
            // }
            if( s.stageType == 2 ){
                if( s.starID == 1001 ){
                    arr.push( "monsterAni/20034/clip_huoqiu.png" );
                    arr.push( "monsterAni/20034/clip_huoqiuzha.png" );
                    arr.push( "monsterAni/20034/hongdian.png" );
                    arr = arr.concat( this.getArr("20034") );
                }else{
                    arr.push( "monsterAni/20034/hongdian.png" );
                    arr.push( "monsterAni/20034/clip_huoqiuzha.png" );
                    arr = arr.concat( this.getArr("20068") );
                    arr.push( "scene/monsterAni/20068_1.ani" );
                }
            }else{
                if( s.starID == 1001 ){
                    arr.push( "battlescene/bg0.jpg" );
                    arr.push( "battlescene/shu1.png" );
                    arr.push( "battlescene/shu2.png" );
                }else{
                    arr.push( "battlescene/bg1.jpg" );
                }
            }
        }
        return arr;
    }

    public getAni( id:string ):Array<string>{
        let syse = <SysEnemy>App.getConfig(MyGameInit.sys_enemy, id );
        return this.getArr( syse.enemymode + "" );
    }

    public getArr( id:string ):Array<string>{
        let arr:Array<string> = [];
        //arr.push( "res/atlas/monsterAni/" + id + ".png" );
        arr.push( "res/atlas/monsterAni/" + id + ".atlas" );
        arr.push( "scene/monsterAni/" + id + ".ani" );
        return arr;
    }
 
    public getLoaderPreUrl():Array<string>{
        return;
        if( this.newerSession.isNew ){
            return null;
        }
        
        let arr:Array<string> = [];
        arr.push( "sound/alert.mp3" );
        arr.push( "sound/comboEffect1.wav" );
        arr.push( "sound/fx_button.wav" );
        arr.push( "sound/fx_Hit.wav" );
        arr.push( "sound/fx_itemBad.wav" );
        arr.push( "sound/fx_itemGood.wav" );
        arr.push( "sound/fx_itemSelect.wav" );
        arr.push( "sound/fx_lose.wav" );
        arr.push( "sound/fx_move.wav" );
        arr.push( "sound/fx_openBox.wav" );
        arr.push( "sound/fx_success.wav" );

        arr.push( MyGameInit.GameOverDialog );
        arr.push( MyGameInit.FlyBoxDialog );
        arr.push( MyGameInit.SettingDialog );
        arr.push( MyGameInit.TimeGoldDialog );
        arr.push( MyGameInit.GetGoldDialog  );
        
        arr.push( "res/atlas/shengli.atlas" );
        arr.push( "res/atlas/flybox.atlas" );
        arr.push( "res/atlas/setdialog.atlas" );
        return arr;
    }

    /**
     * 手指头
     */
    public onSHOUZHITOU():void{
        let v = NewerSession.getHand();
        this.battleScene.addChild( v );
        v.ani1.play();
        v.lightClip.interval = 1000/10;
        v.x = this.battleScene.btnBox.x - 10;
        v.y = this.battleScene.btnBox.y;
    }

    public onRED_UPDATE():void {
        this.btnred( this.battleScene.roleBtn , this.bagSession.haveNewEquip() );
    }

    public onFLASH_RED():void {
        this.flashRedTan();
        this.alnum = 0;
        Laya.timer.loop( 500,this,this.alertSoundFun );
        this.alertSoundFun();
    }

    public flashRedTan():void{
        let a = new ui.scene.RedFlashUI();
        this.battleScene.addChild(a);
        a.ani1.play(0,false);
        a.ani1.on(Laya.Event.COMPLETE,this,this.flashRedTanComFun,[a]);
        a.right = 15;
        a.y = this.playerView.y - 150;
    }

    public flashRedTanComFun(a:Laya.Sprite):void{
        a.removeSelf();
    }

    public alnum:number = 0;

    public alertSoundFun():void{
        App.getInstance().gameSoundManager.playEffect( "sound/alert.mp3" );
        //Laya.SoundManager.playSound("sound/alert.mp3");
        this.alnum++;
        if( this.alnum == 3 ){
            Laya.timer.clear( this,this.alertSoundFun );
        }
    }

    public btnred( btn:Laya.Button , value:boolean ):void{
        let v:ui.scene.hongtanUI = <any>btn.getChildByName("red");
        v.visible = value;
        if( value ){
            v.ani1.play(0,true);
        }else{
            v.visible = false;
        }
    }
}