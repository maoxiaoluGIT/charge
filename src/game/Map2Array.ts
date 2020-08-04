export default class Map2Array{
    public map:any = {};
    
    constructor(){
        
    }

    public setData(key:any,value:any):void{
        this.resetKey(key);
        let arr:Array<any> = this.map[key];
        arr.push(value);
    }

    /**
     * 他会自动去重
     * @param key 
     * @param value 
     */
    public setData2(key:any,value:any):void{
        this.resetKey(key);
        let arr:Array<any> = this.map[key];
        if( arr.indexOf(value) == -1 ){
            arr.push(value);
        }
    }

    public getData(key:any):Array<any>{
        this.resetKey(key);
        return this.map[key];
    }

    /**
     * @param key 
     * @param value 
     * @param delete0null1 删除0 置空1
     */
    public deleteData(key:any,value:any,stat:number = 0):void{
        this.resetKey(key);
        let a = this.getData(key);
        let i = a.indexOf(value);
        if( i != -1 ){
            if( stat == 0 ){
                a.splice(i,1);    
            }else{
                a[i] = null;
            }
        } 
    }

    private resetKey( key:any ):void{
        if( this.map[key] == null ){
            this.map[key] = [];
        }
    }
}