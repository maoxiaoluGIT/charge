import Mediator from "./Mediator";
import IGameInit from "./IGameInit";
import Session from "./Session";
import ConfigManager from "./ConfigManager";
import SceneData from "./SceneData";
import GameSoundManager from "./GameSoundManager";
import GameEvent from "./GameEvent";
import OpenDialogManager from "./OpenDialogManager";

export default class App {
    constructor() {

    }

    private static instance: App = null;

    public static getInstance(): App {
        if (App.instance == null) {
            App.instance = new App();
        }
        return App.instance;
    }

    public eventManager: Laya.EventDispatcher = new Laya.EventDispatcher();
    public configManager: ConfigManager = new ConfigManager();
    public gameSoundManager: GameSoundManager = new GameSoundManager();
    public openDialogManager: OpenDialogManager = new OpenDialogManager();

    /**
     * 存储mediator的map
     */
    private sceneMap: object = {};

    private injMap: any = {};

    /**
     * 注册场景
     * @param url 
     * @param sceneClass 
     * @param mediatorClass 
     */
    public regScene(url: string, sceneClass: any, mediatorClass: any = null, bgm: string = null): void {
        let data = new SceneData();
        data.sceneClass = sceneClass;
        data.mediatorClass = mediatorClass;
        this.sceneMap[url] = data;
        if (bgm) {
            this.gameSoundManager.reg(url, bgm);
        }
    }

    /**
     * 打开场景
     * @param url 
     * @param closeOther 
     * @param param 
     */
    public openScene(url: string, closeOther: boolean = true, param: any = null, isDialog: boolean = false): void {
        if (!isDialog) {
            App.getInstance().eventManager.event(GameEvent.OPEN_SCENE_START, url);
        }

        if (closeOther) {
            Laya.Dialog.closeAll();
        }
        if (isDialog == false) {
            this.closeAllScene();
            Laya.Scene.showLoadingPage(null, 0);
            this.nowSceneUrl = url;
        }
        let sdata: SceneData = this.sceneMap[url];
        let loadArr: Array<any> = null;
        if (sdata.mediatorInstance) {
            loadArr = sdata.mediatorInstance.getLoaderUrl();
        } else {
            if (sdata.mediatorClass) {
                let m: Mediator = new sdata.mediatorClass();
                sdata.mediatorInstance = m;
                this.injOne(m);
                loadArr = m.getLoaderUrl();
            }
        }
        if (isDialog && loadArr) {
            Laya.timer.once(100, this, this.delayLockFun);
        }

        if (loadArr) {
            for (let i = 0; i < loadArr.length; i++) {
                const element = loadArr[i] + "";
                if (element.indexOf("https") == -1) {
                    loadArr[i] = Laya.URL.basePath + element;
                }
            }
        }

        if (loadArr) {
            Laya.loader.load(loadArr, new Laya.Handler(this, this.loadSceneFun, [url, closeOther, param]), new Laya.Handler(this, this.proFun));//, new Laya.Handler( this,this.proFun )
        } else {
            this.loadSceneFun(url, closeOther, param);
        }
    }

    public delayLockFun(): void {
        Laya.Dialog.manager.lock(true);
    }

    public proFun(value: number): void {
        Laya.Scene["_loadPage"].event(Laya.Event.PROGRESS, value);
    }

    /**
     * 场景全部关闭
     */
    public closeAllScene(): void {
        this.sceneRoot.removeChildren();
    }

    /**
     * 当前场景的url
     */
    public nowSceneUrl: string;

    /**
     * 打开面板
     * @param url 
     * @param closeOther 
     * @param param 
     */
    public openDialog(url: string, closeOther: boolean = true, param: any = null): void {
        this.openScene(url, closeOther, param, true);
        //Laya.Scene.load(url, new Laya.Handler(this, this.loadSceneFun, [url, closeOther, param]));
    }

    public static dialog(url: string, closeOther: boolean = true, param: any = null): void {
        App.getInstance().openDialog(url, closeOther, param);
    }

    /**
     * 加载完毕
     * @param url 
     * @param closeOther 
     * @param param 
     */
    private loadSceneFun(url: string, closeOther: boolean = true, param: any = null): void {
        Laya.timer.clear(this, this.delayLockFun);
        Laya.Scene.hideLoadingPage(100);
        let data: SceneData = this.sceneMap[url];
        let disInstance: Laya.Sprite = null;
        let mInstance: Mediator = null;
        if (data.sceneInstance) {
            //已经创建过了 直接拿缓存里的
            disInstance = data.sceneInstance;
            mInstance = data.mediatorInstance;
        } else {
            //第一次创建显示对象 但是mediator已经创建完了
            disInstance = new data.sceneClass();
            data.sceneInstance = disInstance;
            if (data.mediatorInstance) {
                mInstance = data.mediatorInstance;
                this.autoRegClick(disInstance, mInstance);
                mInstance.setSprite(disInstance);
            }
        }

        if (mInstance) {
            this.autoRegEvent(mInstance);
            mInstance.setParam(param);
            mInstance.init();
        }

        disInstance.once(Laya.Event.UNDISPLAY, this, this.undisFun, [mInstance, url]);

        if (disInstance instanceof Laya.Dialog) {
            if (disInstance.isShowEffect == false) {
                disInstance.popup(closeOther, false);
            } else {
                disInstance.isShowEffect = false;
                disInstance.open(closeOther);
                this.dialogEff(disInstance);
            }
            disInstance.url = url;
            this.eventManager.event(GameEvent.OPEN_DIALOG, url);
        }
        else  {
            this.sceneRoot.addChild(disInstance);
            disInstance.x = (Laya.stage.width - disInstance.width) / 2;
            disInstance.y = (Laya.stage.height - disInstance.height) / 2;
            if (mInstance) {
                let arr2 = mInstance.getLoaderPreUrl();
                if (arr2) {
                    Laya.loader.load(arr2);
                }
            }
            this.eventManager.event(GameEvent.ENTER_SCENE, url);
        }

        this.eventManager.event(GameEvent.OPEN_SCENE, url);
    }

    public dialogEff(dialog: Laya.Dialog): void {
        let t = new Laya.Tween();
        dialog.scale(1, 1);
        dialog.alpha = 1;
        dialog.anchorX = 0.5;
        dialog.anchorY = 0.5;
        dialog.x = Laya.stage.width / 2;
        dialog.y = Laya.stage.height / 2;
        t.from(dialog, { x: Laya.stage.width / 2, y: Laya.stage.height / 2, alpha: 0, scaleX: 3, scaleY: 3 }, 200);
        dialog.isShowEffect = true;
    }

    private undisFun(m: Mediator, url: string): void {
        this.eventManager.offAllCaller(m);
        Laya.stage.offAllCaller(m);
        Laya.timer.clearAll(m);
        App.sendEvent(GameEvent.CLOSE_DIALOG, url);
    }

    private undisplayFun(sp: Laya.Sprite, url: string): void {

    }

    /**
     * 初始化引擎方法
     * @param initClass 实现IGameInit接口的实现类
     */
    public setGameInit(initClass: any): void {
        let gameinit: IGameInit = new initClass();
        gameinit.initAction();
        gameinit.initSession();
        this.initInjection();
        gameinit.initScence();
        gameinit.initConfig();
        gameinit.initSound();
    }

    private initInjection(): void {
        for (let i in this.injMap) {
            this.injOne(this.injMap[i]);
            this.autoRegEvent(this.injMap[i]);
        }
    }

    /**
     * 给一个对象注入
     */
    public injOne(obj: Object): void {
        for (var str in obj) {
            if (obj[str] == null && this.injMap[str]) {
                obj[str] = this.injMap[str];
            }
        }
    }

    private actionMap: Object = {};

    public regAction(actionId: number, actionClass: any): void {
        // var action:Action = new actionClass();
        // action.setActionId(actionId);
        // actionMap[actionId] = action;
        // regInjection( getInjectionName(action) , action );
    }

    /**
     * 注册session
     * @param sessionClass 传入类
     */
    public regSession(sessionClass: any): void {
        var session: Session = new sessionClass();
        this.regInjection(this.getInjectionName(session), session);
    }

    /** 
     * 得到注册实例的字符串 
     * */
    public getInjectionName(instance: any): string {
        return App.toLowHead(App.getClassName(instance));
    }

    /**
     * 返回首字母小写的字符串
     */
    public static toLowHead(str: string): string {
        return str.charAt(0).toLowerCase() + str.substr(1);
    }

    /**
     * 得到类或者实例的字符串名字
     */
    public static getClassName(tar: Object): string {
        if (tar instanceof Function) {
            return tar["name"];
        }
        return tar["constructor"]["name"];
    }

    public getSession(key: string): Session {
        return this.injMap[key];
    }

    /**
	* 注册注入的key和实例
	*/
    public regInjection(str: string, obj: Object): void {
        this.injMap[str] = obj;
    }

    /**
     * 存储事件key的
     */
    public eventMap: Object = {};
    public initEvent(obj: Object): void {
        for (var key in obj) {
            this.eventMap["on" + key] = key;
        }
    }

    /**
    * 自动注册全局事件 无需自己监听
    */
    public autoRegEvent(obj: Object): void {
        this.regChildEvent(obj);
        this.regFunEvent(obj, Object.getPrototypeOf(obj));
    }

    public regFunEvent(eventObj: any, obj: any): void {
        let arr = Object.getOwnPropertyNames(obj);
        for (let k of arr) {
            if (this.eventMap[k] != null) {
                this.eventManager.on(this.eventMap[k], eventObj, obj[k]);
            }
        }
    }

    private regChildEvent(obj: any): void {
        if (obj == null) {
            return;
        }
        for (let key in obj) {
            if (obj[key] instanceof Function) {
                if (this.eventMap[key] != null) {
                    this.eventManager.on(this.eventMap[key], obj, obj[key]);
                }
            }
        }
    }

    public autoRegClick(sp: Laya.Sprite, obj: Object): void {
        for (var key in sp) {
            if (sp[key] instanceof Laya.Button) {
                if (obj[key + "_click"] != null) {
                    (<Laya.Button>sp[key]).clickHandler = new Laya.Handler(obj, obj[key + "_click"]);
                }
            }
        }
    }

    /**
    * 从数组里得到一个值 不是索引!
    */
    public static RandomByArray(arr: Array<any>, deleteArr: boolean = false): any {
        let value = Math.random() * arr.length;
        let index = Math.floor(value);
        let resvalue = arr[index];
        if (deleteArr) {
            arr.splice(index, 1);
        }
        return resvalue;
    }

    /**
     * 包含最小和最大的值
     */
    public static getRandom2(min: number, max: number): number {
        var a: number = max - min + 1;
        var ag: number = 1 / a;
        var va: number = Math.random() / ag;
        return Math.floor(va) + min;
    }

    /**
     * 随机权重
     * 返回索引
    */
    public static RandomWeight(valueArr: Array<number>, randomArr: Array<number>): number  {
        let max: number = 0;
        for (let j of randomArr) {
            max += j;
        }
        let now: number = 0;
        let r: number = Math.random() * max;
        for (let i in randomArr) {
            now += randomArr[i];
            if (r < now) {
                return valueArr[i];
            }
        }
        return 0;
    }

    /**
     * 得到某个配置
     * @param fileName 
     * @param key 
     */
    public static getConfig(fileName: string, key: any): any {
        return App.getInstance().configManager.getConfig(fileName, key);
    }

    public static sendEvent(type: string, data: any = null): void {
        App.getInstance().eventManager.event(type, data);
    }

    public static onEvent(type: string, caller: any, listener: Function, args?: any[]): void {
        App.getInstance().eventManager.on(type, caller, listener, args);
    }

    public static onceEvent(type: string, caller: any, listener: Function, args?: any[]): void {
        App.getInstance().eventManager.once(type, caller, listener, args);
    }

    /**
     * 绑定某个显示对象 他会自动移除
     * @param target 
     * @param attribute 
     * @param value 
     */
    public static bind(target: Laya.Sprite, attribute: string, value: any): void {

    }

    public static COMPLETE_REMOVE(e: Laya.EventDispatcher, removeSprite: Laya.Sprite = null): void {
        e.once(Laya.Event.COMPLETE, null, App.comFun, [removeSprite ? removeSprite : e]);
    }

    public static comFun(a: Laya.Sprite): void {
        a.removeSelf();
    }

    /**
         * 他会自动帮你拼参数 
         * 你不需要get的时候把参数拼在url后面
         * 也就是说get 和 post 是是一样的
         */
    public static http(url: string, data: any, method: string, caller: any = null, listener: Function = null, args: Array<any> = null): Laya.HttpRequest {
        var http = new Laya.HttpRequest();
        if (method == "GET") {
            url = url + "?" + data;
            data = null;
        }
        http.send(url, data, method);
        if (caller && listener) {
            http.once(Laya.Event.COMPLETE, caller, listener, args);
        }
        return http;
    }

    /**
     * 是否是在模拟器
     */
    public static isSimulator(): Boolean {
        if (Laya.Browser.onMiniGame) {
            return Laya.Browser.window.wx.getSystemInfoSync().brand == "devtools";
        } else {
            return false;
        }
    }

    public static GAME_VER: string = "";
    public static ONLY_ID: number = Math.random();
    public static LOG_IP: string = "";

    public static log(type: number, content: string = ""): void {
        // var arr:Array<any> = [];
        // arr.push( Laya.Browser.now() );
        // arr.push( App.GAME_VER );
        // arr.push( this.saveKey );
        // arr.push( this.platform );
        // arr.push( App.ONLY_ID );
        // arr.push( type );
        // arr.push( content );
        // var str:String = "";
        // for( var i:number = 0; i < arr.length; i++ ){
        //     str+=( arr[i] + "\t" );
        // }
        // App.http(  App.LOG_IP , str ,"post" );
    }

    public sceneRoot: Laya.Sprite = new Laya.Sprite();

    public init(): void {
        Laya.stage.addChild(this.sceneRoot);
        //Laya.Dialog.manager.closeEffectHandler = new Laya.Handler( this,this.closeEffectFun );
    }

    public closeEffectFun(dialog: Laya.Dialog): void {
        Laya.Tween.to(dialog, { scaleX: 4, scaleY: 4, alpha: 0 }, 200, null, new Laya.Handler(Laya.Dialog.manager, Laya.Dialog.manager.doClose, [dialog]), 0, false, false);
    }
}