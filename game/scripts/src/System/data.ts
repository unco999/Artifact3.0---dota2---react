
import BinarySearchTree from "../structure/tree";
import { decoratorclassModifierBase } from "./decoratorclassmodifer";



export class datastructure {
    name: string; //数据的类型名字
    structure: BinarySearchTree<database> = new BinarySearchTree();

    constructor(name: string) {
        this.name = name;
    }

    destroy(){
        this.structure = null
    }

    /**获取某个database内部的值 */
    get(databasename:string,key:string){
        let obj:Record<string,any> = {}
        this.structure.inOrderTraverse((value:database)=>{
            if(value.name == databasename){
                print("检测到有符合get条件的")
                obj[key] = value.get(key)
            }
        })
        return obj[key]
    }

    /**获取数据实体 */
    getdatabase(databasename:string){
        const database:{current:database|undefined} = {current:undefined}
        this.structure.inOrderTraverse((value:database)=>{
            if(value.name == databasename){
                return database.current = value
            }
        })
        return database
    }

    //把该数据的所有节点数据全部扁平化
    traversidetotable() {
        const obj: Record<string, string> = {};
        this.structure.inOrderTraverse((value: database) => {
            Object.assign(obj, { [value.name]: value.getareference() });
        });
        return obj;
    }

    update() {
        const updatetable = {};
        this.structure.inOrderTraverse((value: database) => {
            const table = value.getupdatedata();
            if (Object.keys(table).length != 0) {
                Object.assign(updatetable, { [value.name]: value.getupdatedata() });
            }
        });
    }
}

type timeloop = number;
export type initstate = number | "init" | "no" | "over" | "await"
export type datamode = "redis"|"mongo"
export type updatemode = number | "only"

export abstract class database {
    parent:datastructure
    name: string; // 数据的名字
    data: Record<string, string | number | string[] | number[]> = {}; //数据的内容
    modifersettlementdata: Record<string, string | number> = {}; //modifier累计数据
    needToUploadDataToServer: Record<string, updatemode> = {}; //数据需更新至服务器的表
    takeDataFromServer:Record<string,timeloop|initstate> = {} //数据需要从服务器拿的表
    eventfuc:Record<string,Function> = {}
    defualtupdatetime: updatemode;  //默认向服务器更新的事件
    defualtgetserverdatatime:initstate; // 默认向服务器取数据的时间
    arbitraryChange:Function[] = []//任意变动事件
    initializationCallback:Function[] = [] //初始化后回调的数组
    datamode:datamode;
    ischange:boolean = false; //数据是否距上一次更新发生了变化
    clienteval:string // 如果上传服务器成功 客户端写的字符串转func回调
    
    constructor(name: string,parent:datastructure,datamode:datamode,defualtupdatetime?: number,defualtgetserverdatatime?:initstate) {
        this.name = name;
        this.defualtupdatetime = defualtupdatetime;
        this.defualtgetserverdatatime = defualtgetserverdatatime
        this.parent = parent
        this.datamode = datamode
        this.parent.structure.insert(this)
    }

    destroy(){
        this.parent.structure.remove(this)
    }

    seteventfuc(key:string|"all",func:(...args:any)=>void){
        this.eventfuc[key] = func
        print("设置了回调client事件",this.name)
        DeepPrintTable(this.eventfuc)
    }

    setalleventfuc(func:(database:database)=>(...args:any)=>void){
        this.arbitraryChange.push(func(this))
    }

    run(key:string){
       print(key,"被触发了！！！！！！！！！！！！")
       this.eventfuc[key] && this.eventfuc[key]()
    }

    addmodifer(modifer: decoratorclassModifierBase) {
        if (this.name != modifer.name) {
            print(this.name + '的modifer不匹配不能附加', modifer.name);
            return;
        }
        modifer.modifiersuperimposedMethod(this);
    }

    modiferinc(key:string,num:number) {
        if(!this.modifersettlementdata[key]) this.modifersettlementdata[key] = 0
        const count = Number(this.modifersettlementdata[key]);
        if (count) {
            this.modifersettlementdata[key] = (count + num)
            print("触发了")
        } else {
            print(key, "不是一个可转换的数值...");
        }
    }

    modifersetkeyvalue({...args}:any){
            const keys = Object.keys(args);
            if (keys.length == 0) {
                print("data数据录入失败,原因值为空值...");
            }
            Object.assign(this.modifersettlementdata, args);
    }

    //获得数据引用表
    getareference() {
        return {...this.data}
    }

    //获得modifer结算数据
    getmodifierSettlementData() {
        return { name: this.name ,data: this.modifersettlementdata };
    }  

    includeKey(key: string) {
        return Object.keys(this.data).includes(key);
    }

    alltoupdate(){
        for(const key in this.data){
            if(key == 'init') continue
            this.needToUploadDataToServer[key] = this.defualtupdatetime;   
            print("keykey全部更新为需要更新的数据",key)
        }
        this.ischange = true
    }

    set({ ...args }: Record<string, any>) {
        if(args._id){
            args._id = null
        }
        const keys:Array<string> = Object.keys(args);
        keys.forEach(key=>{
           if(args[key] != this.data[key]){
               this.ischange = true
           }
           if(!this.modifersettlementdata[key]){
               this.modifersettlementdata[key] = 0
           }
           if(this.eventfuc[key]){
                this.run(key) // 若该值更改有事件就触发事件
           }
        })
        if (keys.length == 0) {
            print("data数据录入失败,原因值为空值...");
        }
        Object.assign(this.data, args);
        if (this.defualtupdatetime) {
            for(const key of keys){
                print("keys的值为")
                DeepPrintTable(keys)
                if(key == 'init' ) continue
                this.needToUploadDataToServer[key] = this.defualtupdatetime;
                print("确定更新的KV =>",key)
                print("打印当前需要update的表")
                DeepPrintTable(this.needToUploadDataToServer)
            }
        }
        if(this.defualtgetserverdatatime == 'init'){
            keys.forEach(key => {
                print("当前需要更新的值",key)
                if(key != 'init')
                this.takeDataFromServer[key] = this.defualtgetserverdatatime;
            });
        }
        if(this.arbitraryChange){
            this.arbitraryChange.forEach(fuc=>fuc())
        }
        return this
    }

    SetinitializationCallback(callback:(host:database)=>()=>any){
        this.initializationCallback.push(callback(this))
    }

    inc(key: string, num: number) {
        const count = Number(this.data[key]);
        if (count) {
            this.data[key] = (count + num)
            if(this.eventfuc[key]){
                this.run(key) // 若该值更改有事件就触发事件
                if(this.arbitraryChange){
                    this.arbitraryChange.forEach(fuc=>fuc())
                }
            }
        } else {
            print(key, "不是一个可转换的数值...");
        }
    }

    delete(key:string){
       delete this.data[key]
    }

    get(key: string) {
        return this.data[key]
    }

    getmodiferkeyvalue(key: string){
        return {[key]: this.modifersettlementdata[key]}
    }

    getupdatedata() {
        if(!this.ischange) return null  
        const alltakekey = Object.keys(this.needToUploadDataToServer ?? []);
        const record:Record<string,any> = {}
        for(const key of alltakekey){
            if(key == 'mode'){
                continue
            }
            record[key] = this.data[key]
        }
        record['objectid'] = this.data['objectid']
        if(Object.keys(record).length === 0){
            return null
        }
        this.ischange = false;
        return {[this.name + "_" + this.datamode]:record};
    }

    /**从服务器拿数据的table */
    gettoservertable() {
        const alltakekey = Object.keys(this.takeDataFromServer ?? []);
        const record:Record<string,any> = {}
        for(const key of alltakekey){
            if(key == 'mode'){
                continue
            }
            record[key] = this.data[key]
        }
        if(Object.keys(record).length === 0 || this.defualtgetserverdatatime != 'init' ){
            return null
        }
        return {[this.name + "_" + this.datamode]:record};
    }
}

