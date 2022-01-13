import { ScenesBuildbehavior } from "../Build/Scenesbuilder";
import { damage } from "../feature/damage";
import { AbilityCard } from "../instance/Ability";
import { BattleArea, Cardheaps, Grave, Hand, Hide, Scenes } from "../instance/Scenes";
import { Unit } from "../instance/Unit";
import { Timers } from "../lib/timers";
import { LinkedList } from "../structure/Linkedlist";
import { BATTLE_BRACH_STATE, clear_option_mask_state, get_current_battle_brach, loop_end_clear, set_current_battle_brach, set_current_operate_brach, Set_option_mask_state, STRATEGY_BRACH_STATE } from "./nettablefuc";
import { Battle_Select_Brach, operate, optionMask, statusSwitcher, strategy_Select_Brach } from "./statusSwitcher";

export enum 游戏循环 {
    "英雄部署阶段",
    "出牌阶段",
    "伤害结算阶段",
    "商店购买阶段"
}

const 商店购买时间 = 5
const 英雄部署时间 = 5
const 战斗结算时间 = 10
const 策略时间 = 9999

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
    time = 英雄部署时间;
    redisok: boolean = false;
    blueisok: boolean = false;

    constructor(context: BattleGameLoop) {
        super(context);
    }

    entry(){
        super.entry()
        print("进入了英雄部署阶段");
        const blue_hand = GameRules.SceneManager.GetHandsScene(GameRules.Blue.GetPlayerID()) as Hand
        const red_hand = GameRules.SceneManager.GetHandsScene(GameRules.Red.GetPlayerID()) as Hand
        const blue_ability_card = blue_hand.find_type(["TrickSkill","SmallSkill"]) as AbilityCard[]
        const red_ability_card = red_hand.find_type(["TrickSkill","SmallSkill"]) as AbilityCard[]
        blue_ability_card.forEach(abilitycard=>{
            GameRules.SceneManager.change_secens(abilitycard.UUID,"HIDE",abilitycard.Index,true)
        })
        red_ability_card.forEach(abilitycard=>{
            GameRules.SceneManager.change_secens(abilitycard.UUID,"HIDE",abilitycard.Index,true)
        })
        blue_hand.again_sort()
        red_hand.again_sort()
        const red_hide = GameRules.SceneManager.GetHideScene(GameRules.Red.GetPlayerID()) as Hide
        const blue_hide = GameRules.SceneManager.GetHideScene(GameRules.Blue.GetPlayerID()) as Hide
        red_hide.again_sort()
        blue_hide.again_sort()
        red_hide.updateScene()
        blue_hide.updateScene()
        print("开打打印-------------------------------")
        red_hide.Print()
        blue_hide.Print()
        print("结束打印----------------------------")
        this.hero_in_hand()
        red_hand.update()
        blue_hand.update()
        //测试
        blue_hand.Print()
        print("当前链表长度",blue_hand.Cardlinked.length)
    }

    /**把墓地的英雄加入手牌 */
    hero_in_hand(){
        const red_Grave = GameRules.SceneManager.GetGraveScene(GameRules.Red.GetPlayerID()) as Grave
        const blue_Grave = GameRules.SceneManager.GetGraveScene(GameRules.Blue.GetPlayerID()) as Grave
        red_Grave.foreach(grave_card=>{
            print("循环了")
            GameRules.SceneManager.change_secens(grave_card.UUID,"HAND",undefined,false)
        })
        blue_Grave.foreach(grave_card=>{
            print("蓝方墓地的卡牌有=>",grave_card.UUID,"id为",grave_card.Id)
            GameRules.SceneManager.change_secens(grave_card.UUID,"HAND",undefined,false)
        })
    }

    /** 把所有hide场景的牌拉回来 */
    hide_reload(){
        const red_hide = GameRules.SceneManager.GetHideScene(GameRules.Red.GetPlayerID()) as Hide
        const blue_hide = GameRules.SceneManager.GetHideScene(GameRules.Blue.GetPlayerID()) as Hide
        red_hide.foreach(card =>{
            GameRules.SceneManager.change_secens(card.UUID,"HAND",undefined,false)
        })
        blue_hide.foreach(card =>{
            GameRules.SceneManager.change_secens(card.UUID,"HAND",undefined,false)
        })
        // const red_hand = GameRules.SceneManager.GetHandsScene(GameRules.Red.GetPlayerID()) as Hand
        // const blue_hand = GameRules.SceneManager.GetHandsScene(GameRules.Blue.GetPlayerID()) as Hand
        // red_hand.update()
        // blue_hand.update()
        
    }

    exit(){
        super.exit()
        print("部署阶段退出了")
        this.hide_reload()
    }

    run() {
        super.run();
        if(this.time == 0){
            this.host.ChangeState(new faultCard(this.host,STRATEGY_BRACH_STATE.上路))
        }
        return 1;
    }
}

export class faultCard extends GameLoopState {
    time = 策略时间;
    id = 游戏循环.出牌阶段;
    cuurent_fault_player: PlayerID; //当前出牌队伍
    gameventtable:CustomGameEventListenerID[] = []
    defualt_time:number = 策略时间 //默认每轮时间
    defualt_countDown:number = 8 //默认倒计时时间
    blue_countDown_mark:boolean = false //蓝色倒计时标记
    red_countDown_mark:boolean = false //红色倒计时标记
    frist_loop:boolean = true //双方都操作过后 该记载关闭
    loop_count:number = 0 //回合数记载

    constructor(context: BattleGameLoop,brach:STRATEGY_BRACH_STATE) {
        super(context);
        print("初始化operate",brach)
        set_current_operate_brach(brach)
        this.register_gamevent()
    }

    off_frist_loop(){
        this.frist_loop = false
    }

    add_loop_count(){
        this.loop_count++
        print("当前回合数",this.loop_count)
        if(this.loop_count > 2){
            this.off_frist_loop()
        }
    }

    set set_blue_countDown_mark(boolean:boolean){
        this.blue_countDown_mark = boolean
    }

    set set_red_countDown_mark(boolean:boolean){
        this.red_countDown_mark = boolean
    }

    set change_cuurent_fault_player(player:PlayerID){
        this.cuurent_fault_player = player
        CustomNetTables.SetTableValue("GameMianLoop",'current_operate_playerid',{cuurent:this.cuurent_fault_player.toString()})
    }

    register_gamevent(){
        this.gameventtable.push(CustomGameEventManager.RegisterListener("C2S_CLICK_SKIP",(_,event)=>{
            if(this.cuurent_fault_player == event.PlayerID){
                this.cuurent_fault_player == GameRules.Red.GetPlayerID() ? Set_option_mask_state(optionMask.红队点击跳过) : Set_option_mask_state(optionMask.蓝队点击跳过)
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
        print("进入了策略模式")
        this.change_cuurent_fault_player = GameRules.Red.GetPlayerID()
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
            // this.give_cards();
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
            for (let count = 0; count < 15; count++) {
                if (i == 0) {
                    if (RollPercentage(70)) {
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


    /**切换状态进行的一些清除工作 */
    signclear(totoggle:"blue"|"red"){
        totoggle == 'blue' ? Set_option_mask_state(optionMask.红队点击跳过,'remove') : Set_option_mask_state(optionMask.蓝队点击跳过,'remove')
    }

    /**机器人操作 */
    bot_operate(){
        if(IsInToolsMode()){
           if(this.cuurent_fault_player == GameRules.bot){
              Timers.CreateTimer(3,()=>{
                print(this.cuurent_fault_player,"号机器人玩家点击了跳过")
                this.cuurent_fault_player == GameRules.Red.GetPlayerID() ? this.switchToTheBlueTeamOperation() : this.switchToTheRedTeamOperation()
              })
           }
        }
    }

    /**计时器到期操作 */
    timerExpires(){
        if(this.cuurent_fault_player == GameRules.Red.GetPlayerID()){
            this.switchToTheBlueTeamOperation()
        }else{
            this.switchToTheRedTeamOperation()
        }
    }

    /**切换至红队的系列操作 */
    switchToTheRedTeamOperation(){
        print("切换至红队了")
        this.change_cuurent_fault_player = GameRules.Red.GetPlayerID()
        this.time = this.defualt_time
        this.signclear("red")
        this.add_loop_count()
    }

    /**切换至蓝队的系列操作 */
    switchToTheBlueTeamOperation(){
        print("切换至蓝队了")
        this.change_cuurent_fault_player = GameRules.Blue.GetPlayerID()
        this.time = this.defualt_time
        this.signclear("blue")
        this.add_loop_count()
    }


    run() {
        super.run()
        switch(statusSwitcher(this.frist_loop)){
            case(operate.切换至红队):{
                this.switchToTheRedTeamOperation()
                return 1
            }
            case(operate.切换至蓝队):{
                this.switchToTheBlueTeamOperation()
                return 1
            }
            case(operate.无动作):{
                if(this.time == 0){
                    this.timerExpires()
                }
                return 1
            }
            case(operate.红队进入倒计时):{
                if(!this.red_countDown_mark){
                    this.set_red_countDown_mark = true
                    this.time = this.defualt_countDown
                }
                return 1
            }
            case(operate.蓝队进入倒计时):{
                if(!this.blue_countDown_mark){
                    this.set_red_countDown_mark = true
                    this.time = this.defualt_countDown
                }
                return 1
            }
            case(operate.进入战斗结算):{
                const toBattale = Battle_Select_Brach()
                //三路结算已经完毕
                if(toBattale == BATTLE_BRACH_STATE.不在此状态){
                    //切换至装备购买阶段
                    const _shopPurchaseStage = new shopPurchaseStage(this.host)
                    this.host.ChangeState(_shopPurchaseStage)
                }
                //根据上一场战斗路线 切换下一场战斗路线位置
                const _battle_instance = new injurySettlementStage(this.host,toBattale)
                this.host.ChangeState(_battle_instance)
                clear_option_mask_state()
                return 1
            }
        }
    }


    exit(){
        super.exit()
        print("当前结算阶段",get_current_battle_brach())
        if(!this.host.small_solider_tag[GameRules.Red.GetPlayerID()]){
            const red_solider = GameRules.brash_solidier.AutoSolider(GameRules.Red.GetPlayerID(),ScenesBuildbehavior.fitler(get_current_battle_brach() == "4" ? "0" : get_current_battle_brach(),GameRules.Red.GetPlayerID()) as BattleArea )
        }
        if(!this.host.small_solider_tag[GameRules.Blue.GetPlayerID()]){
            const blue_solider = GameRules.brash_solidier.AutoSolider(GameRules.Blue.GetPlayerID(),ScenesBuildbehavior.fitler(get_current_battle_brach() == "4" ? "0" : get_current_battle_brach(),GameRules.Blue.GetPlayerID()) as BattleArea )
        }
        
    }

}

export class injurySettlementStage extends GameLoopState {
    time = 战斗结算时间;
    id = 游戏循环.伤害结算阶段;
    settlementRoute:BATTLE_BRACH_STATE //1 2 3 上 中 下

    constructor(context: BattleGameLoop,settlementRoute:BATTLE_BRACH_STATE){
        super(context)
        this.settlementRoute = settlementRoute
    }

    entry(){
        Timers.CreateTimer(1,()=>{
            super.entry()
            print("当前进入",this.settlementRoute,"路结算")
            set_current_battle_brach(this.settlementRoute)
            this.settlementModule()
        })
    }

    /**战斗结算算法 */
    settlementModule(){
            const redrouter = GameRules.SceneManager.fitler(this.settlementRoute,GameRules.Red.GetPlayerID())
            const bluerouter = GameRules.SceneManager.fitler(this.settlementRoute,GameRules.Blue.GetPlayerID())
            const start = redrouter.quantityOfChessPieces >= bluerouter.quantityOfChessPieces ? redrouter : bluerouter
            if(IsInToolsMode()){
                redrouter.quantityOfChessPieces > bluerouter.quantityOfChessPieces ? print("当前红色比蓝色多,红色先攻击") : print("当前蓝色比红色多,蓝色先攻击")
            }
            let index = 0
            let defualtindex = 0
            start.foreach((card:Unit)=>{
                if(card.isAttackPreHook()){
                   index += RandomFloat(1,2)
                }
                Timers.CreateTimer(card.isAttackPreHook() ? index : defualtindex,()=>{
                    const target = card.Scene.find_oppose().IndexGet(card.Index) as Unit
                    const _damage = new damage(card as Unit,target)
                    _damage.attacklement()     
                })
            })
    }

    exit(){
        const redrouter = GameRules.SceneManager.fitler(this.settlementRoute,GameRules.Red.GetPlayerID()) as BattleArea
        const bluerouter = GameRules.SceneManager.fitler(this.settlementRoute,GameRules.Blue.GetPlayerID()) as BattleArea
        redrouter.call_cetner()
        bluerouter.call_cetner()
    }

    run(){
        super.run()
        print("战斗结算中....")
        if(this.time == 0){
           const _battle_select_brach = Battle_Select_Brach()
           if(_battle_select_brach == BATTLE_BRACH_STATE.不在此状态){
               this.host.ChangeState(new shopPurchaseStage(this.host))
               return 1
           }
           this.host.ChangeState(new faultCard(this.host,strategy_Select_Brach()))
        }
        return 1
    }
}

export class shopPurchaseStage extends GameLoopState {
    time = 商店购买时间;
    id = 游戏循环.商店购买阶段;


    entry(){
        super.entry()
        print("进入商店购买阶段")
    }

    run(){
        super.run()
        print("商店购买阶段进行中...")
        if(this.time == 0){
            this.host.ChangeState(new heroDeploymentPhase(this.host))
            loop_end_clear()
        }
        return 1
    }
}

type history = { [keys: number]: Partial<{ [游戏循环.英雄部署阶段]: GameLoopState, [游戏循环.出牌阶段]: GameLoopState, [游戏循环.伤害结算阶段]: GameLoopState, [游戏循环.商店购买阶段]: GameLoopState; }>; };

export class BattleGameLoop {
    State: GameLoopState;
    RoundCount: number = 0;
    history: history = {};
    init: boolean;
    small_solider_tag:Record<number,boolean> = {}

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

function CARD_TYPE(CARD_TYPE: any) {
    throw new Error("Function not implemented.");
}
