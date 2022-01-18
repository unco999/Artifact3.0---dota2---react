import { BATTLE_BRACH_STATE, get_current_battle_brach, get_current_operate_brach, STRATEGY_BRACH_STATE } from "./nettablefuc";

export enum optionMask {
    蓝队有操作 = 4,
    红队有操作 = 8,
    蓝队点击跳过 = 16,
    红队点击跳过 = 32,
    默认状态 = 256
}

export enum operate {
    切换至蓝队,
    切换至红队,
    进入战斗结算,
    红队进入倒计时,
    蓝队进入倒计时,
    无动作,
}

export function GetBattleGameLoopMask() {
    const mask = CustomNetTables.GetTableValue("GameMianLoop", "option_mask_state") ?? { cuurent: optionMask.默认状态 };
    return mask
}

/**是否可以战斗结算 */
export function isBattleSettlement(){
    const mask = CustomNetTables.GetTableValue("GameMianLoop", "option_mask_state") ?? { cuurent: optionMask.默认状态 };
    if(bit.bor(mask.cuurent,optionMask.红队点击跳过,optionMask.蓝队点击跳过) == mask.cuurent ||
        (mask.cuurent | optionMask.红队有操作) != mask.cuurent && (mask.cuurent | optionMask.蓝队有操作) != mask.cuurent
    ){
        return true
    }
    return false
}

/**当前玩家是否可以操作卡片 */
export function isCanOperate(PlayerID:PlayerID){
    const current = GetBattleGameLoopMask().cuurent
    if(PlayerID == GameRules.Red.GetPlayerID()){
        if(bit.bor(current,optionMask.红队有操作) == current){
            return false
        }
    }else{
        if(bit.bor(current,optionMask.蓝队有操作) == current){
            return false
        }
    }
    return true
}

/**状态全清除 */
export function GameLoopMaskclear(){
    CustomNetTables.SetTableValue("GameMianLoop",'option_mask_state',{cuurent:optionMask.默认状态})
}


/**当前蓝色是否有操作 */
export function IsblueOperater(){
    const num = GetBattleGameLoopMask().cuurent
    return (num | optionMask.蓝队有操作) == num 
}

/**当前红色是否有操作 */
export function IsRedOperater(){
    const num = GetBattleGameLoopMask().cuurent
    return (num | optionMask.红队有操作) == num 
}


/**清除蓝色的状态 */
export function GameLoopMaskClearBlue(){
    let cuurent = GetBattleGameLoopMask().cuurent
    cuurent &= ~optionMask.蓝队有操作
    cuurent &= ~optionMask.蓝队点击跳过
    CustomNetTables.SetTableValue('GameMianLoop','option_mask_state',{cuurent:cuurent})
    print("当前清除红色全局状态",cuurent)
}

/**清除红色的状态 */
export function GameLoopMaskClearRed(){
    let cuurent = GetBattleGameLoopMask().cuurent
    cuurent &= ~optionMask.红队有操作
    cuurent &= ~optionMask.红队点击跳过
    CustomNetTables.SetTableValue('GameMianLoop','option_mask_state',{cuurent:cuurent})
    print("当前清除红色全局状态",cuurent)
}

/**清除红色的状态 */
export function GameLoopMaskClearRedSkip(){
    let cuurent = GetBattleGameLoopMask().cuurent
    cuurent &= ~optionMask.红队点击跳过
    CustomNetTables.SetTableValue('GameMianLoop','option_mask_state',{cuurent:cuurent})
    print("当前清除红色全局状态",cuurent)
}

/**清除红色的状态 */
export function GameLoopMaskClearBlueSkip(){
    let cuurent = GetBattleGameLoopMask().cuurent
    cuurent &= ~optionMask.蓝队点击跳过
    CustomNetTables.SetTableValue('GameMianLoop','option_mask_state',{cuurent:cuurent})
    print("当前清除红色全局状态",cuurent)
}

/**蓝色是否可以跳过 */
export function GameLoopMaskSkipBlue(){
    const cuurent = GetBattleGameLoopMask().cuurent
    if( (cuurent | optionMask.蓝队有操作) == cuurent || (cuurent | optionMask.蓝队点击跳过) == cuurent){
        return true
    }
    return false
}


/**红色是否可以跳过 */
export function GameLoopMaskSkipRed(){
    const cuurent = GetBattleGameLoopMask().cuurent
    if( (cuurent | optionMask.红队有操作) == cuurent || (cuurent | optionMask.红队点击跳过) == cuurent){
        return true
    }
    return false
}

export function SetGameLoopMasK(option:optionMask){
    let current = GetBattleGameLoopMask().cuurent
    current |= option
    CustomNetTables.SetTableValue("GameMianLoop","option_mask_state",{cuurent:current})
    print("当前设置后 全局变量为",current)
}


/**
 * 当前战斗路线选择器
 * @returns To state
 */
export function Battle_Select_Brach() {
    const _cuurent_battle_brach = get_current_battle_brach();
    switch (_cuurent_battle_brach) {
        case (BATTLE_BRACH_STATE.不在此状态): {
            return BATTLE_BRACH_STATE.上路
        }
        case (BATTLE_BRACH_STATE.上路): {
            return BATTLE_BRACH_STATE.中路
        }
        case (BATTLE_BRACH_STATE.下路): {
            return BATTLE_BRACH_STATE.不在此状态
        }
        case (BATTLE_BRACH_STATE.中路): {
            return BATTLE_BRACH_STATE.下路
        }
    }
}

/**
 * 当前策略路线选择器
 * @returns To state
 */
 export function strategy_Select_Brach() {
    const _cuurent_battle_brach = get_current_operate_brach();
    switch (_cuurent_battle_brach) {
        case (STRATEGY_BRACH_STATE.不在此状态): {
            return STRATEGY_BRACH_STATE.上路
        }
        case (STRATEGY_BRACH_STATE.上路): {
            return STRATEGY_BRACH_STATE.中路
        }
        case (STRATEGY_BRACH_STATE.下路): {
            return STRATEGY_BRACH_STATE.不在此状态
        }
        case (STRATEGY_BRACH_STATE.中路): {
            return STRATEGY_BRACH_STATE.下路
        }
    }
}