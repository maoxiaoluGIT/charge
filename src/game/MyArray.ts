export default class MyArray{
    public arr:Array<any> = [];
    constructor(){
        
    }

    /**
     * 他会自动过滤重复的
     * @param value 
     */
    public push(value:any):void{
        if( this.arr.indexOf( value ) == -1 ){
            this.arr.push(value);
        }
    }

    /**
     * 删除
     * @param value 
     * delete0null1 删除0 置空1
     */
    public delete(value:any , stat:number = 0 ):void{
        let i = this.arr.indexOf(value);
        if( i != -1 ){
            if( stat == 0 ){
                this.arr.splice( i,1 );
            }else{
                this.arr[i] = null;
            }
        }
    }

    /**
     * 是否包含
     * @param value 
     */
    public contain(value:any):boolean{
       return this.arr.indexOf( value ) != -1;
    }

    /**
     * 如果数组里没有 就自动添加 如果有就删除
     * 如果原本有 返回true
     * 如果传null 那么直接return
     * @param value 
     */
    public pushOrDelete( value:any ):boolean{
        if( value == null ){
            return false;
        }
        if( this.contain( value ) ){
            this.delete(value);
            return true;
        }else{
            this.arr.push(value);
            return false;
        }
    }

    public clear():void{
        this.arr.length = 0;
    }
}