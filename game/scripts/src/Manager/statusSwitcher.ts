import { BATTLE_BRACH_STATE, get_current_battle_brach, get_current_operate_brach, STRATEGY_BRACH_STATE } from "./nettablefuc";

export enum optionMask {
    蓝队有操作 = 0x000001,
    红队有操作 = 0x000002,
    蓝队点击跳过 = 0x000004,
    红队点击跳过 = 0x000008,
}

export enum operate {
    切换至蓝队,
    切换至红队,
    进入战斗结算,
    红队进入倒计时,
    蓝队进入倒计时,
    无动作,
}

export function statusSwitcher(friststate:boolean): operate {
    const mask = CustomNetTables.GetTableValue("GameMianLoop", "option_mask_state") ?? { cuurent: 128 };
    print("当前掩码状况", mask.cuurent);
    print("当前frist_bool",friststate)
    if ( !friststate && (mask.cuurent == 136 || mask.cuurent == 132) ) {
        print("进入战斗结算")
        return operate.进入战斗结算;
    }
    if ((mask.cuurent | optionMask.红队点击跳过) == mask.cuurent) {
        print("切换至蓝队")
        return operate.切换至蓝队;
    }
    if ((mask.cuurent | optionMask.蓝队点击跳过) == mask.cuurent) {
        print("切换至红队")
        return operate.切换至红队;
    }
    if (mask.cuurent == (128 | optionMask.红队有操作)) {
        print("红队进入倒计时")
        return operate.红队进入倒计时;
    }
    if (mask.cuurent == (128 | optionMask.蓝队有操作)) {
        print("蓝队进入倒计时")
        return operate.蓝队进入倒计时;
    }
    print("无动作")
    return operate.无动作;
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