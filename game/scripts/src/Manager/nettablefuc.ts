import { 游戏循环 } from "./BattleGameLoop";
import { optionMask, strategy_Select_Brach } from "./statusSwitcher";

/**设置掩码 并保存至nettable */
export function Set_option_mask_state(optionMask:optionMask,operate:"add"|"remove" = "add"){
    const mask = CustomNetTables.GetTableValue("GameMianLoop","option_mask_state") ?? {cuurent:128}
    let newMask;
    switch(operate){
        case "add":{
            newMask = mask.cuurent | optionMask
        }
        case "remove":{
            newMask = mask.cuurent ^ optionMask
        }
    }
    CustomNetTables.SetTableValue("GameMianLoop","option_mask_state",{cuurent:newMask})
}

export function clear_option_mask_state(){
    CustomNetTables.SetTableValue("GameMianLoop","option_mask_state",{cuurent:128})
}

export enum BATTLE_BRACH_STATE{
    上路 = "1",
    中路 = "2",
    下路 = "3",
    不在此状态 = "4",
}

export function get_current_battle_brach(){
    const brach = CustomNetTables.GetTableValue("GameMianLoop",'current_battle_brach') ?? {cuurent:BATTLE_BRACH_STATE.不在此状态}
    return brach.cuurent
}

export function set_current_battle_brach(BATTLE_BRACH_STATE:BATTLE_BRACH_STATE){
    CustomNetTables.SetTableValue("GameMianLoop","current_battle_brach",{cuurent:BATTLE_BRACH_STATE})
}

export function add_cuurent_glod(count:number,playerid:PlayerID){
    const key = playerid == GameRules.Red.GetPlayerID() ? "red_gold" : "blue_gold"
    let origin = CustomNetTables.GetTableValue("GameMianLoop",key)?.cuurent ?? 0
    CustomNetTables.SetTableValue("GameMianLoop",key,{cuurent:origin += count})
}

export function get_cuurent_glod(count:number,playerid:PlayerID){
    const key = playerid == GameRules.Red.GetPlayerID() ? "red_gold" : "blue_gold"
    return CustomNetTables.GetTableValue("GameMianLoop",key).cuurent
}

export enum STRATEGY_BRACH_STATE{
    上路 = "1",
    中路 = "2",
    下路 = "3",
    不在此状态 = "4",
}

/**设置全局策略路线 nettable */
export function set_current_operate_brach(STRATEGY_BRACH_STATE:STRATEGY_BRACH_STATE){
    print("当前的场景序列为=========================>",STRATEGY_BRACH_STATE)
    CustomNetTables.SetTableValue("GameMianLoop",'current_operate_brach',{cuurent:STRATEGY_BRACH_STATE}) 
}

export function toggle_effect_view_stage(){
    const bool = CustomNetTables.GetTableValue("GameMianLoop","effect_view_stage") ?? {cuurent:0}
    CustomNetTables.SetTableValue("GameMianLoop","effect_view_stage",bool.cuurent ? {cuurent:0} : {cuurent:1})
}

/**获取全局策略路线 nettable */
export function get_current_operate_brach(){
    const nettable = CustomNetTables.GetTableValue("GameMianLoop","current_operate_brach") ?? {cuurent:STRATEGY_BRACH_STATE.不在此状态}
    return nettable.cuurent
}

/**单个循环结束时进行清理的函数 */
export function loop_end_clear(){
    set_current_battle_brach(BATTLE_BRACH_STATE.不在此状态)
    set_current_operate_brach(STRATEGY_BRACH_STATE.不在此状态)
}

/** 设置当前回合剩余时间与状态显示 */
export function set_loop_time(time:string){
    CustomNetTables.SetTableValue("GameMianLoop","RemainingTime",{cuurent:time})
}
