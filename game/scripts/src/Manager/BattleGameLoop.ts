import { ScenesBuildbehavior } from "../Build/Scenesbuilder";
import { damage } from "../feature/damage";
import { TurntableBase } from "../feature/turntable";
import { AbilityCard } from "../instance/Ability";
import { HOOK } from "../instance/Modifiler";
import { BattleArea, Cardheaps, Grave, Hand, Hide } from "../instance/Scenes";
import { Unit } from "../instance/Unit";
import { Timers } from "../lib/timers";
import { add_cuurent_glod, BATTLE_BRACH_STATE, clear_option_mask_state, get_current_battle_brach, get_current_operate_brach, loop_end_clear, set_current_battle_brach, set_current_operate_brach, Set_option_mask_state, STRATEGY_BRACH_STATE } from "./nettablefuc";
import { Battle_Select_Brach, GameLoopMaskClearBlue, GameLoopMaskClearBlueSkip, GameLoopMaskClearRed, GameLoopMaskClearRedSkip, GameLoopMaskSkipBlue, GameLoopMaskSkipRed, get_oparaotr_current, get_settlement_current, isBattleSettlement, IsblueOperater, IsRedOperater, operate, optionMask, SetGameLoopMasK, set_oparator_false, set_settlement_false, set_settlement_true, strategy_Select_Brach } from "./statusSwitcher";

export enum 游戏循环 {
    "英雄部署阶段",
    "出牌阶段",
    "伤害结算阶段",
    "商店购买阶段"
}

const 商店购买时间 = 40
const 英雄部署时间 = 40
const 战斗结算时间 = 4
const 策略时间 = 70

//第一回合六張牌  5小1大  第一回合結束  商店功能花錢買牌(2元买大技能 1元买小技能)  然後英雄分錄  分完路發兩張   

/**通过字符串找到当前场景实例 */
export function brachFilfer(str:string,playerID:PlayerID){
    print("传入的解析路线是",str)
    switch(str){
        case "1":{
            print("解析为上路")
            return GameRules.SceneManager.GetGoUpScene(playerID)
        }
        case "2":{
            print("解析为中路")
            return GameRules.SceneManager.GetMidwayScene(playerID)
        }
        case "3":{
            print("解析为下路")
            return GameRules.SceneManager.GetLaidDownScene(playerID)
        }
    }
    return null
}


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
        if(get_settlement_current() == 1){
            return 1
        }
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
        this.give_cards()
    }

    give_cards() {
        const redScenesHand = GameRules.SceneManager.GetCardheapsScene(GameRules.Red.GetPlayerID()) as Cardheaps
        const BlueScenesHand = GameRules.SceneManager.GetCardheapsScene(GameRules.Blue.GetPlayerID()) as Cardheaps
        const redCard = redScenesHand.takeAhand2any()
        const blueCard = BlueScenesHand.takeAhand2any()
        redCard && redCard.forEach(card=>{
            GameRules.SceneManager.change_secens(card.UUID,"HAND")
        })
        blueCard && blueCard.forEach(card=>{
            GameRules.SceneManager.change_secens(card.UUID,"HAND")
        })
    }


    run() {
        super.run();
        if(this.time == 1){
            this.host.ChangeState(new faultCard(this.host,strategy_Select_Brach()))
        }
        return 1;
    }
}

export class faultCard extends GameLoopState {
    time = 策略时间;
    id = 游戏循环.出牌阶段;
    cuurent_fault_player: PlayerID; //当前出牌队伍
    loop_count:number = 0 //回合数记载
    historyRecord:[number,number] = [-1,-1] //上回合的玩家是否有操作 -1未读取 1有操作 2无操作
    rollingOperation:boolean = false // 为false 操作第一个数   为ture 操作第二个历史记录
    initflag:boolean = false
    first_player:PlayerID

    constructor(context: BattleGameLoop,brach:STRATEGY_BRACH_STATE) {
        super(context);
        print("初始化operate",brach)
        set_current_operate_brach(brach)
        this.register_gamevent()
    }


    /**是否两个回合都无操作 */
    is2RoundNullOparetor(){
        let bool = true
        this.historyRecord.forEach(card=>{
            if(card == 1){
                bool = false
            }
        })
        return bool
    }


    set Set_cuurent_option_player(playerID:string){
        CustomNetTables.SetTableValue("GameMianLoop","current_operate_playerid",{cuurent:playerID})
        if(playerID == GameRules.Red.GetPlayerID().toString()){
            const BlueOperator = IsblueOperater()
            !this.rollingOperation ? (this.historyRecord[0] = BlueOperator ? 1 : 2) : (this.historyRecord[1] = BlueOperator ? 1 : 2)
            this.rollingOperation = !this.rollingOperation
        }else{
            const RedOperator = IsRedOperater()
            !this.rollingOperation ? (this.historyRecord[0] = RedOperator ? 1 : 2) : (this.historyRecord[1] = RedOperator ? 1 : 2)
            this.rollingOperation = !this.rollingOperation
        }
    }

    get Get_current_option_playuer(){
        const str =  CustomNetTables.GetTableValue("GameMianLoop","current_operate_playerid").cuurent ?? "" 
        return str
    }

    register_gamevent(){
        CustomGameEventManager.RegisterListener("C2S_CLICK_SKIP",(_,event)=>{
            if(this.Get_current_option_playuer == event.PlayerID.toString()){
                if(CustomNetTables.GetTableValue("GameMianLoop","smallCycle").current != 游戏循环.出牌阶段.toString()){
                    return
                }
                SetGameLoopMasK(event.PlayerID == GameRules.Red.GetPlayerID() ? optionMask.红队点击跳过 : optionMask.蓝队点击跳过)
                GameRules.lastTruntable.Add(event.PlayerID,false)
            }
        })
        CustomGameEventManager.RegisterListener("C2S_RED_SEND_SKIP",(_,event)=>{
            if(this.Get_current_option_playuer == event.player.toString()){
                if(CustomNetTables.GetTableValue("GameMianLoop","smallCycle").current != 游戏循环.出牌阶段.toString()){
                    return
                }
                SetGameLoopMasK(event.player == GameRules.Red.GetPlayerID() ? optionMask.红队点击跳过 : optionMask.蓝队点击跳过)
                GameRules.lastTruntable.Add(event.PlayerID,false)
            }
        })
        CustomGameEventManager.RegisterListener("C2S_RED_SEND_PlayCard",(_,event)=>{
            SetGameLoopMasK(optionMask.红队有操作)
        })
    }

    create_solider(){
        const red = GameRules.Red.GetPlayerID()
        const blue = GameRules.Blue.GetPlayerID()
        const redScnese = brachFilfer(get_current_operate_brach(),red).SceneName
        const blueScnese = brachFilfer(get_current_operate_brach(),blue).SceneName
        GameRules.brash_solidier.AutoSolider(red,redScnese);
        GameRules.brash_solidier.AutoSolider(blue,blueScnese);
    }

    entry() {
        super.entry();
        if (!this.host.init) {
            IsInToolsMode() && add_cuurent_glod(100,GameRules.Red.GetPlayerID())
            IsInToolsMode() && add_cuurent_glod(100,GameRules.Blue.GetPlayerID())
            ScenesBuildbehavior.ScenesBuild()
            ScenesBuildbehavior.HeapsBuild(GameRules.Red.GetPlayerID())
            ScenesBuildbehavior.HeapsBuild(GameRules.Blue.GetPlayerID())
            this.init_give_cards();
            GameRules.lastTruntable = new TurntableBase(GameRules.Red.GetPlayerID())
            this.Set_cuurent_option_player = GameRules.lastTruntable.nextRound.toString()
            this.create_solider() //每回合刷小兵
            CustomGameEventManager.Send_ServerToAllClients("S2C_BRUSH_SOLIDER",{})
            this.host.init = true;
            return;
        }
        this.Set_cuurent_option_player = GameRules.lastTruntable.nextRound.toString()
        GameRules.lastTruntable = new TurntableBase(GameRules.lastTruntable.nextRound)
        this.create_solider() //每回合刷小兵
        CustomGameEventManager.Send_ServerToAllClients("S2C_BRUSH_SOLIDER",{})
        const blueScnese = GameRules.SceneManager.fitler(get_current_operate_brach() as BATTLE_BRACH_STATE,GameRules.Blue.GetPlayerID())
        const redScnese = GameRules.SceneManager.fitler(get_current_operate_brach() as BATTLE_BRACH_STATE,GameRules.Red.GetPlayerID())
        const bluecars = blueScnese.getAll() as Unit[]
        const redcars = redScnese.getAll() as Unit[]
        bluecars.forEach(card=>{
           const hooks = card.hook(HOOK.光环)
           hooks.forEach(hook=>{
               hook(card)
           })
        })
        redcars.forEach(card=>{
            const hooks = card.hook(HOOK.光环)
            hooks.forEach(hook=>{
                hook(card)
            })
        })
    }


    init_give_cards() {
       const redScenesHand = GameRules.SceneManager.GetCardheapsScene(GameRules.Red.GetPlayerID()) as Cardheaps
       const BlueScenesHand = GameRules.SceneManager.GetCardheapsScene(GameRules.Blue.GetPlayerID()) as Cardheaps
       const redCard = redScenesHand.takeAhand4Small()
       const blueCard = BlueScenesHand.takeAhand4Small()
          redCard.forEach(card=>{
             GameRules.SceneManager.change_secens(card.UUID,"HAND")
          })
          blueCard.forEach(card=>{
            GameRules.SceneManager.change_secens(card.UUID,"HAND")
         })
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

    ClearRoundData(){
         GameLoopMaskClearBlue()
         GameLoopMaskClearRed()
    }


    run() {
        const oparetor = get_settlement_current()
        print("当前操作状态",get_current_operate_brach())
        if(oparetor == 1 ){
            return 1
        }else{
            super.run()
        }
        if(this.loop_count >= 2 && this.is2RoundNullOparetor() && isBattleSettlement()){
            this.host.ChangeState(new injurySettlementStage(this.host,Battle_Select_Brach()))
            clear_option_mask_state()
            return 1
        }
        if(get_settlement_current() != 1 && this.Get_current_option_playuer == GameRules.Blue.GetPlayerID().toString() && GameLoopMaskSkipBlue()){
            this.Set_cuurent_option_player = GameRules.Red.GetPlayerID().toString()
            set_oparator_false(GameRules.Red.GetPlayerID())
            this.time = 策略时间
            this.loop_count++
            this.ClearRoundData()
            print("跳过回合")
            return 1
        }
        if(get_settlement_current() != 1 && this.Get_current_option_playuer == GameRules.Red.GetPlayerID().toString() && GameLoopMaskSkipRed()){
            this.Set_cuurent_option_player = GameRules.Blue.GetPlayerID().toString()
            set_oparator_false(GameRules.Blue.GetPlayerID())
            this.time = 策略时间
            this.loop_count++
            this.ClearRoundData()
            print("跳过回合")
            return 1
        }
        if(this.time == 1){
            SetGameLoopMasK(this.Get_current_option_playuer == GameRules.Red.GetPlayerID().toString() ? optionMask.红队点击跳过 : optionMask.蓝队点击跳过)
        }
        return 1
    }


    exit(){
        super.exit()
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
        const redrouter = GameRules.SceneManager.fitler(this.settlementRoute,GameRules.Red.GetPlayerID()) as BattleArea
        const bluerouter = GameRules.SceneManager.fitler(this.settlementRoute,GameRules.Blue.GetPlayerID()) as BattleArea
        const redcards = redrouter.getAll() as Unit[]
        const bluecards = bluerouter.getAll() as Unit[]
        redcards.forEach(card=>{
            const callbacks = card.hook(HOOK.回合开始时)
            callbacks.forEach(callback=>{
                 callback(card)
            })
        })
        bluecards.forEach(card=>{
            const callbacks = card.hook(HOOK.回合开始时)
            callbacks.forEach(callback=>{
                 callback(card)
            })
        })
    }

    /**战斗结算算法 */
    settlementModule(){
        const redrouter = GameRules.SceneManager.fitler(this.settlementRoute,GameRules.Red.GetPlayerID()) as BattleArea
        const bluerouter = GameRules.SceneManager.fitler(this.settlementRoute,GameRules.Blue.GetPlayerID()) as BattleArea
            let index = 0
            let defualtindex = 0
            for(let i = 1 ; i < 6 ; i++){
                const redcard = redrouter.IndexGet(i) as Unit
                const bluecard = bluerouter.IndexGet(i) as Unit
                if(!redcard && !bluecard) continue
                const start = redcard ? redcard as Unit : bluecard as Unit
                if( (redcard?.isAttackPreHook() && !redcard.isunableToAttack()) || bluecard?.isAttackPreHook() && !bluecard.isunableToAttack()){
                    index++
                }
                const targetb = start == redcard ? bluecard as Unit: redcard as Unit
                const _damage = new damage(start,start == redcard ? bluecard as Unit: redcard as Unit,targetb ? false : true,(redcard?.isAttackPreHook() || bluecard?.isAttackPreHook()) ? index : defualtindex   )
                _damage.attacklement()
            }
            set_settlement_true()
            //mark1
            Timers.CreateTimer(index + 战斗结算时间,()=>{
                GameRules.SceneManager.Current_Scnese_Card_Center(false)
                set_settlement_false()
            })

    }

    exit(){
        super.exit()
        const redrouter = GameRules.SceneManager.fitler(this.settlementRoute,GameRules.Red.GetPlayerID()) as BattleArea
        const bluerouter = GameRules.SceneManager.fitler(this.settlementRoute,GameRules.Blue.GetPlayerID()) as BattleArea
        const redcards = redrouter.getAll() as Unit[]
        const bluecards = bluerouter.getAll() as Unit[]
        redcards.forEach(card=>{
            const callbacks = card.hook(HOOK.回合结束时)
            callbacks.forEach(callback=>{
                 callback(card)
            })
        })
        bluecards.forEach(card=>{
            const callbacks = card.hook(HOOK.回合结束时)
            callbacks.forEach(callback=>{
                 callback(card)
            })
        })
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
        const red_all_uuid = GameRules.SceneManager.getAll(GameRules.Red.GetPlayerID())
        const blue_all_uuid = GameRules.SceneManager.getAll(GameRules.Blue.GetPlayerID())
        print("断点1 ")
        red_all_uuid.concat(blue_all_uuid).forEach((uuid:string)=>{
            const card = GameRules.SceneManager.UUIDGet(uuid)
            if(card instanceof Unit){
                card.roundCalculation()
            }
        })
        CustomGameEventManager.Send_ServerToAllClients("S2C_OPEN_EQUIP_SHOP",{})
        GameRules.energyBarManager.roundIncreasesTheMaximumEnergy()
        print("进入商店购买阶段")
        add_cuurent_glod(2,GameRules.Red.GetPlayerID())
        add_cuurent_glod(2,GameRules.Blue.GetPlayerID())
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
    lastplayer:PlayerID //下回合先手的id

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
