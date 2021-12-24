export class GLOABAL_EVENT {
    private static _instance:GLOABAL_EVENT
    HOOK:Record<string,Function[]> = {}
    DATA:Record<string,any> = {}

    static get instance(){
        if(this._instance == null){
            this._instance = new GLOABAL_EVENT()
        }
        return this._instance
    }

    SetDATA(key:string,data:any){
        this.DATA[key] = data
        if(this.HOOK[key]){
            this.HOOK[key].forEach(fuc=>fuc((value:Boolean)=>!value))
        }
    }

    GetDATA(key:string){
       return this.DATA[key] ?? false
    }

    register(name:string[],dispatch:any){
        name.forEach(str=>{
            if(this.HOOK[str] == null){
                this.HOOK[str] = []
            }
            !this.HOOK[str].includes(dispatch) &&  this.HOOK[str].push(dispatch)
        })
    }

}