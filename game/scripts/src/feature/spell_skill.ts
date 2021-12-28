import { AbiliyContainer } from "../instance/Ability";
import { Unit } from "../instance/Unit";
import { Magic_brach, Magic_range, Magic_team } from "./select_the_prompt";




export class spell_skill{

    constructor(){
        this.register_gamevent()
    }

    register_gamevent(){
        CustomGameEventManager.RegisterListener("C2S_SPELL_SKILL",(_,event)=>{
            this.call_spell_skill("1",event.PlayerID)    
        })
    }

    call_spell_skill(id:string,player:PlayerID){
        if(player == GameRules.Blue.GetPlayerID()){
            CustomNetTables.SetTableValue("GameMianLoop",'thisRoundOfBluefield',{"option":1,skip:0})
            print("设置了蓝色的属性")
        }else{
            CustomNetTables.SetTableValue("GameMianLoop","thisRoundOfRedfield",{"option":1,skip:0})
            print("设置了红色的属性")
        }
        print("服务端执行了释放技能管理器")
        const hero = this.skill_id_find_hero(id,player)
        const type = this.skill_id_find_type(id,player)
        const data = GameRules.select_the_prompt.validRangeLookup(player,type.magic_brach,type.magic_range,type.magic_team,hero.Id)
        const ability = AbiliyContainer.instance.GetAbility(id)
        ability.spell_skill(data.table as (Unit|number)[])
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