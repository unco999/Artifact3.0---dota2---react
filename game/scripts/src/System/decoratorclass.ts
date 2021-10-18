import { reloadable } from "../lib/tstl-utils";
import { database, datastructure } from "./data";
import { decoratorclassModifierBase } from "./decoratorclassmodifer";
import { filter } from "./filter";

type ticktime = number;


function isInteger(obj: any) {
    return obj % 1 === 0;
}

/***
 * 此类装饰器是附加在角色之上的 分为轮询读取数据与保存数据 每个装饰器的数据结构都可以自定义
 * 所有装饰器都有一个modifier可以对该数据结构进行buff
 */
@reloadable
export class decoratorclassBase {
    typename: string; // 该装饰器名字
    located: string; //所属于角色
    instantPlayer: PlayerID; //所属于即时战斗中的玩家
    steamid:number
    haveAModifier: decoratorclassModifierBase[] = []; //当前拥有哪些修改器
    gameventid: CustomGameEventListenerID;
    data: Map<string, datastructure>;  // 装饰器存储的数据
    istoserver:boolean = true

    constructor(typename: string,loacated: string, playerid?: PlayerID,judge?:(event:any)=>boolean) {

        this.data = new Map();
        this.typename = typename;
        this.located = loacated;
        this.instantPlayer = playerid;
        if(this.instantPlayer){
            this.steamid = PlayerResource.GetSteamAccountID(this.instantPlayer)
        }
        this.setmodifier();
        this.init();
        /**
         * 所有主装饰器会自动注册一个事件 
         * 客户端发送事件遵守以下协议  get为需要获取的key值表  set为覆盖值  inc为增加值 
         * get 为以下格式  {eventname:客户端接受的事件,组件名:{需要获取的参数表}}
         */
        this.gameventid = CustomGameEventManager.RegisterListener(typename, (_, event) => {
            print("本地")
            print(this.typename)
            if (!judge(event) && event.influenceID != this.instantPlayer) return;
            print("通过检测的",this.typename)
            const get = event.get;
            const set = event.set;
            const inc = event.inc;
            const quote = event.quote;
            const eva = event.eva
            const changeevent = event.changeevent
            const datastructure = event.datastructure
            const add = event.add
            // quote 和set 不同之处 在于  quote直接创造新结构  所以普通赋值用set
            if (quote) {
                for (const _datastructure in quote) {
                    const originalinstance = this.data.get(_datastructure);
                    const current = originalinstance ? originalinstance : new datastructure(_datastructure);
                    //原有数据如果存在 进行原有结构的销毁动作
                    //遍历客户端传来的所有需要更新的数据结构表
                    originalinstance && print("origin是存在的")
                    for (const _database in quote[_datastructure]) {
                        //如果原来有结构就不用新建立
                        const table:Record<string,any> = {}
                        const mode = quote[_datastructure][_database]['mode']
                        const datatype = quote[_datastructure][_database]['datatype']
                        //@ts-ignore
                        const constructor = IocCotainer.instance.resolve(datatype)
                        //@ts-ignore
                        DeepPrintTable(constructor)
                        //@ts-ignore
                        const data = new constructor(_database,current,mode)
                        data.defualtupdatetime = quote[_datastructure][_database]['updatetime']
                        data.defualtgetserverdatatime = quote[_datastructure][_database]['takeservertime']
                        for (const key in quote[_datastructure][_database]) {
                            if(key == 'datatype'){
                                continue
                            }
                            if(key == 'mode'){
                                continue
                            }
                            if (key == 'updatetime') {
                                continue;
                            }
                            if (key == 'takeservertime') {
                                continue;
                            }
                            Object.assign(table, { [key]: quote[_datastructure][_database][key] });
                            DeepPrintTable({ [key]: quote[_datastructure][_database][key] })
                        }
                        //把每个shipdata插入树中
                        data.set(table)
                        this.data.set(_datastructure, current);
                    }
                    //打印树结构
                }
            }
            if(eva){
                for (const _datastructure in eva) {
                    this.data.get(_datastructure).structure.inOrderTraverse((value:database)=>{
                        for(const data in eva[_datastructure]){
                            if(value.name == data){
                                value.clienteval = eva[_datastructure][data]
                            }
                        }
                    })
                }
            }
            if (set) {
                for (const _datastructure in set) {
                    if(_datastructure == 'mode') continue
                    this.data.get(_datastructure).structure.inOrderTraverse((value: database) => {
                        for (const data in set[_datastructure]) {
                            if(value.name == data){
                                const mode = set[_datastructure][data]['mode']
                                for (const key in set[_datastructure][data]) {
                                    value.defualtupdatetime = set[_datastructure][data]['updatetime']
                                    value.defualtgetserverdatatime = set[_datastructure][data]['takeservertime']
                                    value.datamode =mode
                                    print("穿几耐的ode",set[_datastructure][data]['mode'])
                                    print("datamode",value.datamode)
                                    if (key == 'updatetime') {
                                        continue;
                                    }
                                    if (key == 'takeservertime') {
                                        continue;
                                    }
                                    if(key == 'eventname'){
                                        continue
                                    }
                                    if(key == 'mode'){
                                        continue
                                    }
                                        value.set({ [key]: set[_datastructure][data][key] });
                                }
                                mode && value.alltoupdate()
                            }
                        }
                    });
                }
            }
            if (inc) {
                for (const _datastructure in set) {
                    this.data.get(_datastructure).structure.inOrderTraverse((value: database) => {
                        for (const data in set[_datastructure]) {
                            for (const key in set[_datastructure][data]) {
                                if (value.includeKey(key)) {
                                    value.inc(key, set[_datastructure][data][key]);
                                }
                            }
                        }
                    });
                }
            }
            if (add){
                for (const _datastructure in add) {
                    this.data.get(_datastructure)?.structure.inOrderTraverse((value: database) => {
                        for (const data in add[_datastructure]) {
                            if(value.name == data){
                                for (const key in add[_datastructure][data]) {
                                    print("打印传进来的数组");
                                    DeepPrintTable(add[_datastructure][data][key]);
                                    for(const element in add[_datastructure][data][key]){
                                        (value.get(key) as Array<any>).push(add[_datastructure][data][key][element])
                                    }
                                    value.needToUploadDataToServer[key] = 1
                                    value.ischange = true
                                }
                            }
                        }
                    });
                }
            }
            if (get) {
                const table:Record<string,any> = {};
                for (const structure in get) {
                    if (!filter(structure)) continue;
                    if(this.data.get(structure))
                    this.data.get(structure)?.structure.inOrderTraverse((value: database) => {
                        for (const component in get[structure]) {
                            if(table[structure] == null)
                            table[structure] = {}
                            if(value.name == component){
                                print("组件名为",component)
                                print("get[structure][component]",get[structure][component])
                                if(table[structure][component] == null)
                                table[structure][component] = {}
                                if(get[structure][component] == "all"){
                                    Object.assign(table,{[structure]:{[component]:value.getareference()}})
                                }else{
                                    for(const key in get[structure][component]){
                                        if(get[structure][component][key] != "all" && value.includeKey(get[structure][component][key])){
                                            const _value = value.get(get[structure][component][key])
                                            table[structure][component][get[structure][component][key]] = _value
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
                DeepPrintTable(table)
                print("发送了一次事件")
                !get.eventname && print("当前事件名设置不对")
                get.eventname && CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(event.PlayerID), get.eventname, table);
            }
            if(changeevent){
                for (const _datastructure in changeevent) {
                    this.data.get(_datastructure).structure.inOrderTraverse((value: database) => {
                        for (const data in changeevent[_datastructure]) {
                            if(value.name == data){
                            for(const key in changeevent[_datastructure][data]){
                                    value.seteventfuc(key,()=>{
                                        CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(event.PlayerID),changeevent[_datastructure][data][key],{[key]:value.get(key)})
                                    })
                                    value.run(key)
                                }
                            }
                        }
                        
                    });
                }
            }
        });
    }

    destroy() {
        CustomGameEventManager.UnregisterListener(this.gameventid);
    }

    init(...args:any) {

    }

    inject(...args:any){

    }


    /**每个功能装饰类都有一个中心计时器 */


    getalltable() {
        const table = {};
        this.data.forEach((value, key) => {
            Object.assign(table, { [key]: value.traversidetotable() });
        });
        return table;
    }

    openmodifertimer(modifer: decoratorclassModifierBase) {
        if (modifer.timer) {
            this.data.get(modifer.name).structure.inOrderTraverse(((value: database) => {
                modifer.timer(value);
            }));
        }
    }

    //把modifer附加给每个data
    setmodifier() {
        if (this.haveAModifier.length == 0) return;
        this.haveAModifier.forEach(modiferinstance => {
            for (let key in modiferinstance.modifyField) {
                this.data.get(modiferinstance.name).structure.inOrderTraverse
                    ((data: database) => {
                        data.addmodifer(modiferinstance);
                    });
            }
        });
    }

    /** 接收从服务器传来的数据  并进行二叉树搜索  把值赋给每个表 */
    servertochildkeyvalue(table:any){
        if (table) {
            for (const datastructure in table) {
                print("待更新组件")
                print(datastructure)
                this.data.get(datastructure)?.structure.inOrderTraverse((value: database) => {
                    DeepPrintTable(value)
                    for (const data in table[datastructure]) {
                        for (const key in table[datastructure][data]) {
                            print('value.includeKey(key)', key);
                            if (value.includeKey(key)) {
                                value.set({ [key]: table[datastructure][data][key] });
                            }
                        }
                    }
                });
            }
        }
    }

    // getupdatedata() {
    //     const table: Record<string, any> = {};
    //     this.data.forEach(datastructure => {
    //         datastructure.structure.inOrderTraverse((database: database) => {
    //             const databasetable = database.getupdatedata();
    //             if (Object.keys(databasetable).length != 0) {
    //                 table[database.name] = databasetable;
    //             }
    //         });
    //     });
    //     return table;
    // }

    // gettakeserverdata(time:number) {
    //     const getdatastructuretable:Record<string,any> = {[this.typename]:{}} 
    //     const setdatastructuretable:Record<string,any> = {[this.typename]:{}} 
    //     this.data.forEach(datastructure => {
    //         datastructure.structure.inOrderTraverse((database: database) => {
    //             const gettoservertable = database.gettoservertable();
    //             const settoservertable = database.getupdatedata()
    //             if(gettoservertable != null) {{
    //                 if (database.defualtgetserverdatatime === 'init') {
    //                     if(getdatastructuretable[this.typename][database.parent.name] == null)
    //                         getdatastructuretable[this.typename][database.parent.name] = {}
    //                     }
    //                         Object.assign(getdatastructuretable[this.typename][database.parent.name],gettoservertable)
    //                         database.defualtgetserverdatatime = 'await'
    //                 }
    //                 if(time % 2 == 0 && database.defualtgetserverdatatime == 'await'){
    //                     database.defualtgetserverdatatime = 'init'
    //                 }
    //             }
    //             if(settoservertable != null){
    //                 if(database.defualtupdatetime == 'only'){
    //                     const newtable:Record<string,any> = {}
    //                     if(newtable[this.steamid] == null){
    //                         newtable[this.steamid] = {}
    //                         newtable[this.steamid]["set"] = {}
    //                         newtable[this.steamid]["set"][this.typename] = {}
    //                         newtable[this.steamid]["set"][this.typename][database.parent.name] = {}
    //                     }
    //                     Object.assign(newtable[this.steamid]["set"][this.typename][database.parent.name],settoservertable)
    //                     IocCotainer.instance.resolve<SimulationHttp>("SimulationHttp").post(newtable,'Rolegateway',(StatusCode)=>{
    //                         database.defualtupdatetime = -1
    //                         print("服务器发送一次事件!!!")
    //                         database.clienteval && CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(this.instantPlayer),database.clienteval,{Status:StatusCode})
    //                     })
    //                 }
    //                 if (database.defualtgetserverdatatime === 'over' && database.defualtupdatetime != -1 && typeof (database.defualtupdatetime) == 'number' && isInteger(time / database.defualtupdatetime)) {
    //                     print("打印需要传值服务器的包",database.name)
    //                     if(setdatastructuretable[this.typename][database.parent.name] == null){
    //                         setdatastructuretable[this.typename][database.parent.name] = {}
    //                     }
    //                     Object.assign(setdatastructuretable[this.typename][database.parent.name],settoservertable)
    //                 }
    //             }
    //         });
    //     });
    //     // if(Object.keys(getdatastructuretable[this.typename]).length != 0){
    //     //     return getdatastructuretable
    //     // }
    //     if(Object.keys(setdatastructuretable[this.typename]).length === 0 && Object.keys(getdatastructuretable[this.typename]).length === 0){
    //         return null
    //     }
    //     if(Object.keys(setdatastructuretable[this.typename]).length != 0 && Object.keys(getdatastructuretable[this.typename]).length != 0){
    //         return {get:getdatastructuretable,set:setdatastructuretable}
    //     }
    //     if(Object.keys(getdatastructuretable[this.typename]).length != 0 ){
    //         return {get:getdatastructuretable}
    //     }
    //     if(Object.keys(setdatastructuretable[this.typename]).length != 0){
    //         return {set:setdatastructuretable}
    //     }
        
    // }

}