import { ability_templater, AbiliyContainer } from "../instance/Ability";
import { Unit } from "../instance/Unit";
import { get_settlement_current, isCanOperate, optionMask, SetGameLoopMasK, set_oparator_true, set_settlement_true } from "../Manager/statusSwitcher";
import { get_current_battle_brach, get_current_operate_brach, Get_current_option_playuer, Set_option_mask_state } from "../Manager/nettablefuc";
import { Card, uuid } from "../instance/Card";
import { Timers } from "../lib/timers";
import { BattleArea } from "../instance/Scenes";




export class spell_skill{

    constructor(){
        this.register_gamevent()
    }

    register_gamevent(){
        CustomGameEventManager.RegisterListener("C2S_SPACE_CALL_SPELL",(_,event)=>{
            if(!isCanOperate(event.PlayerID) || get_settlement_current() == 1 || Get_current_option_playuer() != event.PlayerID.toString()) return;
            const abilityInstance = AbiliyContainer.instance.GetAbility(event.SKILL_ID)
            print(event.PlayerID.toString() == GameRules.Red.GetPlayerID().toString() ? "当前红色玩家释放了魔法" : "当前蓝色玩家释放了魔法")
            if(abilityInstance.consumption > GameRules.energyBarManager.getPlayerBrachEnrgBar(get_current_operate_brach(),event.PlayerID)){
                CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(event.PlayerID),"S2C_INFORMATION",{information:`当前卡牌消耗需要${abilityInstance.consumption},${"barch" + get_current_operate_brach()}的水晶不够!`})
                print("当前能量水晶不足")
                return;
            }
            print("当前拖入的空格是",event.target_index)
            this.call_spell_skill(event.SKILL_ID,event.PlayerID,null,event.spell_ability_card_uuid,Number(event.scnese),Number(event.target_index))
            CustomGameEventManager.Send_ServerToAllClients("S2C_OFF_ALL_SPACE",{})   
            set_oparator_true(event.PlayerID)
            set_settlement_true()
        })
        CustomGameEventManager.RegisterListener("C2S_SPELL_SKILL",(_,event)=>{
            if(!isCanOperate(event.PlayerID) || get_settlement_current() == 1 || Get_current_option_playuer() != event.PlayerID.toString()) return;
            const abilityInstance = AbiliyContainer.instance.GetAbility(event.SKILL_ID)
            print(event.PlayerID.toString() == GameRules.Red.GetPlayerID().toString() ? "当前红色玩家释放了魔法" : "当前蓝色玩家释放了魔法")
            if(abilityInstance.consumption > GameRules.energyBarManager.getPlayerBrachEnrgBar(get_current_operate_brach(),event.PlayerID)){
                CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(event.PlayerID),"S2C_INFORMATION",{information:`当前卡牌消耗需要${abilityInstance.consumption},${"barch" + get_current_operate_brach()}的水晶不够!`})
                print("当前能量水晶不足")
                return;
            }
            const _target = GameRules.SceneManager.get_card(event.target_uuid)
            const gather = GameRules.SceneManager.gather(_target)
            if(abilityInstance.wounded){
                if(!(_target as Unit).isinjuried()){
                    CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(event.PlayerID),"S2C_INFORMATION",{"information":"该单位没有受伤"})
                    return
                }
            }
            if(abilityInstance.follow){
                if((_target.Scene.find_oppose() as BattleArea).isFull()) {
                    CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(event.PlayerID),"S2C_INFORMATION",{"information":"该路线没有空位了"})
                    return
                }
            }
            this.call_spell_skill(event.SKILL_ID,event.PlayerID,event.target_uuid,event.spell_ability_card_uuid)
            CustomGameEventManager.Send_ServerToAllClients("S2C_OFF_ALL_SPACE",{})   
            set_oparator_true(event.PlayerID)
            set_settlement_true()
        })
        CustomGameEventManager.RegisterListener("C2S_SPELL_TOWER",(_,event)=>{
            if(!isCanOperate(event.PlayerID) || get_settlement_current() == 1 || Get_current_option_playuer() != event.PlayerID.toString()) return;
            print(event.PlayerID.toString() == GameRules.Red.GetPlayerID().toString() ? "当前红色玩家释放了魔法" : "当前蓝色玩家释放了魔法")
            const abilityInstance = AbiliyContainer.instance.GetAbility(event.abilityname)
            if(abilityInstance.consumption > GameRules.energyBarManager.getPlayerBrachEnrgBar(get_current_operate_brach(),event.PlayerID)){
                print("当前能量水晶不足")
                CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(event.PlayerID),"S2C_INFORMATION",{information:`当前卡牌消耗需要${abilityInstance.consumption},${"barch" + get_current_operate_brach()}的水晶不够!`})
                return;
            }
            const spell_ability_card_uuid = event.uuid
            GameRules.SceneManager.change_secens(spell_ability_card_uuid,"ABILITY",+get_current_operate_brach())
            Timers.CreateTimer(3,()=>{
                const hero = GameRules.SceneManager.get_hero(abilityInstance.heroid) as Unit
                const tower = GameRules.TowerGeneralControl.getCardScenceTower(PlayerResource.GetPlayer(event.PlayerID),hero)
                GameRules.SceneManager.change_secens(spell_ability_card_uuid,"REMOVE",+get_current_operate_brach())
                const data = GameRules.select_the_prompt.validRangeLookup(hero.PlayerID,abilityInstance.Magic_brach,abilityInstance.Magic_range,abilityInstance.Magic_team,abilityInstance.Magic_attack_tart_type,abilityInstance.heroid)
                abilityInstance.spell_tower(data.table,undefined,hero,tower)
            })
            set_oparator_true(event.PlayerID)
            SetGameLoopMasK(event.PlayerID == GameRules.Red.GetPlayerID() ? optionMask.红队有操作 : optionMask.蓝队有操作)
            set_settlement_true()
        })
    }

    call_spell_skill(id:string,player:PlayerID,target:uuid,spell_ability_card_uuid:uuid,scnese?:number,target_index?:number){
        const abilityInstance = AbiliyContainer.instance.GetAbility(id)
        GameRules.energyBarManager.GetBrachEnrgyBar(get_current_operate_brach(),player).add_cuurent_energy(-abilityInstance.consumption)
        if(GameRules.select_the_prompt.splitLimiter(abilityInstance.heroid,player)){
            SetGameLoopMasK(player.toString() == GameRules.Red.GetPlayerID().toString() ? optionMask.红队有操作 : optionMask.蓝队有操作)
            GameRules.SceneManager.change_secens(spell_ability_card_uuid,"ABILITY",+get_current_operate_brach())
            Timers.CreateTimer(3,()=>{
                GameRules.SceneManager.change_secens(spell_ability_card_uuid,"REMOVE",+get_current_operate_brach())
                const hero = GameRules.SceneManager.get_hero(abilityInstance.heroid) as Unit
                const data = GameRules.select_the_prompt.validRangeLookup(player,abilityInstance.Magic_brach,abilityInstance.Magic_range,abilityInstance.Magic_team,abilityInstance.Magic_attack_tart_type,abilityInstance.heroid)
                const ability = AbiliyContainer.instance.GetAbility(id)
                ability.spell_skill(data.table as (Unit|number)[],target,hero,scnese,target_index)
            })
        }else{
            print("非法操作")
        }
    }


}