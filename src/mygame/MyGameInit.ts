import IGameInit from "../game/IGameInit";
import App from "../game/App";

import MainScene from "./scene/MainScene";
import MainSceneMediator from "./mediator/MainSceneMediator";
import SelectStageScene from "./scene/SelectStageScene";
import SelectStageMediator from "./mediator/SelectStageMediator";
import BattleScene from "./scene/BattleScene";
import BattleSceneMediator from "./mediator/BattleSceneMediator";
import { SysStageInfo, SysStageMap, SysEnemy, SysItem, SysCompose, SysPet, SysSkill, SysTalent, SysTalentCost, SysMission, SysTalentInfo } from "./config/SysConfig";
import BattleSession from "./session/BattleSession";
import RoleDialog from "./scene/RoleDialog";
import RoleDialogMediator from "./mediator/RoleDialogMediator";
import BagSession from "./session/BagSession";
import GameOverDialogMediator from "./mediator/GameOverDialogMediator";
import TreasureDialogMediator from "./mediator/TreasureDialogMediator";
import TimeGoldDialogMediator from "./mediator/TimeGoldDialogMediator";
import TimeGoldSession from "./session/TimeGoldSession";
import GetGoldMediator from "./mediator/GetGoldMediator";
import SdkSession from "./session/SdkSession";
import FlyBoxMediator from "./mediator/FlyBoxMediator";
import PetSession from "./session/PetSession";
import DataSession from "./session/DataSession";
import TestLoginMediator from "./mediator/TestLoginMediator";
import KillBossDialogMediator from "./mediator/KillBossDialogMediator";
import GameSoundManager from "../game/GameSoundManager";
import NewerMediator from "./mediator/NewerMediator";
import NewerSession from "./session/NewerSession";
import SetSession from "./session/SetSession";
import RankDialog from "./scene/RankDialog";
import Stage2Mediator from "./mediator/Stage2Mediator";
import TianFuMediator from "./mediator/TianFuMediator";
import TaskMediator from "./mediator/TaskMediator";
import TianFuSession from "./session/TianFuSession";
import RankMediator from "./mediator/RankMediator";
import RankInfoMediator from "./mediator/RankInfoMediator";
import ZhuanMediator from "./mediator/ZhuanMediator";
import SettingMediator from "./mediator/SettingMediator";
import TaskSession from "./session/TaskSession";
import AdMergeDialogMediator from "./mediator/AdMergeDialogMediator";
import { ui } from "../ui/layaMaxUI";
import LeuokSession from "./session/LeuokSession";
import MergeShareMediator from "./mediator/MergeShareMediator";
import NewGetItemMediator from "./mediator/NewGetItemMediator";
import TreasureSession from "./session/TreasureSession";

export default class MyGameInit implements IGameInit {
    public app: App;
    constructor() {
        this.app = App.getInstance();
    }

    public initSession(): void {
        this.app.regSession(BattleSession);
        this.app.regSession(BagSession);
        this.app.regSession(TimeGoldSession);
        this.app.regSession(SdkSession);
        this.app.regSession(PetSession);
        this.app.regSession(DataSession);
        this.app.regSession(NewerSession);
        this.app.regSession(SetSession);
        this.app.regSession(TianFuSession);
        this.app.regSession(TaskSession);
        this.app.regSession(TreasureSession);
        //根据平台注册
        if( Laya.Browser.onMiniGame ){
            //this.app.regSession( LeuokSession );
        }
    }

    public initAction(): void {

    }

    public initSound():void{
        this.app.gameSoundManager.reg( GameSoundManager.BTN , "sound/fx_button.wav" );
    }

    public static MainScene: string = "scene/MainScene.scene";
    public static SelectStage: string = "scene/SelectStageDialog.scene";
    public static BattleScene: string = "scene/BattleScene.scene";
    public static RoleDialog: string = "scene/RoleDialog.scene";
    public static SettingDialog: string = "scene/SettingDialog.scene";
    
    public static GameOverDialog: string = "scene/shengli.scene";

    public static TreasureDialog: string = "scene/TreasureDialog.scene";
    public static TimeGoldDialog: string = "scene/TimeGold.scene";
    public static SignDialog: string = "scene/SignDialog.scene";
    public static GetGoldDialog: string = "scene/GetGoldDialog.scene";
    public static FlyBoxDialog: string = "scene/FlyBox.scene";
    public static PetDialog: string = "scene/PetDialog.scene";
    public static TestScene:string = "scene/TestLogin.scene";
    public static KillBossDialog:string = "scene/KillBossDialog.scene";
    public static NewerScene:string = "scene/NewerScene.scene";
    public static RankDialog:string = "scene/RankDialog.scene";
    public static SelectStage2:string = "scene/SelectStage2.scene";
    public static SelectStage3:string = "scene/SelectStage3.scene";

    public static TIANFU:string = "scene/TianFuDialog.scene";
    public static TASK:string = "scene/TaskDialog.scene";
    public static RANK_INFO:string = "scene/RankInfoDialog.scene";
    public static ZHUAN:string = "scene/Zhuan.scene";
    public static AD_MERGE_DIALOG:string = "scene/AdMergeDialog.scene";
    public static SHARE_MERGE_DIALOG:string = "scene/MergeShareDialog.scene";
    public static NewGetItemDialog:string = "scene/GetItemDialog.scene";
    public static TASK_REWARD:string = "scene/TaslReward.scene";

    public initScence(): void {
        
        this.app.regScene(MyGameInit.MainScene, ui.scene.MainSceneUI , MainSceneMediator , "sound/BGM_Title.mp3" );
        
        this.app.regScene(MyGameInit.BattleScene, BattleScene , BattleSceneMediator );
        this.app.regScene(MyGameInit.RoleDialog, RoleDialog, RoleDialogMediator);


        this.app.regScene(MyGameInit.SettingDialog, ui.scene.SettingDialogUI , SettingMediator );
        this.app.regScene(MyGameInit.GameOverDialog, ui.scene.shengliUI , GameOverDialogMediator);
        
        this.app.regScene(MyGameInit.TreasureDialog, ui.scene.TreasureDialogUI , TreasureDialogMediator);
        this.app.regScene(MyGameInit.TimeGoldDialog, ui.scene.TimeGoldUI , TimeGoldDialogMediator );
        //this.app.regScene(MyGameInit.SignDialog, SignDialog, SignDialogMediator);
        //this.app.regScene(MyGameInit.GetGoldDialog, ui.scene.GetGoldDialogUI , GetGoldMediator);
        this.app.regScene(MyGameInit.FlyBoxDialog, ui.scene.FlyBoxUI, FlyBoxMediator);
        //this.app.regScene(MyGameInit.PetDialog, ui.scene.PetDialogUI, PetDialogMediator);
        this.app.regScene(MyGameInit.TestScene , ui.scene.TestLoginUI , TestLoginMediator );
        this.app.regScene(MyGameInit.KillBossDialog, ui.scene.KillBossDialogUI , KillBossDialogMediator );
        this.app.regScene(MyGameInit.NewerScene , ui.scene.NewerSceneUI , NewerMediator  );
        this.app.regScene(MyGameInit.RankDialog , ui.scene.RankDialogUI , RankMediator );
        
        this.app.regScene(MyGameInit.SelectStage  , ui.scene.SelectStageDialogUI , Stage2Mediator );
        this.app.regScene(MyGameInit.SelectStage2 , ui.scene.SelectStage2UI , Stage2Mediator );
        this.app.regScene(MyGameInit.SelectStage3 , ui.scene.SelectStage3UI , Stage2Mediator );

        this.app.regScene(MyGameInit.TIANFU ,ui.scene.TianFuDialogUI , TianFuMediator );
        this.app.regScene(MyGameInit.TASK ,ui.scene.TaskDialogUI , TaskMediator );
        this.app.regScene(MyGameInit.RANK_INFO ,ui.scene.RankInfoDialogUI , RankInfoMediator );

        this.app.regScene( MyGameInit.ZHUAN , ui.scene.ZhuanUI , ZhuanMediator );

        this.app.regScene( MyGameInit.AD_MERGE_DIALOG , ui.scene.AdMergeDialogUI , AdMergeDialogMediator );
        
        this.app.regScene( MyGameInit.SHARE_MERGE_DIALOG , ui.scene.MergeShareDialogUI , MergeShareMediator );
        
        this.app.regScene( MyGameInit.NewGetItemDialog , ui.scene.GetItemDialogUI , NewGetItemMediator );
    
        //this.app.regScene( MyGameInit.TASK_REWARD , ui.scene.TaskRewardUI ,  );
    }

    /**
     * 关卡的名字 和 管卡的信息 管卡的id等
     */
    public static sys_stagemap: string = "sys_stagemap.txt";
    /**
     * 这个关卡的细节表 比如 里面有什么怪 boss怪是啥 掉啥物品
     */
    public static sys_stageinfo: string = "sys_stageinfo.txt";
    /**
     * 敌人信息表
     */
    public static sys_enemy: string = "sys_enemy.txt";
    /**
     * 物品武器表
     */
    public static sys_item: string = "sys_item.txt";
    /**
     * 合成概率
     */
    public static sys_compose: string = "sys_compose.txt";
    /**
     * 宠物表
     */
    public static sys_pet:string = "sys_pet.txt";
    /**
     * 技能表
     */
    public static sys_skill:string = "sys_skill.txt";

    /**
     * 天赋表
     */
    public static sys_talent:string = "sys_talent.txt";

    public static sys_talentcost:string = "sys_talentcost.txt";

    public static sys_mission:string = "sys_mission.txt";

    public static sys_talentinfo:string = "sys_talentinfo.txt";

    public initConfig(): void {
        this.app.configManager.regConfig(MyGameInit.sys_stagemap, SysStageMap, "id");
        this.app.configManager.regConfig(MyGameInit.sys_enemy, SysEnemy, "id");
        this.app.configManager.regConfig(MyGameInit.sys_stageinfo, SysStageInfo, "id");
        this.app.configManager.regConfig(MyGameInit.sys_item, SysItem, "id");
        this.app.configManager.regConfig(MyGameInit.sys_compose, SysCompose, "itemId");
        this.app.configManager.regConfig(MyGameInit.sys_pet,SysPet,"id");
        this.app.configManager.regConfig(MyGameInit.sys_skill,SysSkill,"id");
        this.app.configManager.regConfig(MyGameInit.sys_talent , SysTalent , "id");
        this.app.configManager.regConfig(MyGameInit.sys_talentcost , SysTalentCost , "id");
        this.app.configManager.regConfig(MyGameInit.sys_mission , SysMission  , "id" );
        this.app.configManager.regConfig(MyGameInit.sys_talentinfo , SysTalentInfo , "id" );
    }
}