import { ability_templater, AbiliyContainer } from "../instance/Ability";
import { Unit } from "../instance/Unit";
import { optionMask } from "../Manager/statusSwitcher";
import { get_current_operate_brach, Set_option_mask_state, toggle_effect_view_stage } from "../Manager/nettablefuc";
import { Card, uuid } from "../instance/Card";
import { Timers } from "../lib/timers";




export class spell_skill{

    constructor(){
        this.register_gamevent()
    }

    register_gamevent(){
        CustomGameEventManager.RegisterListener("C2S_SPELL_SKILL",(_,event)=>{
            this.call_spell_skill(event.SKILL_ID,event.PlayerID,event.target_uuid,event.spell_ability_card_uuid)
            CustomGameEventManager.Send_ServerToAllClients("S2C_OFF_ALL_SPACE",{})   
            print("释放了技能")
        })
        CustomGameEventManager.RegisterListener("C2S_SPELL_TOWER",(_,event)=>{
            const abilityInstance = AbiliyContainer.instance.GetAbility(event.abilityname)
            const spell_ability_card_uuid = event.uuid
            GameRules.SceneManager.change_secens(spell_ability_card_uuid,"ABILITY",+get_current_operate_brach())
            toggle_effect_view_stage()
            Timers.CreateTimer(3,()=>{
                const hero = GameRules.SceneManager.get_hero(abilityInstance.heroid) as Unit
                const tower = GameRules.TowerGeneralControl.getCardScenceTower(PlayerResource.GetPlayer(event.PlayerID),hero)
                GameRules.SceneManager.change_secens(spell_ability_card_uuid,"REMOVE",+get_current_operate_brach())
                const data = GameRules.select_the_prompt.validRangeLookup(hero.PlayerID,abilityInstance.Magic_brach,abilityInstance.Magic_range,abilityInstance.Magic_team,abilityInstance.heroid)
                abilityInstance.spell_tower(data.table,undefined,hero,tower)
                toggle_effect_view_stage()
            })

        })
    }

    call_spell_skill(id:string,player:PlayerID,target:uuid,spell_ability_card_uuid:uuid){
        if(player == GameRules.Blue.GetPlayerID()){
            Set_option_mask_state(optionMask.蓝队有操作)
        }else{
            Set_option_mask_state(optionMask.红队有操作)
        }
        print("服务端执行了释放技能管理器")
        const abilityInstance = AbiliyContainer.instance.GetAbility(id)
        if(abilityInstance.wounded){
            const _target = GameRules.SceneManager.get_card(target)
            if(!(_target as Unit).isinjuried()){
                CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(player),"S2C_INFORMATION",{"information":"该单位没有受伤 无法惩戒"})
                return
            }
        }
        if(GameRules.select_the_prompt.splitLimiter(abilityInstance.heroid,player)){
            GameRules.SceneManager.change_secens(spell_ability_card_uuid,"ABILITY",+get_current_operate_brach())
            toggle_effect_view_stage()
            Timers.CreateTimer(3,()=>{
                GameRules.SceneManager.change_secens(spell_ability_card_uuid,"REMOVE",+get_current_operate_brach())
                const hero = GameRules.SceneManager.get_hero(abilityInstance.heroid) as Unit
                const data = GameRules.select_the_prompt.validRangeLookup(player,abilityInstance.Magic_brach,abilityInstance.Magic_range,abilityInstance.Magic_team,abilityInstance.heroid)
                const ability = AbiliyContainer.instance.GetAbility(id)
                ability.spell_skill(data.table as (Unit|number)[],target,hero)
                toggle_effect_view_stage()
            })
        }else{
            print("非法操作")
        }
    }


}