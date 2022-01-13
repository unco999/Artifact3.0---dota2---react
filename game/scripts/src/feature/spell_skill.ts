import { AbiliyContainer } from "../instance/Ability";
import { Unit } from "../instance/Unit";
import { optionMask } from "../Manager/statusSwitcher";
import { Set_option_mask_state } from "../Manager/nettablefuc";
import { Magic_brach, Magic_range, Magic_team } from "./select_the_prompt";
import { uuid } from "../instance/Card";




export class spell_skill{

    constructor(){
        this.register_gamevent()
    }

    register_gamevent(){
        CustomGameEventManager.RegisterListener("C2S_SPELL_SKILL",(_,event)=>{
            this.call_spell_skill(event.SKILL_ID,event.PlayerID,event.target_uuid)    
        })
    }

    call_spell_skill(id:string,player:PlayerID,target:uuid){
        if(player == GameRules.Blue.GetPlayerID()){
            Set_option_mask_state(optionMask.蓝队有操作)
        }else{
            Set_option_mask_state(optionMask.红队有操作)
        }
        print("服务端执行了释放技能管理器")
        const hero = this.skill_id_find_hero(id,player)
        const type = this.skill_id_find_type(id,player)
        const data = GameRules.select_the_prompt.validRangeLookup(player,type.magic_brach,type.magic_range,type.magic_team,hero.Id)
        const ability = AbiliyContainer.instance.GetAbility(id)
        ability.spell_skill(data.table as (Unit|number)[],target)
    }

    /**通过技能id寻找英雄id */
    skill_id_find_hero(id:string,player:PlayerID){
        return GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID() == player ? player : GameRules.Red.GetPlayerID()).IndexGet(3) as Unit
    }

    /**通过技能id找到技能的类型 */
    skill_id_find_type(id:string,player:PlayerID){
        return {magic_brach:Magic_brach.本路, magic_range: Magic_range.全体, magic_team: Magic_team.敌方, has_hero_ability_id:"1"}
    }

}