import { AbiliyContainer } from "../instance/Ability";
import { BattleArea } from "../instance/Scenes";
import { Unit } from "../instance/Unit";
import { get_current_battle_brach, get_current_operate_brach } from "../Manager/nettablefuc";

export enum select_type{
    单个选择,
    群体,
}

export enum Magic_brach{
    "本路",
    "跨线",
    "对格"
}

export enum Magic_range{
    "单体",
    "近邻",
    "全体"
}

export enum Magic_team{
    "友方",
    "敌方",
    "双方"
}

export class select_the_prompt{

    constructor(){
        this.register_gameevent()
    }

    /**分路限制器 不在当前战斗回合的分路显示提示框 */
    splitLimiter(hashero:string,playerid:PlayerID){
        const hero = GameRules.SceneManager.get_hero(hashero)
        if(!hero){
            CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(playerid),"S2C_INFORMATION",{information:"该英雄目前不在战斗区域!"})
            return false
        }
        const CardScenes = GameRules.SceneManager.GetScenes(GameRules.SceneManager.get_hero(hashero).Scene.SceneName,hero.PlayerID)
        const brach = get_current_operate_brach()
        print("当前场景为",brach)
        if(CardScenes.SceneName == "GOUP" && brach == "1"){
            return true
        }
        if(CardScenes.SceneName == "MIDWAY" && brach == "2"){
            return true
        }
        if(CardScenes.SceneName == "LAIDDOWN" && brach == "3"){
            return true
        }
        CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(hero.PlayerID),"S2C_INFORMATION",{information:`技能卡牌在场景${brach}上没有找到可使用的英雄!`})
        return false
    }
    
    register_gameevent(){
        //分路提示器
        CustomGameEventManager.RegisterListener("C2S_SEATCH_TARGET_OPEN",(_,event)=>{
           const abilityinstance = AbiliyContainer.instance.GetAbility(event.abilityname)
           print("找到的魔法实例",abilityinstance,"他的魔法卡名称为",abilityinstance.id)
           if(!this.splitLimiter(abilityinstance.heroid,event.PlayerID)) return;
           const find_data = this.validRangeLookup(event.PlayerID,abilityinstance.Magic_brach,abilityinstance.Magic_range,abilityinstance.Magic_team,abilityinstance.heroid)
           if(!find_data) return
           CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(find_data._self.PlayerID),"S2C_SKILL_READY",{uuid:find_data._self.UUID})
           find_data.table.forEach(unit=>{
                if(unit instanceof Unit){
                    CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(find_data._self.PlayerID),"S2C_SEATCH_TARGET_OPEN",{uuid:unit.UUID})
                }
           })
        })
        CustomGameEventManager.RegisterListener("C2S_SEATCH_TARGET_OFF",(_,event)=>{
            const abilityinstance = AbiliyContainer.instance.GetAbility(event.abilityname)
            const find_data = this.validRangeLookup(event.PlayerID,abilityinstance.Magic_brach,abilityinstance.Magic_range,abilityinstance.Magic_team,abilityinstance.heroid)
            if(!find_data) return;
            CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(find_data._self.PlayerID),"S2C_SKILL_OFF",{uuid:find_data._self.UUID})
            find_data.table.forEach(unit=>{
                 if(unit instanceof Unit){
                     CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(find_data._self.PlayerID),"S2C_SEATCH_TARGET_OFF",{uuid:unit.UUID})
                 }
            })
        })
    }

    /**有效范围查找器 */
    validRangeLookup(PlayerID:PlayerID,magic_brach:Magic_brach,magic_range:Magic_range,magic_team:Magic_team,has_hero_ability_id:string){
        let hero = GameRules.SceneManager.get_hero(has_hero_ability_id) as Unit
        /**测试 始终以中间单位为主 */
        // hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID() == PlayerID ? PlayerID : GameRules.Red.GetPlayerID()).IndexGet(3) as Unit
        /**结束后删除 */
        if(hero == undefined) return;
        if(!(hero.Scene instanceof BattleArea)) return;
        print("成功开始搜索目标")
        if(magic_brach == Magic_brach.对格){
            const gather = GameRules.SceneManager.gather(hero) as Unit
            return {_self:hero,table:[gather],type:select_type.单个选择}
        }
        //本路友方单体
        if(magic_brach == Magic_brach.本路 && magic_range == Magic_range.全体 && magic_team == Magic_team.友方){
            return {_self:hero,table:[...GameRules.SceneManager.friendbrach(hero)],type:select_type.单个选择}
        }
        //本路敌方单体
        if(magic_brach == Magic_brach.本路 && magic_range == Magic_range.单体 && magic_team == Magic_team.敌方){
            return {_self:hero,table:[...GameRules.SceneManager.enemybrach(hero)],type:select_type.单个选择}
        }
        //本路单体双方
        if(magic_brach == Magic_brach.本路 && magic_range == Magic_range.单体 && magic_team == Magic_team.双方){
            return {_self:hero,table:[...GameRules.SceneManager.enemybrach(hero).concat(...GameRules.SceneManager.friendbrach(hero))],type:select_type.单个选择}
        }
        //本路近邻友方
        if(magic_brach == Magic_brach.本路 && magic_range == Magic_range.近邻 && magic_team == Magic_team.友方){
            const data = GameRules.SceneManager.friendlyNeighbor(hero)
            return {_self:hero,table:[data.left,data.right],type:select_type.群体}
        }
        //本路近邻敌方
        if(magic_brach == Magic_brach.本路 && magic_range == Magic_range.近邻 && magic_team == Magic_team.敌方){
            const data = GameRules.SceneManager.enemyneighbor(hero)
            return {_self:hero,table:[data.center,data.left,data.right],type:select_type.群体}
        }
        //本路全体友方
        if(magic_range == Magic_range.全体 && magic_team == Magic_team.友方){
            return {_self:hero,table:[...GameRules.SceneManager.friendbrach(hero)],type:select_type.群体}
        }
        //本路全体敌方
        if(magic_range == Magic_range.全体 && magic_team == Magic_team.敌方){
            return {_self:hero,table:[...GameRules.SceneManager.enemybrach(hero)],type:select_type.群体}
        }
        //跨线友方单体
        if(magic_brach == Magic_brach.跨线 && magic_team == Magic_team.友方 && magic_range == Magic_range.单体){
            return {_self:hero,table:[...GameRules.SceneManager.friendbrach(hero)],type:select_type.单个选择}
        }
        //跨线敌方单体
        if(magic_brach == Magic_brach.跨线 && magic_team == Magic_team.敌方 && magic_range == Magic_range.单体){
            return {_self:hero,table:[...GameRules.SceneManager.enemyfindAll(hero)],type:select_type.单个选择}
        }
        //跨线友方群体 -- 单挑路线群体
        if(magic_brach == Magic_brach.跨线 && magic_team == Magic_team.友方 && magic_range == Magic_range.全体){
            return {_self:hero,table:[...GameRules.SceneManager.enemyfindAll(hero)],type:select_type.群体}
        }
        //跨线敌方群体 -- 单条路线群体
        if(magic_brach == Magic_brach.跨线 && magic_team == Magic_team.敌方 && magic_range == Magic_range.全体){
            return {_self:hero,table:[...GameRules.SceneManager.friendfindAll(hero)],type:select_type.群体}
        }
    }
}