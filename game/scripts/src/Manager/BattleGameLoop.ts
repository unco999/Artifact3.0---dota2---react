import { Timers } from "../lib/timers";
import { LinkedList } from "../structure/Linkedlist";

enum 游戏循环{
    "英雄部署阶段",
    "出牌阶段",
    "伤害结算阶段",
    "商店购买阶段"
}


export class GameLoopState{
    host:BattleGameLoop
    id:游戏循环
    time:number; //该阶段计数器

    constructor(context:BattleGameLoop){
        this.host = context
    }

    entry(){
        CustomNetTables.SetTableValue("GameMianLoop",'smallCycle',{current:this.id})
    }

    exit(){
        this.host.Sethistory = this
    }
    run(){
        return 1
    }
}

export class heroDeploymentPhase extends GameLoopState{
    id = 游戏循环.英雄部署阶段
    time = 60
    redisok:boolean = false
    blueisok:boolean = false

    constructor(context:BattleGameLoop){
        super(context)
    }

    run(){
        if(this.time === 0 || this.redisok && this.blueisok){
            this.host.ChangeState(new faultCard(this.host))
        }
        return 1
    }
}

export class faultCard extends GameLoopState{
    time = 60
    id = 游戏循环.出牌阶段
    cuurent_fault_player:PlayerID
    red_haveAnOperation:boolean = false //红队有操作
    blue_haveAnOpreration:boolean = false //蓝队有操作
    red_skip:boolean = false  //红队跳过状态
    blue_skip:boolean = false //蓝色跳过状态

    constructor(context:BattleGameLoop){
        super(context)
    }

    registergamevent(){
        
    }

    entry(){
        super.entry()
        print("出牌阶段进入111")
        this.cuurent_fault_player = GameRules.Red.GetPlayerID()
    }

    run(){
        this.time--
        return 1
    }

} 

export class injurySettlementStage extends GameLoopState{
    id = 游戏循环.伤害结算阶段
} 

export class shopPurchaseStage extends GameLoopState{
    id = 游戏循环.商店购买阶段

} 

type history = {[keys:number]:Partial<{[游戏循环.英雄部署阶段]:GameLoopState,[游戏循环.出牌阶段]:GameLoopState,[游戏循环.伤害结算阶段]:GameLoopState,[游戏循环.商店购买阶段]:GameLoopState}>}

export class BattleGameLoop{
    State:GameLoopState
    RoundCount:number = 0
    history:history = {}

    constructor(){

    }

    //* 将游戏状态给进历史 */
    set Sethistory(state:GameLoopState){
        if(!this.history[this.RoundCount]) this.history[this.RoundCount] = {}
        this.history[this.RoundCount][state.id] = state
    }

    ChangeState(state:GameLoopState){
        this.State.exit()
        this.State = state
        this.State.entry()
        if(state.id == 游戏循环.英雄部署阶段){
            this.RoundCount++
        }
    }

    set StartcuurentsettingState(state:GameLoopState){
        this.State = state
        this.State.entry()
        Timers.CreateTimer(()=>{
            if(GameRules.IsGamePaused()) return 1
            return this.State.run()
        })
    }
}