import { reloadable } from "../lib/tstl-utils";

@reloadable
export class Stack<T> {
    private _stack_data:Array<T>
    private _size:number

    constructor(){
        this._stack_data = []
        this._size = 0
    }

    Push(obj:T){
        this._stack_data[this._size] = obj
        this._size++
        print(this._size)
    }

    shuffle(){
        print("打印排序")
        table.sort(this._stack_data,(a,b)=>math.random() > 0.5)
        DeepPrintTable(this._stack_data)
    }

    get pop(){
        if(this._size < 1){
            return null
        }
        let obj = this._stack_data[this._size -1]
        this._stack_data[this._size - 1] = null
        this._size--
        return obj
    }

    get Size():number{
        return this._size
    }
}