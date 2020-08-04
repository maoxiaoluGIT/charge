export default class ConfigData{
    public analysisFun:Function;
    public configClass:any;
    /**
     * 希望哪个属性当key
     */
	public mapKey:string;
    public keyFun:Function;
    
    public dataArray:Array<any>;

    public dataMap:any = {};
}