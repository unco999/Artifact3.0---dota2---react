import { Timers } from "../lib/timers";
import { reloadable } from "../lib/tstl-utils";
import { BattleGameLoop, faultCard } from "../Manager/BattleGameLoop";

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
    time = 3 

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
            this.host.addRedHeroCardinlist = this.host.RedoptionalheroThatCanChooseOnTheCurrentField
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
    time = 2

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
            this.host.addBlueHeroCardinlist = this.host.BlueoptionalheroThatCanChooseOnTheCurrentField
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


/**分路选择 */
export class ChoosePreGame extends ChooseHerostate{
    id = "ChoosePreGame"
    time = 4

    constructor(){
        super()
        this.registerGameEevent()
    }

    registerGameEevent(){
        CustomGameEventManager.RegisterListener("HERO_BRANCH_OVER",(_,event)=>{
            if(!event.branch) return;
            if(event.PlayerID == GameRules.Red.GetPlayerID() && this.host.redbranchisok == true){
                print("红色已经选过分路了")
                return
            }
            if(event.PlayerID == GameRules.Blue.GetPlayerID() && this.host.bluebranchisok == true){
                print("蓝色已经选过分路了")
                return
            }
            DeepPrintTable(event)
            let count = 0
            let bool:boolean = true
            let table:Array<number>
            for(const key in event.branch){
                print("打印分路",key)
                let branchowendcount = 0
                for(const index in event.branch[key]){
                    if(event.PlayerID == GameRules.Blue.GetPlayerID()){
                        table = this.host.BlueheroSelected
                    }else{
                        table = this.host.RedheroSelected
                    }
                    if(table.includes(event.branch[key][index])){
                        count++
                    }
                }
                for(const index in event.branch[key]){
                     if(event.branch[key][index] != -1){
                        branchowendcount++
                     }
                }
                if(key == '0' && branchowendcount != 2){
                    print('0号路不为2')
                    bool = false
                }
                if(key == '1' && branchowendcount != 1){
                    print('1号路不为1')
                    bool = false
                }
                if(key == '2' && branchowendcount != 2){
                    print('2号路不为2')
                    bool = false
                }
            }
            print("合格的英雄数量为",count)
            if(count == 5 && bool == true){
                print("收到了正确的英雄分路表   现在打印数据")
                this.host.Setbranch(event.branch,event.PlayerID)
                print("收到分路请求")
                DeepPrintTable(this.host.herobrach)
                if(event.PlayerID == GameRules.Red.GetPlayerID()){
                    this.host.redbranchisok = true
                    CustomNetTables.SetTableValue('Card_group_construction_phase','brachisok',{[GameRules.Red.GetPlayerID()]:true})
                }else{
                    this.host.bluebranchisok = true
                    CustomNetTables.SetTableValue('Card_group_construction_phase','brachisok',{[GameRules.Blue.GetPlayerID()]:true})
                }
                if(this.host.bluebranchisok && this.host.redbranchisok){
                    this.host.SetcuurentsettingState = new showtime()
                }
            }
        })
    }

    override run(){
        this.time -- ;
        if(this.time === 3){
            if(!this.host.redbranchisok){
                this.host.AutoAddbranchHero('red',0)
                this.host.AutoAddbranchHero('red',0)
                this.host.AutoAddbranchHero('red',1)
                this.host.AutoAddbranchHero('red',2)
                this.host.AutoAddbranchHero('red',2)
                const _table = this.host.herobrach[GameRules.Red.GetPlayerID()]
                this.host.redbranchisok = true
                CustomNetTables.SetTableValue('Card_group_construction_phase','brachisok',{[GameRules.Red.GetPlayerID()]:true})
                CustomGameEventManager.Send_ServerToPlayer(GameRules.Red,"AUTO_SELECT_BRACH",_table)
            }
            if(!this.host.bluebranchisok){
                const _table = this.host.herobrach[GameRules.Blue.GetPlayerID()]
                this.host.AutoAddbranchHero('blue',0)
                this.host.AutoAddbranchHero('blue',0)
                this.host.AutoAddbranchHero('blue',1)
                this.host.AutoAddbranchHero('blue',2)
                this.host.AutoAddbranchHero('blue',2)
                this.host.bluebranchisok = true
                CustomNetTables.SetTableValue('Card_group_construction_phase','brachisok',{[GameRules.Blue.GetPlayerID()]:true})
                CustomGameEventManager.Send_ServerToPlayer(GameRules.Blue,"AUTO_SELECT_BRACH",_table)
            }
        }
        if(this.time === 1){
                CustomNetTables.SetTableValue('Card_group_construction_phase','herobrach',this.host.herobrach)
                this.host.SetcuurentsettingState = new showtime()
        }
        
        super.dataupdate()
        return 1
    }

    override entry(){
        CustomNetTables.SetTableValue("GameMianLoop",'currentLoopName',{current:"branch"})
    }
}

export class showtime extends ChooseHerostate{
    time = 1

    constructor(){
        super()
    }


    override entry(){
        CustomNetTables.SetTableValue("GameMianLoop",'currentLoopName',{current:"showtime"})
    }

    run(){
        this.time --;
        if(this.time == 0){
            this.host.close()
            CustomNetTables.SetTableValue('GameMianLoop','currentLoopName',{current:"isbattle"})
            GameRules.gamemainloop = new BattleGameLoop()
            GameRules.gamemainloop.StartcuurentsettingState = new faultCard(GameRules.gamemainloop)
        }
        return 1
    }
}

@reloadable
export class ChooseHeroCardLoop{
    private currentState:ChooseHerostate
    private haveSelectedHero:Record<string,number[]> = {} //已经选择的英雄    
    private heroThatCanChooseOnTheCurrentField:number[] = [] //当前场上可选择的英雄
    private selectOrder:number[] = []
    private selectindex = 0
    RedheroSelected:Array<number> = []  // 红色玩家已经选择过的英雄
    BlueheroSelected:Array<number> = []   // 蓝色玩家已经选择过的英雄
    RedbranchSelected:number[] = []
    BluebranchSelected:number[] = []
    herobrach:Record<number,{0:Array<number>,1:Array<number>,2:Array<number>}> = {}
    redisok:boolean = false
    blueisok:boolean = false
    time:number = 0
    redbranchisok = false
    bluebranchisok = false
    bluebranchherokv:Record<number,number> = {}
    redbranchherokv:Record<number,number> = {}
    timerid = ""

    constructor(){
            this.haveSelectedHero['BlueSelectstage'] = [-1,-1,-1,-1,-1] //初始化所有的英雄
            this.haveSelectedHero['RedSelectstage'] = [-1,-1,-1,-1,-1] //初始化所有的英雄
            this.setheroThatCanChooseOnTheCurrentField = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
            this.selectOrder = [1,2,2,2,2,1]
            this.herobrach[GameRules.Red.GetPlayerID() as number] = {0:[],1:[],2:[]}
            this.herobrach[GameRules.Blue.GetPlayerID() as number] = {0:[],1:[],2:[]}
            print("初始化分路成功")
            DeepPrintTable(this.herobrach)
            this.RegisterGameEvent()
            CustomNetTables.SetTableValue("GameMianLoop","currentLoopName",{current:"selectherocard"})
    }

    RegisterGameEvent(){
        CustomGameEventManager.RegisterListener("RED_SELECT_HERO_CARD",(_,event)=>{
            if(this.currentState.id == "RedSelectstage" && PlayerResource.GetPlayer(event.PlayerID) == GameRules.Red){
                for(const key in event.array){
                    if(event.array[key] == -1) continue
                    this.addRedHeroCardinlist = event.array[key]
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
                    this.addBlueHeroCardinlist = event.array[key]
                    if(this.currentState.remainingOptionalQuantity === 0){
                        this.blueisok = true
                    }
                }
            }
        })
    }


    get RedoptionalheroThatCanChooseOnTheCurrentField(){
        const newTable = this.heroThatCanChooseOnTheCurrentField.filter(value=>{
            let bool = true
            for(const heroid of this.BlueheroSelected){
                if(value == heroid){
                    bool = false
                }
            }
            for(const heroid of this.RedheroSelected){
                if(value == heroid){
                    bool = false
                }
            }
            return bool
        })
        const heroid = newTable[RandomInt(0,newTable.length - 1)]
        this.BlueheroSelected.push(heroid)
        return heroid
    }

    get BlueoptionalheroThatCanChooseOnTheCurrentField(){
        const newTable = this.heroThatCanChooseOnTheCurrentField.filter(value=>{
            let bool = true
            for(const heroid of this.BlueheroSelected){
                if(value == heroid){
                    bool = false
                }
            }
            for(const heroid of this.RedheroSelected){
                if(value == heroid){
                    bool = false
                }
            }
            return bool
        })
        const heroid = newTable[RandomInt(0,newTable.length - 1)]
        this.RedheroSelected.push(heroid)
        return heroid
    }
    

    Setbranch(branchdata:any,PlayerID:PlayerID){
        for(const brach in branchdata){
            for(const index in branchdata[brach]){
               print("路线为",brach)
               print("自动分路",branchdata[brach][index])
               print("打印当前数组")
               DeepPrintTable(this.herobrach[PlayerID])
               print("打印数据")
               DeepPrintTable(branchdata)
               if(this.herobrach[PlayerID][Number(brach) as unknown as 0|1|2] == undefined) this.herobrach[PlayerID][Number(brach) as unknown as 0|1|2] = []
               this.herobrach[PlayerID][Number(brach) as unknown as 0|1|2].push(branchdata[brach][index])
            }
        }
    }


    get Getselectfrequency(){
        const frequency = this.selectOrder[this.selectindex + 1]
        this.selectindex++
        return frequency
    }

    AutoAddbranchHero(team:'red'|'blue',branchindex:number){
        if(team === 'blue'){
            const table = this.BlueheroSelected.filter(value=>{
                for(let  key = 0 ; key < this.BluebranchSelected.length ; key ++){
                    if(value == this.BluebranchSelected[key]){
                        return false
                    }
                }
                return true
            })
            const heorid = table[RandomInt(0,table.length - 1)]
            this.herobrach[GameRules.Blue.GetPlayerID()][branchindex as 0|1|2].push(heorid)
            this.BluebranchSelected.push(heorid)
        }else{
            const table = this.RedheroSelected.filter(value=>{
                for(let  key = 0 ; key < this.RedbranchSelected.length ; key ++){
                    if(value == this.RedbranchSelected[key]){
                        return false
                    }
                }
                return true
            })
            const heorid = table[RandomInt(0,table.length - 1)]
            this.herobrach[GameRules.Red.GetPlayerID()][branchindex as 0|1|2].push(heorid)
            this.RedbranchSelected.push(heorid)
        }
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

    set addBlueHeroCardinlist(herocardid:number){
       if(this.GetcurrentState.remainingOptionalQuantity < 1) return;
       for(const team in this.haveSelectedHero){
           print("当前ID")
           print(this.currentState.id)
           print("当前team",team)
           if(team.indexOf(this.currentState.id) > -1){
               for(let index = 0 ; index < this.haveSelectedHero[team].length ; index ++){
                   if(this.haveSelectedHero[team][index] === -1){
                       this.haveSelectedHero[team][index] = herocardid
                       this.BlueheroSelected.push(herocardid)
                       this.GetcurrentState.remainingOptionalQuantity--
                       CustomNetTables.SetTableValue('Card_group_construction_phase','playerHasChosen',this.haveSelectedHero)
                       CustomNetTables.SetTableValue('Card_group_construction_phase','heroSelected',this.BlueheroSelected.concat(this.RedheroSelected))
                       return;
                   }
               }
           }
       }
    }

    set addRedHeroCardinlist(herocardid:number){
        if(this.GetcurrentState.remainingOptionalQuantity < 1) return;
        for(const team in this.haveSelectedHero){
            print("当前ID")
            print(this.currentState.id)
            print("当前team",team)
            if(team.indexOf(this.currentState.id) > -1){
                for(let index = 0 ; index < this.haveSelectedHero[team].length ; index ++){
                    if(this.haveSelectedHero[team][index] === -1){
                        this.haveSelectedHero[team][index] = herocardid
                        this.RedheroSelected.push(herocardid)
                        this.GetcurrentState.remainingOptionalQuantity--
                        CustomNetTables.SetTableValue('Card_group_construction_phase','playerHasChosen',this.haveSelectedHero)
                        CustomNetTables.SetTableValue('Card_group_construction_phase','heroSelected',this.RedheroSelected.concat(this.BlueheroSelected))
                        return;
                    }
                }
            }
        }
     }
    
     close(){
         Timers.RemoveTimer(this.timerid)
     }

    // 设置初始状态
    set SetcuurentsettingState(state:ChooseHerostate){
        state.host = this
        this.redisok = false
        this.blueisok = false
        this.currentState = state
        this.currentState.entry()
        this.timerid = Timers.CreateTimer(()=>{
            return this.currentState.run()
        })
    }
}