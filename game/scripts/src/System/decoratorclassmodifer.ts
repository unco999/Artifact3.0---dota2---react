import { database } from "./data";
import { decoratorclassBase } from "./decoratorclass";

export abstract class decoratorclassModifierBase {
    name:string; //该buff的名字
    modifyField: Record<string, number | string>; //buff字段
    belongToTheDecorator: decoratorclassBase;  // 属于哪个装饰器
    abstract timer:(database:database,...args:any)=>any

    constructor(Decorator: decoratorclassBase,name:string) {
        this.belongToTheDecorator = Decorator;
        this.name = name;
    }


    modifiersuperimposedMethod(data:database) {
       for(const key in this.modifyField){
           const buffattribute = this.modifyField[key]
           if(typeof(data.data[key]) == 'number' && typeof(buffattribute) == 'number' ){
               data.modiferinc(key,buffattribute)
           }else{
               data.modifersetkeyvalue({[key]:buffattribute})
           } 
       }
    }
}