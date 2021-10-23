import hyperid from "hyperid"

type group = string


export class ConpoentDataContainer {
    static _instance:ConpoentDataContainer
    Namehashtable:Record<string,ComponentNode> = {}
    Uuidhashtable:Record<string,ComponentNode> = {}
    // group:uuid[]
    Grouphashtable:Record<string,string[]> = {}
    GroupantiShake:Record<string,number> = {}
    openlist:ComponentNode[] = []

    registeropenlist(obj:ComponentNode){
        if(obj && !this.openlist.includes(obj))
        this.openlist.push(obj)
    }

    /**关掉非排除项的面板 */
    closeall(rule:string[]){
        this.openlist.forEach(ComponentNode=>{
            let bool = true
            for(const key in rule){
               if(ComponentNode.name == rule[key]){
                    bool = false
               }
            }
            bool && $.Msg(ComponentNode.name+'被关闭')
            bool && ComponentNode.close()
        })
        this.openlist = []
    }

    addNode(name:string,uuid:string|undefined,dispatch:React.Dispatch<React.SetStateAction<number>>,css:Partial<VCSSStyleDeclaration>,send:any,group?:string){
        if(!uuid) return;
        const newNode = new ComponentNode(name,dispatch,css,send)
        this.Namehashtable [ name + uuid ] = newNode
        this.Uuidhashtable [ uuid ] = newNode
        if(group){
            if(!this.Grouphashtable[group]){
                this.Grouphashtable[group] = []
                this.GroupantiShake[group] = Game.GetGameTime()
            }
            this.Grouphashtable[group].push(uuid)
        }
    }

    antiShake(group:string,interval:number){
       const time = Game.GetGameTime() - this.GroupantiShake[group]
       $.Msg(time)
       if(time > interval){
            $.Msg("可以触发")
            this.GroupantiShake[group] = Game.GetGameTime()
            return true
       }
       $.Msg("不能触发")
       return false
    }

    NameGetNode(name:string){
        const table:any = {current:undefined}
        for(let key in this.Namehashtable){
            if(key.search(name) > -1){
                table.current = this.Namehashtable[key]
                return table as {current:ComponentNode}
            }
        }
        return table as {current:ComponentNode}
    }

    UuidGetNode(uuid:string){
        return this.Uuidhashtable[uuid]
    }

    NameGetGrap(name:string){
        const table:any = {current:[]}
        for(let key in this.Namehashtable){
            if(key.search(name) > -1){
                table.current.push(this.Namehashtable[key])
            }
        }
        return table as {current:ComponentNode[]}
    }

    static get Instance():ConpoentDataContainer{
        if(!this._instance){
            this._instance = new ConpoentDataContainer()
        }
        return this._instance
    }
}

export class State {
    uuid:string|undefined
    identifier:CardState;
    ComponentNode:ComponentNode|undefined;
    _entry:Function;_exit:()=>Promise<any>;_run:Function;
    cuurent_instruction = true
    time = 0

    constructor(identifer:CardState,entry:Function,exit:()=>Promise<any>,run:(time:number)=>void){
        this.identifier = identifer
        this._entry = entry
        this._exit = exit
        this._run = run
    }


    entry(){
        this.time = 0
        this._entry()
    }

    async exit(){
       await this._exit()
    }

    run(boolean:boolean){
        if(!boolean) return
        this.time += Game.GetGameFrameTime()
        this._run(true,this.time)
        $.Schedule(Game.GetGameFrameTime(),()=>this.run(this.cuurent_instruction))
    }

    next(){

    }
}

export enum CardState{
    手牌默认状态,
    选中状态,
    置放状态,
}

export class ComponentNode {
    csstable:Partial<VCSSStyleDeclaration> = {}
    dispatch:React.Dispatch<React.SetStateAction<any>>
    default_css_table:Partial<VCSSStyleDeclaration> = {}
    string_any_store:Record<any,any> = {}
    switch:boolean = false
    dispatch_list:React.Dispatch<React.SetStateAction<number>>[] = []
    name:string
    _send:any

    constructor(name:string,dispatch:React.Dispatch<React.SetStateAction<number>>,css:Partial<VCSSStyleDeclaration>,send?:any){
        this.name = name;
        this.dispatch = dispatch
        this.csstable = css
        this.default_css_table = Object.assign(this.default_css_table,css)
        this.switch = false
        this._send = send
        this.update()
    }


    send(key:string,data:any){
        this._send({type:key})
        this.update()
    }

    update(){
        this.dispatch((value:any)=>value+1)
        this.dispatch_list.forEach(dispatch=>{
            if(dispatch)
            dispatch(value=> value+1)
        })
    }



    close(){
        this.switch = false
        this.update()
    }

    open(){
        this.switch = true
        this.update()
    }


    async horizontalTypography(index:number,spacing:number):Promise<Partial<VCSSStyleDeclaration>>{
        if(this.csstable.x){
            const x = parseFloat(this.csstable.x)
            this.csstable.x = x + index * spacing + 'px'
        }
        return this.csstable
    }

    async init(){
        return this.csstable
    }

    register_monitor(update:React.Dispatch<React.SetStateAction<number>>){
        if(!this.dispatch_list.includes(update)){
            this.dispatch_list.push(update)
        }
    }

    unsubscribe(condition:any){
        if(condition())
        this.dispatch_list = []
    }

    getKeyString<T>(key:string):T{
        return this.string_any_store[key]
    }

    removeallkv(){
        this.string_any_store = {}
    }

    SetKeyAny<T>(key:any,value:T){
        this.string_any_store[key] = value
        this.update()
    }

    SetCss(targetkey:keyof VCSSStyleDeclaration,value:any){
        for(let key in this.csstable){
            if(key == targetkey){
                //@ts-ignore
                this.csstable[key] = value
            }
        }
        this.update()
    }

    serialization(key:string,cb:Function){
        return cb(this.name+this.string_any_store[key])
    }

}
