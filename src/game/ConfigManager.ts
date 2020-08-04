import ConfigData from "./ConfigData";
import App from "./App";
import GameEvent from "./GameEvent";

export default class ConfigManager {
    constructor() {

    }

    private configMap: any = {};
    
    public init(arr: Array<string>): void {
        for (var i: number = 0, len: number = arr.length; i < len; i += 2) {
            var fileName: string = arr[i];
            var fileContent: string = arr[i + 1];
            var configData: ConfigData = this.configMap[fileName];
            if (configData == null) {
                continue;
            }
            if (configData.analysisFun) {
                configData.analysisFun(fileContent);
                continue;
            }
            configData.dataArray = this.analysisConfig(fileContent, configData.configClass);
            if (configData.mapKey || configData.keyFun) {
                for (var j: number = 0, len1: number = configData.dataArray.length; j < len1; j++) {
                    var data: Object = configData.dataArray[j];
                    var key: string = (configData.mapKey ? data[configData.mapKey] : configData.keyFun(data));
                    configData.dataMap[key] = data;
                }
            }
        }
        App.sendEvent(GameEvent.CONFIG_OVER);
    }

    /**
     * 得到单个配置文件 
     * @param fileName
     * @param key
     * @return 
     */
    public getConfig(fileName: string, key: any): Object {
        let configData: ConfigData = this.getConfigData(fileName);
        return configData.dataMap[key];
    }

    /**
     * 得到某个表的全部文件数组
     * @param fileName
     * @return 
     */
    public getDataArr(fileName: string): Array<any> {
        let configData: ConfigData = this.getConfigData(fileName);
        return configData.dataArray;
    }

    /**
     * 根据文件名返回配置
     * @param fileName
     */
    public getConfigData(fileName: string): ConfigData {
        return this.configMap[fileName];
    }

    /**
     * 配置文件 number型 务必一定要写0.1
     * 不然就转成int了
     * 0.0会被认为是0 int
     */
    public analysisConfig(configString: string, configClass: any): Array<any> {
        if (configString.charCodeAt(0) == 65279) {
            configString = configString.substring(1);
        }
        var resultArr: Array<any> = [];
        var strary: Array<string> = configString.split("\n");
        var head: String = String(strary[0]).replace("\r", "");
        var headary: Array<string> = head.split("\t");
        var contentary: Array<string> = strary.slice(1);

        for (var i: number = 0, len: number = contentary.length; i < len; i++) {
            var propstr: string = String(contentary[i]).replace("\r", "");
            if (propstr == "") {
                continue;
            }
            var propary: Array<string> = propstr.split("\t");
            var config: Object = new configClass();
            for (var j: number = 0, len2: number = propary.length; j < len2; j++) {
                var titleString: string = headary[j];
                var now: Object = config[titleString];
                var value: String = propary[j];
                if ( typeof now === 'number') {
                    now = parseInt(value + "");
                    if( (now + "") != value ){
                        now = parseFloat( value + "" );
                    }
                } else {
                    now = value;
                }
                config[titleString] = now;
            }
            resultArr.push(config);
        }
        return resultArr;
    }

    /**
     * 注册一个自定义的解析方法 
     * @param fileName
     * @param analysisFun
     */
    // public regAnalysisFun(fileName: String, analysisFun: Function): void {
    //     var configData: ConfigData = new ConfigData();
    //     configData.analysisFun = analysisFun;
    //     regMap[fileName] = configData;
    // }

    /**
     * 注册一个配置文件 
     * @param fileName
     * @param configClass
     * @param mapKey
     */
    public regConfig(fileName: string, configClass: any, mapKey: any = null): void {
        var configData: ConfigData = new ConfigData();
        configData.configClass = configClass;
        if (typeof mapKey === 'string') {
            configData.mapKey = mapKey;
        } else if (mapKey instanceof Function) {
            configData.keyFun = mapKey;
        }
        this.configMap[fileName] = configData;
    }
}