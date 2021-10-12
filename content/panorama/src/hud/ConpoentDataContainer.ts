import hyperid from "hyperid"

type group = string


export class ConpoentDataContainer {
    static _instance:ConpoentDataContainer
    Namehashtable:Record<string,ComponentNode> = {}
    Uuidhashtable:Record<string,ComponentNode> = {}
    // group:uuid[]
    Grouphashtable:Record<string,string[]> = {}
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

    addNode(name:string,uuid:string|undefined,dispatch:React.Dispatch<React.SetStateAction<number>>,css:Partial<VCSSStyleDeclaration>,State?:State[],group?:string){
        if(!uuid) return;
        const newNode = new ComponentNode(name,dispatch,css,State)
        this.Namehashtable [ name + uuid ] = newNode
        this.Uuidhashtable [ uuid ] = newNode
        if(group){
            if(!this.Grouphashtable[group]){
                this.Grouphashtable[group] = []
            }
            this.Grouphashtable[group].push(uuid)
        }
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
    identifier:CardState;
    ComponentNode:ComponentNode|undefined;
    _entry:Function;_exit:Function;_run:Function;

    constructor(identifer:CardState,entry:Function,exit:Function,run:Function){
        this.identifier = identifer
        this._entry = entry
        this._exit = exit
        this._run = run
    }

    entry(){
        this._entry()
    }

    exit(){
        this._exit()
    }

    run(){
        this.run()
    }

    next(){

    }
}

export enum CardState{
    施法状态,
    攻击状态,
    死去活来状态,
    怎么都死不了状态,
    死了又活过来又死了状态,
}

export class ComponentNode {
    csstable:Partial<VCSSStyleDeclaration> = {}
    dispatch:React.Dispatch<React.SetStateAction<any>>
    default_css_table:Partial<VCSSStyleDeclaration> = {}
    string_any_store:Record<any,any> = {}
    switch:boolean = false
    dispatch_list:React.Dispatch<React.SetStateAction<number>>[] = []
    name:string
    State:State[]|undefined //state按照顺序存储
    current_State:number

    constructor(name:string,dispatch:React.Dispatch<React.SetStateAction<number>>,css:Partial<VCSSStyleDeclaration>,state?:State[]){
        this.name = name;
        this.dispatch = dispatch
        this.csstable = css
        this.default_css_table = Object.assign(this.default_css_table,css)
        this.switch = false
        this.State = state
        this.current_State = 0
        this.State?.forEach((value)=>{
            value.ComponentNode = this
        })
        this.update()
    }

    update(){
        this.dispatch((value:any)=>value+1)
        this.dispatch_list.forEach(dispatch=>{
            if(dispatch)
            dispatch(value=> value+1)
        })
    }

    Statenext(){
        if(this.State && this.current_State < this.State?.length - 1){
            this.State[this.current_State].exit()
            this.current_State++
            this.State[this.current_State].entry()
            $.Msg("当前UI激活编号为",this.current_State)
        }
    }

    switchState(UIstate:CardState){
        if(this.State){
           this.State[this.current_State]?.exit()
           for(const index in this.State){
               if(this.State[index].identifier == UIstate){
                   this.current_State = +index
                   this.State[index]._run()
                   $.Msg("当前UI激活编号为",this.current_State)
               }   
           }
        }
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

    SetCss(targetkey:string,value:any){
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
