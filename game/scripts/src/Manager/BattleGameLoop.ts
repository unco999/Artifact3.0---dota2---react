import { ScenesBuildbehavior } from "../Build/Scenesbuilder";
import { Cardheaps, Scenes } from "../instance/Scenes";
import { Timers } from "../lib/timers";
import { LinkedList } from "../structure/Linkedlist";

enum 游戏循环 {
    "英雄部署阶段",
    "出牌阶段",
    "伤害结算阶段",
    "商店购买阶段"
}


//第一回合六張牌  5小1大  第一回合結束  商店功能花錢買牌(2元买大技能 1元买小技能)  然後英雄分錄  分完路發兩張   


export class GameLoopState {
    host: BattleGameLoop;
    id: 游戏循环;
    time: number; //该阶段计数器

    constructor(context: BattleGameLoop) {
        this.host = context;
    }
    
    /**
     * 注册事件解除
     */
    garbageCollection(){

    }

    entry() {
        CustomNetTables.SetTableValue("GameMianLoop", 'smallCycle', { current: this.id .toString()});
    }

    exit() {
        this.host.Sethistory = this;
    }

    run() {
        this.time--;
        CustomNetTables.SetTableValue("GameMianLoop","RemainingTime",{cuurent:this.time.toString()})
    }


    /**根据当前回合状态给予过滤 */
    fiter() {
        return true;
    }
}

export class heroDeploymentPhase extends GameLoopState {
    id = 游戏循环.英雄部署阶段;
    time = 60;
    redisok: boolean = false;
    blueisok: boolean = false;

    constructor(context: BattleGameLoop) {
        super(context);
    }

    run() {
        super.run();
        if (this.time === 0 || this.redisok && this.blueisok) {
            this.host.ChangeState(new faultCard(this.host,1));
        }
        return 1;
    }
}

export class faultCard extends GameLoopState {
    time = 20;
    id = 游戏循环.出牌阶段;
    cuurent_fault_player: PlayerID; //当前出牌队伍
    cuurent_brach:number //当前路线的选择
    gameventtable:CustomGameEventListenerID[] = []

    constructor(context: BattleGameLoop,brach:number) {
        super(context);
        this.cuurent_brach = brach;
        this.register_gamevent()
    }

    register_gamevent(){
        this.gameventtable.push(CustomGameEventManager.RegisterListener("C2S_CLICK_SKIP",(_,event)=>{
            if(this.cuurent_fault_player == event.PlayerID){
               const datakey = event.PlayerID == GameRules.Blue.GetPlayerID() ? "thisRoundOfBluefield" : "thisRoundOfRedfield"
               const data = CustomNetTables.GetTableValue("GameMianLoop",datakey)
               CustomNetTables.SetTableValue("GameMianLoop",datakey,{...data,skip:1})   
            }
        }))
    }

    garbageCollection(){
        this.gameventtable.forEach(gamevent=>{
            CustomGameEventManager.UnregisterListener(gamevent)
        })
    }

    entry() {
        super.entry();
        CustomNetTables.SetTableValue("GameMianLoop",'current_operate_brach',{cuurent:this.cuurent_brach.toString()}) // 设置全局当前策略的路线
        this.cuurent_fault_player = GameRules.Red.GetPlayerID(); // 将当前可以出牌设置为红队
        CustomNetTables.SetTableValue("GameMianLoop","current_operate_playerid",{cuurent:this.cuurent_fault_player.toString()})
        if (!this.host.init) {
            ScenesBuildbehavior.ScenesBuild()
            ScenesBuildbehavior.HeapsBuild(GameRules.Red.GetPlayerID())
            ScenesBuildbehavior.HeapsBuild(GameRules.Blue.GetPlayerID())
            this.init_give_cards();
            this.host.init = true;
            GameRules.SceneManager.update();
            Timers.CreateTimer(5,()=>{
                // this.init_shuffle()
            })
        } else {
            this.give_cards();
        }
    }

    load_entry(){
        this.cuurent_fault_player == GameRules.Red.GetPlayerID() ? CustomNetTables.SetTableValue("GameMianLoop","thisRoundOfRedfield",{option:0,skip:0})
        : CustomNetTables.SetTableValue("GameMianLoop","thisRoundOfBluefield",{option:0,skip:0})
        if(IsInToolsMode()){
            this.isbot(this.cuurent_fault_player) && GameRules.bot == GameRules.Red.GetPlayerID() ? CustomNetTables.SetTableValue("GameMianLoop","thisRoundOfRedfield",{option:0,skip:1})
            :CustomNetTables.SetTableValue("GameMianLoop","thisRoundOfBluefield",{option:0,skip:0})
        }
    }

    init_shuffle(){
        GameRules.SceneManager.GetGoUpScene(GameRules.Blue.GetPlayerID()).shuffle()
        GameRules.SceneManager.GetGoUpScene(GameRules.Red.GetPlayerID()).shuffle()
        GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID()).shuffle()
        GameRules.SceneManager.GetMidwayScene(GameRules.Red.GetPlayerID()).shuffle()
        GameRules.SceneManager.GetLaidDownScene(GameRules.Blue.GetPlayerID()).shuffle()
        GameRules.SceneManager.GetLaidDownScene(GameRules.Red.GetPlayerID()).shuffle()
    }

    //** 重复循环 进入每回合发放手牌 */
    give_cards() {
        for (let i = 0; i < 2; i++) {
            for (let count = 0; count < 2; count++) {
                if (i == 0) {
                    if (RollPercentage(30)) {
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Red.GetPlayerID()).Trick_ability_dequeue().UUID, "HAND");
                    } else {
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Red.GetPlayerID()).Small_ability_dequeue().UUID, "HAND");
                    }
                } else {
                    if (RollPercentage(50)) {
                        //50%几率抽大招
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Blue.GetPlayerID()).Trick_ability_dequeue().UUID, "HAND");
                    } else {
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Blue.GetPlayerID()).Small_ability_dequeue().UUID, "HAND");
                    }
                }
            }
        }
    }

    /**第一次进入手牌初始化 */
    init_give_cards() {
        for (let i = 0; i < 2; i++) {
            for (let count = 0; count < 5; count++) {
                if (i == 0) {
                    if (RollPercentage(30)) {
                        //50%几率抽大招
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Red.GetPlayerID()).Trick_ability_dequeue().UUID, "HAND");
                    } else {
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Red.GetPlayerID()).Small_ability_dequeue().UUID, "HAND");
                    }
                } else {
                    if (RollPercentage(30)) {
                        //50%几率抽大招
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Blue.GetPlayerID()).Trick_ability_dequeue().UUID, "HAND");
                    } else {
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Blue.GetPlayerID()).Small_ability_dequeue().UUID, "HAND");
                    }
                }
            }
        }
    }

    /**战斗结算选路 */
    gotoBattlesettlement(){
        const up = CustomNetTables.GetTableValue("GameMianLoop",'uplineSettlement')
        const mid = CustomNetTables.GetTableValue("GameMianLoop","midCircuitSettlement")
        const low = CustomNetTables.GetTableValue("GameMianLoop","lowerSettlement")
        const brach = up ? new injurySettlementStage(this.host,1) : mid ? new injurySettlementStage(this.host,2) : low ? new injurySettlementStage(this.host,3) : new shopPurchaseStage(this.host)
        GameRules.gamemainloop.ChangeState(brach);
        print("进入战斗结算阶段",brach.id)
    }

    isbot(player:PlayerID){
       print("isobot")
       print(GameRules.bot)
       print(player)
       return GameRules.bot == player
    }


    run() {
        print("cuurent_brach",this.cuurent_brach,"player",this.cuurent_fault_player,"正在进行")
        super.run();
        if(this.cuurent_fault_player == GameRules.Blue.GetPlayerID()){
            const bluebool = CustomNetTables.GetTableValue("GameMianLoop",'thisRoundOfBluefield')
            const redbool = CustomNetTables.GetTableValue("GameMianLoop",'thisRoundOfRedfield')
            if(redbool && bluebool && bluebool.skip== 1 && bluebool.option== 1){
                this.cuurent_fault_player = GameRules.Red.GetPlayerID()
                this.time = 20
                print("切换到红队出牌",this.cuurent_fault_player)
                CustomNetTables.SetTableValue("GameMianLoop","current_operate_playerid",{cuurent:this.cuurent_fault_player.toString()})
                this.load_entry()
            }
            if(redbool && bluebool && bluebool.skip == 1 && bluebool.option == 0 && redbool.option == 0){
                this.gotoBattlesettlement()
                return
            }
            //到这里只需要转换状态就行了
            if(bluebool && bluebool.skip == 1){
                this.cuurent_fault_player = GameRules.Red.GetPlayerID()
                this.time = 20
                print("切换到红队出牌",this.cuurent_fault_player)
                CustomNetTables.SetTableValue("GameMianLoop","current_operate_playerid",{cuurent:this.cuurent_fault_player.toString()})
                this.load_entry()
            }
        }
        if(this.cuurent_fault_player == GameRules.Red.GetPlayerID()){
            const redbool = CustomNetTables.GetTableValue("GameMianLoop",'thisRoundOfRedfield')
            const bluebool = CustomNetTables.GetTableValue("GameMianLoop",'thisRoundOfBluefield')
            if(redbool && bluebool && redbool.skip== 1 && redbool.option == 1){
                this.cuurent_fault_player = GameRules.Blue.GetPlayerID()
                this.time = 20
                print("path 1")
                print("切换到蓝队出牌",this.cuurent_fault_player)
                CustomNetTables.SetTableValue("GameMianLoop","current_operate_playerid",{cuurent:this.cuurent_fault_player.toString()})
                this.load_entry()
            }
            if(redbool && bluebool && redbool.skip == 1&& redbool.option == 0 && bluebool.option == 0 ){
                this.gotoBattlesettlement()
                return
            }
            //到这里只需要转换状态就行了
            if(redbool && redbool.skip == 1){
                this.cuurent_fault_player = GameRules.Blue.GetPlayerID()
                this.time = 20
                print("path 2")
                print("切换到蓝队出牌",this.cuurent_fault_player)
                CustomNetTables.SetTableValue("GameMianLoop","current_operate_playerid",{cuurent:this.cuurent_fault_player.toString()})
                this.load_entry()
            }
        }
        if (this.time == 0) {
            this.cuurent_fault_player = this.cuurent_fault_player == GameRules.Red.GetPlayerID() ? GameRules.Blue.GetPlayerID() : GameRules.Red.GetPlayerID();
            this.time = 20;
            CustomNetTables.SetTableValue("GameMianLoop","current_operate_playerid",{cuurent:this.cuurent_fault_player.toString()})
            this.load_entry()
        }
        return 1;
    }

}

export class injurySettlementStage extends GameLoopState {
    time = 10;
    id = 游戏循环.伤害结算阶段;
    settlementRoute:number //1 2 3 上 中 下

    constructor(context: BattleGameLoop,settlementRoute:number){
        super(context)
        this.settlementRoute = settlementRoute
    }

    

    entry(){
        super.entry()
        print("当前进入",this.settlementRoute,"路结算")
    }

    run(){
        super.run()
        if(this.time == 0){
            this.settlementRoute < 4 ? this.host.ChangeState(new faultCard(this.host,this.settlementRoute + 1)) : this.host.ChangeState(new shopPurchaseStage(this.host))
        }
    }
}

export class shopPurchaseStage extends GameLoopState {
    time = 40;
    id = 游戏循环.商店购买阶段;
    entry(){
        super.entry()
    }
}

type history = { [keys: number]: Partial<{ [游戏循环.英雄部署阶段]: GameLoopState, [游戏循环.出牌阶段]: GameLoopState, [游戏循环.伤害结算阶段]: GameLoopState, [游戏循环.商店购买阶段]: GameLoopState; }>; };

export class BattleGameLoop {
    State: GameLoopState;
    RoundCount: number = 0;
    history: history = {};
    init: boolean;

    constructor() {
        
    }

    //* 将游戏状态给进历史 */
    set Sethistory(state: GameLoopState) {
        state.garbageCollection()
        if (!this.history[this.RoundCount]) this.history[this.RoundCount] = {};
        this.history[this.RoundCount][state.id] = state;
    }

    ChangeState(state: GameLoopState) {
        this.State.exit();
        this.State = state;
        this.State.entry();
        if (state.id == 游戏循环.英雄部署阶段) {
            this.RoundCount++;
        }
        CustomNetTables.SetTableValue('GameMianLoop', 'smallCycle', { current: this.State.id.toString() });
    }

    set StartcuurentsettingState(state: GameLoopState) {
        this.State = state;
        this.State.entry();
        Timers.CreateTimer(() => {
            if (GameRules.IsGamePaused()) return 1;
            return this.State.run();
        });
    }


    get filter() {
        return this.State.fiter();
    }
}