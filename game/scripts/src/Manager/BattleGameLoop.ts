import { Cardheaps } from "../instance/Scenes";
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

    entry() {
        CustomNetTables.SetTableValue("GameMianLoop", 'smallCycle', { current: this.id });
    }

    exit() {
        this.host.Sethistory = this;
    }

    run() {
        this.time--;
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
            this.host.ChangeState(new faultCard(this.host));
        }
        return 1;
    }
}

export class faultCard extends GameLoopState {
    time = 60;
    id = 游戏循环.出牌阶段;
    cuurent_fault_player: PlayerID;
    red_haveAnOperation: boolean = false; //红队有操作
    blue_haveAnOpreration: boolean = false; //蓝队有操作
    red_skip: boolean = false;  //红队跳过状态
    blue_skip: boolean = false; //蓝色跳过状态

    constructor(context: BattleGameLoop) {
        super(context);
    }

    registergamevent() {

    }

    entry() {
        super.entry();
        print("出牌阶段进入111");
        this.cuurent_fault_player = GameRules.Red.GetPlayerID(); // 将当前可以出牌设置为红队
        print("是否有大技能入队");
        print(GameRules.SceneManager.GetCardheapsScene(GameRules.Blue.GetPlayerID()).SceneName);
        print(GameRules.SceneManager.GetCardheapsScene(GameRules.Blue.GetPlayerID()));
        GameRules.SceneManager.update();
        Timers.CreateTimer(1,()=>{
            if (!this.host.init) {
                this.init_give_cards();
                this.host.init = true;
            } else {
                this.give_cards();
            }
        })
    }


    //** 重复循环 进入每回合发放手牌 */
    give_cards() {
        for (let i = 0; i < 2; i++) {
            for (let count = 0; count < 2; count++) {
                if (i == 0) {
                    if (RollPercentage(30)) {
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Red.GetPlayerID()).trick_abilidy_dequeue().UUID, "HAND",count);
                    } else {
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Red.GetPlayerID()).small_ability_dequeue().UUID, "HAND",count);
                    }
                } else {
                    if (RollPercentage(50)) {
                        //50%几率抽大招
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Blue.GetPlayerID()).trick_abilidy_dequeue().UUID, "HAND",count);
                    } else {
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Blue.GetPlayerID()).small_ability_dequeue().UUID, "HAND",count);
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
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Red.GetPlayerID()).trick_abilidy_dequeue().UUID, "HAND",count);
                    } else {
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Red.GetPlayerID()).small_ability_dequeue().UUID, "HAND",count);
                    }
                } else {
                    if (RollPercentage(30)) {
                        //50%几率抽大招
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Blue.GetPlayerID()).trick_abilidy_dequeue().UUID, "HAND",count);
                    } else {
                        GameRules.SceneManager.change_secens(GameRules.SceneManager.GetCardheapsScene(GameRules.Blue.GetPlayerID()).small_ability_dequeue().UUID, "HAND",count);
                    }
                }
            }
        }
    }


    run() {
        super.run();
        if (this.time == 0) {
            if (!this.red_haveAnOperation && this.blue_haveAnOpreration) {
                GameRules.gamemainloop.ChangeState(new injurySettlementStage(GameRules.gamemainloop));
            } else {
                this.cuurent_fault_player = this.cuurent_fault_player == GameRules.Red.GetPlayerID() ? GameRules.Blue.GetPlayerID() : GameRules.Red.GetPlayerID();
                this.time = 60;
            }
        }
        return 1;
    }

}

export class injurySettlementStage extends GameLoopState {
    id = 游戏循环.伤害结算阶段;
}

export class shopPurchaseStage extends GameLoopState {
    id = 游戏循环.商店购买阶段;

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
        CustomNetTables.SetTableValue('GameMianLoop', 'smallCycle', { current: this.State.id });
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