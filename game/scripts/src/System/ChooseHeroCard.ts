import { Timers } from "../lib/timers";
import { reloadable } from "../lib/tstl-utils";

export abstract class ChooseHerostate{
    host:ChooseHeroCardLoop
    id:string
    time:number; //该阶段计数器
    optionalQuantity:number //可选数量
    remainingOptionalQuantity:number //剩余可选数量

    constructor(){

    }

    entry(){

    }

    exit(){

    }

    run(){
        return 1
    }

    dataupdate(){
        CustomNetTables.SetTableValue("Card_group_construction_phase",'selectloop',{currentteam:this.id,timeLeft:this.time,optionalnumber:this.optionalQuantity,remainingOptionalQuantity:this.remainingOptionalQuantity})
    }

}

export class RedSelectstage extends ChooseHerostate{
    id = "RedSelectstage"
    time = 11

    constructor(optionalQuantity:number){
        super()
        this.optionalQuantity = optionalQuantity
        this.remainingOptionalQuantity = optionalQuantity
    }
    
    entry(){
    }

    exit(){

    }

    RedAutoselectCard(){
        for(let i = 0 ; i <= this.remainingOptionalQuantity ; i++){
            this.host.addHeroCardinlist = this.host.optionalheroThatCanChooseOnTheCurrentField
        }
    }

    run(){
        this.time--
        if(this.host.isbothSidesfull()){
            this.host.SetcuurentsettingState = new ChoosePreGame()
            return 
        }
        if(this.host.redisok){
            this.host.SetcuurentsettingState = new BlueSelectstage(this.host.Getselectfrequency)
            return 
        }
        if(this.time === 0){
            this.RedAutoselectCard()
            this.host.SetcuurentsettingState = new BlueSelectstage(this.host.Getselectfrequency)
            return 
        }
        super.dataupdate()
        return 1
    }
}


export class BlueSelectstage extends ChooseHerostate{
    id = "BlueSelectstage"
    time = 11

    constructor(optionalQuantity:number){
        super()
        this.optionalQuantity = optionalQuantity
        this.remainingOptionalQuantity = optionalQuantity
    }

    entry(){
    }

    exit(){

    }

    BlueAutoselectCard(){
        for(let i = 0 ; i <= this.remainingOptionalQuantity ; i++){
            this.host.addHeroCardinlist = this.host.optionalheroThatCanChooseOnTheCurrentField
        }
    }

    run(){
        this.time--
        if(this.host.isbothSidesfull()){
            this.host.SetcuurentsettingState = new ChoosePreGame()
            return 
        }
        if(this.host.blueisok){
            this.host.SetcuurentsettingState = new RedSelectstage(this.host.Getselectfrequency)
            return 
        }
        if(this.time === 0){
            this.BlueAutoselectCard()
            this.host.SetcuurentsettingState = new RedSelectstage(this.host.Getselectfrequency)
            return 
        }
        super.dataupdate()
        return 1
    }
}

export class ChoosePreGame extends ChooseHerostate{
    constructor(){
        super()
        GameRules.ForceGameStart()
    }
}

@reloadable
export class ChooseHeroCardLoop{
    private currentState:ChooseHerostate
    private haveSelectedHero:Record<string,number[]> = {} //已经选择的英雄    
    private heroThatCanChooseOnTheCurrentField:number[] = [] //当前场上可选择的英雄
    private selectOrder:number[] = []
    private selectindex = 0
    private heroSelected:number[] = []
    redisok:boolean = false
    blueisok:boolean = false
    time:number = 0

    constructor(){
            this.haveSelectedHero['BlueSelectstage'] = [-1,-1,-1,-1,-1] //初始化所有的英雄
            this.haveSelectedHero['RedSelectstage'] = [-1,-1,-1,-1,-1] //初始化所有的英雄
            this.setheroThatCanChooseOnTheCurrentField = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
            this.selectOrder = [1,2,2,2,2,1]
            this.RegisterGameEvent()
            Timers.CreateTimer(()=>{
                print(this.currentState.remainingOptionalQuantity)
                return 1
            })
    }

    RegisterGameEvent(){
        CustomGameEventManager.RegisterListener("RED_SELECT_HERO_CARD",(_,event)=>{
            if(this.currentState.id == "RedSelectstage" && PlayerResource.GetPlayer(event.PlayerID) == GameRules.Red){
                for(const key in event.array){
                    if(event.array[key] == -1) continue
                    this.addHeroCardinlist = event.array[key]
                    if(this.currentState.remainingOptionalQuantity === 0){
                        this.blueisok = true
                    }
                }
            }
        })
        CustomGameEventManager.RegisterListener("BLUE_SELECT_HERO_CARD",(_,event)=>{
            if(this.currentState.id == "BlueSelectstage" && PlayerResource.GetPlayer(event.PlayerID) == GameRules.Blue){
                for(const key in event.array){
                    if(event.array[key] == -1) continue
                    this.addHeroCardinlist = event.array[key]
                    if(this.currentState.remainingOptionalQuantity === 0){
                        this.blueisok = true
                    }
                }
            }
        })
    }

    get optionalheroThatCanChooseOnTheCurrentField(){
        const newTable = this.heroThatCanChooseOnTheCurrentField.filter(value=>{
            let bool = true
            for(const heorid of this.heroSelected){
                if(value == heorid){
                    bool = false
                }
            }
            return bool
        })
        const heroid = newTable[RandomInt(0,newTable.length - 1)]
        return heroid
    }

    get Getselectfrequency(){
        const frequency = this.selectOrder[this.selectindex + 1]
        this.selectindex++
        return frequency
    }

    isbothSidesfull(){
        let boolean = true
        for(const key in this.haveSelectedHero){
            this.haveSelectedHero[key].forEach(heroid=>{
                if(heroid === -1) boolean = false
            })
        } 
        return boolean
    }

    get GetcurrentState(){
        return this.currentState
    }

    /**生成当前场上可选英雄 */
    set setheroThatCanChooseOnTheCurrentField(numArray:number[]){
        this.heroThatCanChooseOnTheCurrentField = numArray
        CustomNetTables.SetTableValue("Card_group_construction_phase","heroThatCanChooseOnTheCurrentField",this.heroThatCanChooseOnTheCurrentField)
    }

    set addHeroCardinlist(herocardid:number){
       if(this.GetcurrentState.remainingOptionalQuantity < 1) return;
       if(this.heroSelected.includes(herocardid)) return;
       for(const team in this.haveSelectedHero){
           print("当前ID")
           print(this.currentState.id)
           print("当前team",team)
           if(team.indexOf(this.currentState.id) > -1){
               for(let index = 0 ; index < this.haveSelectedHero[team].length ; index ++){
                   if(this.haveSelectedHero[team][index] === -1){
                       this.haveSelectedHero[team][index] = herocardid
                       this.heroSelected.push(herocardid)
                       this.GetcurrentState.remainingOptionalQuantity--
                       CustomNetTables.SetTableValue('Card_group_construction_phase','playerHasChosen',this.haveSelectedHero)
                       CustomNetTables.SetTableValue('Card_group_construction_phase','heroSelected',this.heroSelected)
                       return;
                   }
               }
           }
       }
    }
    
    // 设置初始状态
    set SetcuurentsettingState(state:ChooseHerostate){
        state.host = this
        this.redisok = false
        this.blueisok = false
        this.currentState = state
        this.currentState.entry()
        Timers.CreateTimer(()=>{
            return this.currentState.run()
        })
    }
}