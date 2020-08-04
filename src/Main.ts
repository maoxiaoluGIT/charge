import GameConfig from "./GameConfig";
import Session from "./game/Session";
import App from "./game/App";
import MyGameInit from "./mygame/MyGameInit";
import ZipLoader from "./game/ZipLoader";
import MyEvent from "./mygame/MyEvent";
import MyEffect from "./mygame/effect/MyEffect";
import { SysItem, SysStageInfo } from "./mygame/config/SysConfig";
import LoadView from "./mygame/scene/LoadView";
import GameEvent from "./game/GameEvent";
import DataSession from "./mygame/session/DataSession";
import { ui } from "./ui/layaMaxUI";
import LoadView2 from "./mygame/scene/LoadView2";
import LogType from "./mygame/session/LogType";
import MyConfig from "./MyConfig";
import MyDeBug from "./MyDeBug";

class Main {

	public t: Laya.Text = null;

	constructor() {

		UIConfig.closeDialogOnSide = false;
		Laya.MouseManager.multiTouchEnabled = false;
		//根据IDE设置初始化引擎		
		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
		Laya["Physics"] && Laya["Physics"].enable();
		Laya["DebugPanel"] && Laya["DebugPanel"].enable();

		Laya.URL.basePath = "https://img.kuwan511.com/rideGame/" + DataSession.GAME_VER + "/";
		Laya.stage.scaleMode = GameConfig.scaleMode;
		Laya.stage.screenMode = GameConfig.screenMode;
		//兼容微信不支持加载scene后缀场景
		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
		if (GameConfig.stat) Laya.Stat.show();
		Laya.alertGlobalError = true;
		if (Laya.Browser.onMiniGame == false) {
			//Laya.Stat.show();
		}
		Laya.stage.bgColor = "#000000";
		UIConfig.popupBgAlpha = 0.7;
		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
		// if( Laya.Browser.onMiniGame ){

		// }else{
		// 	Laya.stage.scaleMode = Laya.Stage.SCALE_SHOWALL;
		// 	if( Laya.Browser.onPC ){
		// 		Laya.stage.screenMode = Laya.Stage.SCREEN_HORIZONTAL;
		// 	}else{
		// 		Laya.stage.screenMode = Laya.Stage.SCREEN_VERTICAL;
		// 	}
		// 	Laya.stage.alignH = "center"; 
		// }

		Laya.ClassUtils.regClass("laya.ui.WXOpenDataViewer", Laya.WXOpenDataViewer);
		Laya.ClassUtils.regClass("Laya.WXOpenDataViewer", Laya.WXOpenDataViewer);

		this.t = new Laya.Text();
		this.t.color = "#ffffff";
		this.t.fontSize = 40;
		this.t.y = Laya.stage.height / 2;
		Laya.stage.addChild(this.t);
		this.setText("正在加载config文件");

		//return;
		//https://img.kuwan511.com/rideGame/5.0.0/config.json?ver=0.003775224141680411
		console.log(Laya.URL.basePath + "config.json?ver=" + Math.random());
		Laya.loader.load("config.json?ver=" + Math.random(), new Laya.Handler(this, this.configFun), null, Laya.Loader.JSON);
		DataSession.staticLog(LogType.LOAD_CONFIG);

		// Laya.Browser.window.wx = Laya.Browser.window.qg;
		// console.log( Laya.Browser.window.wx );
		// console.log( Laya.Browser.window.qg );
	}

	public configFun(configJson: any): void {
		try {
			console.log(configJson);

			DataSession.staticLog(LogType.LOAD_VERSION, JSON.stringify(configJson));
			MyConfig.IP = configJson.IP;
			//MyConfig.PLATFORM = configJson.PLATFORM;
			MyConfig.PLATFORM = configJson.PLATFORM = 0;
			MyConfig.TEST = configJson.TEST;
			// if( MyConfig.PLATFORM == 10 ){
			// 	Laya.URL.basePath = "https://img.kuwan511.com/rideGame/4.2.0/";
			// }
		} catch (error) {
			console.log(222);
			DataSession.staticLog(LogType.LOAD_CONFIG_ERR);
			MyConfig.IP = "https://game.kuwan511.com/";
			MyConfig.PLATFORM = 1;
			MyConfig.TEST = 0;
		}
		//ZipLoader.load("all.zip",new Laya.Handler(this,this.allZipFun) );
		this.loadVersion();
		//this.setText( "正在加载version文件" );
	}

	public allZipFun(arr: Array<string>): void {
		let j = JSON.parse(arr[1]);
		let l = new Laya.Loader();
		(<any>l).parsePLFData(j);
		for (let k in j.json) {
			if (k.indexOf(".atlas") == -1) {
				Laya.loader.cacheRes(k, j.json[k]);
				//Laya.loader.load( k);
			}
		}
		//this.loadVersion();
		//this.onVersionLoaded();
	}

	public loadVersion(): void {
		Laya.ResourceVersion.enable("version.json?v=" + Math.random(), Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
	}

	onVersionLoaded() {
		this.setText("正在加载fileconfig文件");
		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
		DataSession.staticLog(LogType.LOAD_fileconfig);

		//this.onConfigLoaded();
		// var arr = [];
		// arr.push("res/atlas/newhand.atlas");
		// arr.push("res/atlas/sence.atlas");
		// arr.push("res/atlas/shengli.atlas");
		// arr.push("res/atlas/loading.atlas");
		// arr.push("res/atlas/rank.atlas");
		// Laya.loader.load(arr, new Laya.Handler(this, this.uiFun));
	}
	onConfigLoaded() {
		//Laya.loader.load("res/atlas/loading.atlas", new Laya.Handler(this, this.uiFun));
		this.uiFun(null);
	}

	public uiFun(arr: Array<string>): void {
		//Laya.View.uiMap = JSON.parse(arr[1]);
		//console.log( Laya.View.uiMap );
		//new LoadingScene()

		MyDeBug.trace("ui");

		this.setText("正在加载游戏配置文件");

		// if( arr != null ){
		// 	for( let i :number = 0; i < arr.length; i+=2 ){
		// 		Laya.loader.cacheRes( arr[i] , JSON.parse( arr[i+1] ) );
		// 	}
		// }

		App.getInstance().init();
		//console.log( Laya.Loader.loadedMap );
		let lv = new LoadView2();
		lv.zOrder = 1000000;
		Laya.Scene.setLoadingPage(lv);
		Laya.Scene.showLoadingPage();
		Laya.SoundManager.setMusicVolume(0.2);
		MyDeBug.trace("1");
		App.getInstance().initEvent(GameEvent);
		App.getInstance().initEvent(MyEvent);
		App.getInstance().setGameInit(MyGameInit);
		MyDeBug.trace("2");
		Laya.Dialog.manager.setLockView(<any>new LoadView());
		MyDeBug.trace("3");

		ZipLoader.load("config.zip?ver=" + Math.random(), new Laya.Handler(this, this.zipFun));

		DataSession.staticLog(LogType.LOAD_CONFIGZIP);
	}

	public zipFun(arr: Array<string>): void {

		App.getInstance().configManager.init(arr);

		SysItem.init();
		SysStageInfo.init();

		App.sendEvent(MyEvent.LOGIN);

		MyEffect.init();
		this.t.removeSelf();
	}

	public setText(text: string): void {
		this.t.text = text;
		this.t.x = (Laya.stage.width - this.t.textWidth) / 2;
		//let t = new Laya.Tween();
		//t.from( this.t,{alpha:0} , 300 );
	}
}
//激活启动类
new Main();