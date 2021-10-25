import { Timers } from "../lib/timers";

export abstract class ChooseHerostate{
    host:ChooseHeroCardLoop
    id:string
    time:number; //该阶段计数器
    optionalQuantity:number //可选数量

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
        CustomNetTables.SetTableValue("Card_group_construction_phase",'selectloop',{currentteam:this.id,timeLeft:this.time,optionalnumber:this.optionalQuantity})
    }

}

export class RedSelectstage extends ChooseHerostate{
    id = "RedSelectstage"
    time = 5

    constructor(optionalQuantity:number){
        super()
        this.optionalQuantity = optionalQuantity
    }
    
    entry(){

    }

    exit(){

    }

    RedAutoselectCard(){
        this.host.addHeroCardinlist = RandomInt(0,40)
    }

    run(){
        this.time--
        super.dataupdate()
        if(this.host.isbothSidesfull()){
            this.host.SetcuurentsettingState = new ChoosePreGame()
            return 
        }
        if(this.host.redisok){
            this.host.SetcuurentsettingState = new BlueSelectstage(this.optionalQuantity == 1 ? 2 : 1)
            return 
        }
        if(this.time === 0){
            this.RedAutoselectCard()
            this.host.SetcuurentsettingState = new BlueSelectstage(this.optionalQuantity == 1 ? 2 : 1)
            return 
        }
        return 1
    }
}


export class BlueSelectstage extends ChooseHerostate{
    id = "BlueSelectstage"
    time = 5

    constructor(optionalQuantity:number){
        super()
        this.optionalQuantity = optionalQuantity
    }

    entry(){

    }

    exit(){

    }

    BlueAutoselectCard(){
        this.host.addHeroCardinlist = RandomInt(0,40)
    }

    run(){
        this.time--
        super.dataupdate()
        if(this.host.isbothSidesfull()){
            this.host.SetcuurentsettingState = new ChoosePreGame()
            return 
        }
        if(this.host.blueisok){
            this.host.SetcuurentsettingState = new RedSelectstage(this.optionalQuantity == 1 ? 2 : 1)
            return 
        }
        if(this.time === 0){
            this.BlueAutoselectCard()
            this.host.SetcuurentsettingState = new RedSelectstage(this.optionalQuantity == 1 ? 2 : 1)
            return 
        }
        return 1
    }
}

export class ChoosePreGame extends ChooseHerostate{
}


export class ChooseHeroCardLoop{
    private currentState:ChooseHerostate
    private haveSelectedHero:Record<string,number[]> = {} //已经选择的英雄    
    private heroThatCanChooseOnTheCurrentField:number[] = [] //当前场上可选择的英雄
    redisok:boolean = false
    blueisok:boolean = false
    time:number = 0

    constructor(){
            this.haveSelectedHero['BlueSelectstage'] = [-1,-1,-1,-1,-1,-1] //初始化所有的英雄
            this.haveSelectedHero['RedSelectstage'] = [-1,-1,-1,-1,-1,-1] //初始化所有的英雄
    }

    RegisterGameEvent(){
        CustomGameEventManager.RegisterListener("RED_SELECT_HERO_CARD",(_,event)=>{
            if(this.currentState.id == "RedSelectstage"){
                this.addHeroCardinlist = event.herocardid
                this.redisok = true
            }
        })
        CustomGameEventManager.RegisterListener("BLUE_SELECT_HERO_CARD",(_,event)=>{
            if(this.currentState.id == "BlueSelectstage"){
                this.addHeroCardinlist = event.herocardid
                this.blueisok = true
            }
        })
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
        print("开始设置英雄")
       for(const team in this.haveSelectedHero){
           print("当前ID")
           print(this.currentState.id)
           print("当前team",team)
           if(team.indexOf(this.currentState.id) > -1){
               for(const index in this.haveSelectedHero[team]){
                   if(this.haveSelectedHero[team][index] === -1){
                       this.haveSelectedHero[team][index] = herocardid
                       CustomNetTables.SetTableValue('Card_group_construction_phase','playerHasChosen',this.haveSelectedHero)
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
        this.setheroThatCanChooseOnTheCurrentField = [RandomInt(0,40),RandomInt(0,40),RandomInt(0,40),RandomInt(0,40)]
        this.currentState = state
        this.currentState.entry()
        Timers.CreateTimer(()=>{
            return this.currentState.run()
        })
    }
}