import { AbiliyContainer, select_type, TrickSkill_shouhutianshi } from "../instance/Ability";
import { Card } from "../instance/Card";
import { Hero } from "../instance/Hero";
import { BattleArea } from "../instance/Scenes";
import { Tower } from "../instance/Tower";
import { Unit } from "../instance/Unit";
import { Timers } from "../lib/timers";
import { get_current_battle_brach, get_current_operate_brach } from "../Manager/nettablefuc";


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
    "双方",
    "自己"
}

export class select_the_prompt{

    constructor(){
        this.register_gameevent()
        print("select_the_prompt创建成功")
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
           const hero = GameRules.SceneManager.get_hero(abilityinstance.heroid) as Hero
           let find_data = this.ability_select_show(event.abilityname,hero)
           if(abilityinstance.wounded){
               find_data.table = find_data.table.filter(card=>{
                    if(typeof(card) != "number"){
                        if((card as Unit).max_heal !=  (card as Unit).GETheal){
                            return true
                        }
                    }
                })
           }
           if(abilityinstance.displacement != -1){
               const hero = GameRules.SceneManager.get_hero(abilityinstance.heroid)
               const scene = hero.Scene as BattleArea
               let _list = []
               const _table = {}
               switch(abilityinstance.displacement){
                   case 1:{
                        _list = scene.GetAllSpace()
                        _table[scene.GetSceneIndex()] = _list
                        break
                   }
                   case 2:{
                        const midway = (GameRules.SceneManager.GetMidwayScene(event.PlayerID) as BattleArea).GetAllSpace()
                        const goup = (GameRules.SceneManager.GetGoUpScene(event.PlayerID) as BattleArea).GetAllSpace()
                        const laiddown = (GameRules.SceneManager.GetLaidDownScene(event.PlayerID) as BattleArea).GetAllSpace()
                        _table[0] = goup;
                        _table[1] = midway;
                        _table[2] = laiddown;
                        break
                   }
               }
               CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(hero.PlayerID),"S2C_SEND_CANSPACE",_table)
           }
           if(abilityinstance.istypeTower != -1){
               if(abilityinstance.istypeTower == 1){
                   const tower = GameRules.TowerGeneralControl.getCardScenceTower(PlayerResource.GetPlayer(hero.PlayerID),hero)
                   tower.high(hero.PlayerID)
               }
               if(abilityinstance.istypeTower == 2){
                const tower1 = GameRules.TowerGeneralControl.getCardScenceTower(PlayerResource.GetPlayer(hero.PlayerID),hero)
                const tower2 = GameRules.TowerGeneralControl.getCardScenceTower(PlayerResource.GetPlayer(hero.PlayerID),hero)
                const tower3 = GameRules.TowerGeneralControl.getCardScenceTower(PlayerResource.GetPlayer(hero.PlayerID),hero)
                tower1.high(hero.PlayerID)
                tower2.high(hero.PlayerID)
                tower3.high(hero.PlayerID)
             }
           }
           if(!find_data || !find_data.table) return
           find_data.table.forEach(unit=>{
                if(typeof(unit) != 'number'){
                    CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(find_data._self.PlayerID),"S2C_SEATCH_TARGET_OPEN",{uuid:unit.UUID,type:find_data.type.toString()})
                }
           })
           CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(find_data._self.PlayerID),"S2C_SKILL_READY",{uuid:find_data._self.UUID})
        })
        CustomGameEventManager.RegisterListener("C2S_SEATCH_TARGET_OFF",(_,event)=>{
            print("收到了关闭通知",event.abilityname)
            const abilityinstance = AbiliyContainer.instance.GetAbility(event.abilityname)
            const hero = GameRules.SceneManager.get_hero(abilityinstance.heroid) as Hero
            GameRules.TowerGeneralControl.foeatch((tower:Tower)=>{
                tower.off_high(hero.PlayerID)
            })
            const find_data = this.ability_select_show(event.abilityname,hero)
            if(!find_data) return;
            CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(find_data._self.PlayerID),"S2C_SKILL_OFF",{uuid:find_data._self.UUID})
            find_data.table.forEach(unit=>{
                if(typeof(unit) != 'number'){
                     print("需要关闭特效的面板id",unit.UUID)
                     CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(find_data._self.PlayerID),"S2C_SEATCH_TARGET_OFF",{uuid:unit.UUID})
                 }
            })
        })
        CustomGameEventManager.RegisterListener("C2S_REP_SKILL",(_,event)=>{
            print("收到了拖入时间")
            DeepPrintTable(event)
            const abilityinstance = AbiliyContainer.instance.GetAbility(event.abilityname)
            const hero = GameRules.SceneManager.get_hero(abilityinstance.heroid)
            const brachkey = event.to
            let index = event.index
            let scnese:BattleArea
            print("当前传入的index",index)
            switch(brachkey){
                case "0":{
                    scnese = GameRules.SceneManager.GetGoUpScene(event.PlayerID) as BattleArea
                    break
                }
                case "1":{
                    scnese = GameRules.SceneManager.GetMidwayScene(event.PlayerID) as BattleArea
                    break
                }
                case "2":{
                    scnese = GameRules.SceneManager.GetLaidDownScene(event.PlayerID) as BattleArea
                    break
                }
            }
            GameRules.SceneManager.change_secens(event.uuid,"ABILITY",+get_current_operate_brach())
            Timers.CreateTimer(2,()=>{
                GameRules.SceneManager.change_secens(hero.UUID,scnese.SceneName,+index)
                const find_data = this.validRangeLookup(hero.PlayerID,abilityinstance.Magic_brach,
                    abilityinstance.Magic_range,
                    abilityinstance.Magic_team,
                    hero.Id
                    )
                abilityinstance.post_move_spell_skill(find_data?.table as (Unit|number)[] ?? [],undefined,hero as Unit)
                GameRules.SceneManager.change_secens(event.uuid,"REMOVE",+get_current_operate_brach())
            })
        })
    }//
    
    /**技能提示索引 */
    ability_select_show(abilityName:string,hero:Hero):{_self:Hero,table:(Card|number)[],type:select_type}{
        const ability_select_type = AbiliyContainer.instance.GetAbility(abilityName)
        const _select_type = ability_select_type.ability_select_type
        switch(_select_type){
            case select_type.任意单体:{
                const mygoup = GameRules.SceneManager.GetGoUpScene(hero.PlayerID)
                const mymidway = GameRules.SceneManager.GetMidwayScene(hero.PlayerID)
                const mylaiddon = GameRules.SceneManager.GetLaidDownScene(hero.PlayerID)
                const yougoup = GameRules.SceneManager.GetGoUpScene(hero.PlayerID == GameRules.Red.GetPlayerID() ? GameRules.Blue.GetPlayerID() : hero.PlayerID)
                const youmidway = GameRules.SceneManager.GetMidwayScene(hero.PlayerID == GameRules.Red.GetPlayerID() ? GameRules.Blue.GetPlayerID() : hero.PlayerID)
                const youlaiddon = GameRules.SceneManager.GetLaidDownScene(hero.PlayerID == GameRules.Red.GetPlayerID() ? GameRules.Blue.GetPlayerID() : hero.PlayerID)
                return {_self:hero,table:[
                    ...mygoup.getAll(),
                    ...mymidway.getAll() as Unit[],
                    ...mylaiddon.getAll() as Unit[],
                    ...yougoup.getAll() as Unit[],
                    ...youmidway.getAll() as Unit[],
                    ...youlaiddon.getAll() as Unit[],
                ],type:select_type.任意单体} 
            }
            case select_type.全体:{
                const mygoup = GameRules.SceneManager.GetGoUpScene(hero.PlayerID)
                const mymidway = GameRules.SceneManager.GetMidwayScene(hero.PlayerID)
                const mylaiddon = GameRules.SceneManager.GetLaidDownScene(hero.PlayerID)
                const yougoup = GameRules.SceneManager.GetGoUpScene(hero.PlayerID == GameRules.Red.GetPlayerID() ? GameRules.Blue.GetPlayerID() : hero.PlayerID)
                const youmidway = GameRules.SceneManager.GetMidwayScene(hero.PlayerID == GameRules.Red.GetPlayerID() ? GameRules.Blue.GetPlayerID() : hero.PlayerID)
                const youlaiddon = GameRules.SceneManager.GetLaidDownScene(hero.PlayerID == GameRules.Red.GetPlayerID() ? GameRules.Blue.GetPlayerID() : hero.PlayerID)
                return {_self:hero,table:[
                    ...mygoup.getAll() as Unit[],
                    ...mymidway.getAll() as Unit[],
                    ...mylaiddon.getAll() as Unit[],
                    ...yougoup.getAll() as Unit[],
                    ...youmidway.getAll() as Unit[],
                    ...youlaiddon.getAll() as Unit[],
                    ,
                ],type:select_type.全体} 
            }

            case select_type.友方本路:{
                return {_self:hero,table:[...GameRules.SceneManager.friendbrach(hero)],type:select_type.友方本路}
            }

            case select_type.友方单体:{
                return {_self:hero,table:[...GameRules.SceneManager.friendbrach(hero)],type:select_type.友方单体}
            }

            case select_type.敌方本路:{
                return {_self:hero,table:[...GameRules.SceneManager.enemybrach(hero)],type:select_type.敌方本路}
            }

            case select_type.敌方单体:{
                return {_self:hero,table:[...GameRules.SceneManager.enemybrach(hero)],type:select_type.敌方单体}
            }

            case select_type.敌方对格:{
                return {_self:hero,table:[GameRules.SceneManager.gather(hero)],type:select_type.敌方对格}
            }

            case select_type.敌方近邻:{
                const neighbor = GameRules.SceneManager.enemyneighbor(hero)
                return {_self:hero,table:[neighbor.center,neighbor.left,neighbor.right],type:select_type.敌方近邻}
            }

            case select_type.自己:{
                return {_self:hero,table:[],type:select_type.自己}
            }

            case select_type.友方全体:{
                const mygoup = GameRules.SceneManager.GetGoUpScene(hero.PlayerID)
                const mymidway = GameRules.SceneManager.GetMidwayScene(hero.PlayerID)
                const mylaiddon = GameRules.SceneManager.GetLaidDownScene(hero.PlayerID)
                return {_self:hero,table:[
                    ...mygoup.getAll() as Unit[],
                    ...mymidway.getAll() as Unit[],
                    ...mylaiddon.getAll() as Unit[],
                ],type:select_type.友方全体}
            }

            case select_type.全场任意敌方单体:{
                const yougoup = GameRules.SceneManager.GetGoUpScene(hero.PlayerID).find_oppose()
                const youmidway = GameRules.SceneManager.GetMidwayScene(hero.PlayerID).find_oppose()
                const youlaiddon = GameRules.SceneManager.GetLaidDownScene(hero.PlayerID).find_oppose()
                return {_self:hero,table:[
                    ...yougoup.getAll() as Unit[],
                    ...youmidway.getAll() as Unit[],
                    ...youlaiddon.getAll() as Unit[],
                    ,
                ],type:select_type.全场任意敌方单体} 
            }

            case select_type.敌方全体:{
                const yougoup = GameRules.SceneManager.GetGoUpScene(hero.PlayerID).find_oppose()
                const youmidway = GameRules.SceneManager.GetMidwayScene(hero.PlayerID).find_oppose()
                const youlaiddon = GameRules.SceneManager.GetLaidDownScene(hero.PlayerID).find_oppose()
                return {_self:hero,table:[
                    ...yougoup.getAll() as Unit[],
                    ...youmidway.getAll() as Unit[],
                    ...youlaiddon.getAll() as Unit[],
                    ,
                ],type:select_type.敌方全体} 
            }

            case select_type.本路:{
               const enemyScnese = hero.Scene.find_oppose()
               const myScnese = hero.Scene
               return {
                   _self:hero,
                   table:[
                       ...enemyScnese.getAll(),
                       ...myScnese.getAll()
                   ],
                   type:select_type.本路
               }
            }
        }
    }

    /**实际技能有效范围查找器 */
    validRangeLookup(PlayerID:PlayerID,magic_brach:Magic_brach,magic_range:Magic_range,magic_team:Magic_team,has_hero_ability_id:string){
        let hero = GameRules.SceneManager.get_hero(has_hero_ability_id) as Unit
        /**测试 始终以中间单位为主 */
        // hero = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID() == PlayerID ? PlayerID : GameRules.Red.GetPlayerID()).IndexGet(3) as Unit
        /**结束后删除 */
        if(hero == undefined) return;
        if(!(hero.isBattle())) return;
        print("成功开始搜索目标")
        if(magic_team == Magic_team.自己){
            return {_self:hero,table:[]}
        }
        if(magic_brach == Magic_brach.对格 && magic_range == Magic_range.近邻){
            const data = GameRules.SceneManager.enemyneighbor(hero)
            return {_self:hero,table:[data.center,data.left,data.right]}
        }
        if(magic_brach == Magic_brach.对格){
            const gather = GameRules.SceneManager.gather(hero) as Unit
            return {_self:hero,table:[gather]}
        }
        if(magic_brach == Magic_brach.跨线 && magic_range == Magic_range.全体 && magic_team == Magic_team.双方){
            const mygoup = GameRules.SceneManager.GetGoUpScene(PlayerID)
            const mymidway = GameRules.SceneManager.GetMidwayScene(PlayerID)
            const mylaiddon = GameRules.SceneManager.GetLaidDownScene(PlayerID)
            const yougoup = GameRules.SceneManager.GetGoUpScene(PlayerID == GameRules.Red.GetPlayerID() ? GameRules.Blue.GetPlayerID() : PlayerID)
            const youmidway = GameRules.SceneManager.GetMidwayScene(PlayerID == GameRules.Red.GetPlayerID() ? GameRules.Blue.GetPlayerID() : PlayerID)
            const youlaiddon = GameRules.SceneManager.GetLaidDownScene(PlayerID == GameRules.Red.GetPlayerID() ? GameRules.Blue.GetPlayerID() : PlayerID)
            return {_self:hero,table:[
                ...mygoup.getAll() as Unit[],
                ...mymidway.getAll() as Unit[],
                ...mylaiddon.getAll() as Unit[],
                ...yougoup.getAll() as Unit[],
                ...youmidway.getAll() as Unit[],
                ...youlaiddon.getAll() as Unit[],
            ]} 
        }
        //本路友方单体
        if(magic_brach == Magic_brach.本路 && magic_range == Magic_range.全体 && magic_team == Magic_team.友方){
            return {_self:hero,table:[...GameRules.SceneManager.friendbrach(hero)]}
        }
        if(magic_brach == Magic_brach.本路 && magic_range == Magic_range.单体 && magic_team == Magic_team.友方){
            return {_self:hero,table:[...GameRules.SceneManager.friendbrach(hero)]}
        }
        //本路敌方单体
        if(magic_brach == Magic_brach.本路 && magic_range == Magic_range.单体 && magic_team == Magic_team.敌方){
            return {_self:hero,table:[...GameRules.SceneManager.enemybrach(hero)]}
        }
        //本路单体双方
        if(magic_brach == Magic_brach.本路 && magic_range == Magic_range.单体 && magic_team == Magic_team.双方){
            return {_self:hero,table:[...GameRules.SceneManager.enemybrach(hero).concat(...GameRules.SceneManager.friendbrach(hero))]}
        }
        //本路近邻友方
        if(magic_brach == Magic_brach.本路 && magic_range == Magic_range.近邻 && magic_team == Magic_team.友方){
            const data = GameRules.SceneManager.friendlyNeighbor(hero)
            return {_self:hero,table:[data.left,data.right]}
        }
        //本路近邻敌方
        if(magic_brach == Magic_brach.本路 && magic_range == Magic_range.近邻 && magic_team == Magic_team.敌方){
            const data = GameRules.SceneManager.enemyneighbor(hero)
            return {_self:hero,table:[data.center,data.left,data.right]}
        }
        //本路全体友方
        if(magic_range == Magic_range.全体 && magic_team == Magic_team.友方){
            print("使用的是友方全体的结局")
            return {_self:hero,table:[...GameRules.SceneManager.friendfindAll(hero)]}
        }
        //本路全体敌方
        if(magic_range == Magic_range.全体 && magic_team == Magic_team.敌方){
            return {_self:hero,table:[...GameRules.SceneManager.enemyfindAll(hero)]}
        }
        //跨线友方单体
        if(magic_brach == Magic_brach.跨线 && magic_team == Magic_team.友方 && magic_range == Magic_range.单体){
            return {_self:hero,table:[...GameRules.SceneManager.friendbrach(hero)]}
        }
        //跨线敌方单体
        if(magic_brach == Magic_brach.跨线 && magic_team == Magic_team.敌方 && magic_range == Magic_range.单体){
            return {_self:hero,table:[...GameRules.SceneManager.enemyfindAll(hero)]}
        }
        //跨线友方群体 -- 单挑路线群体
        if(magic_brach == Magic_brach.跨线 && magic_team == Magic_team.友方 && magic_range == Magic_range.全体){
            return {_self:hero,table:[...GameRules.SceneManager.enemyfindAll(hero)]}
        }
        //跨线敌方群体 -- 单条路线群体
        if(magic_brach == Magic_brach.跨线 && magic_team == Magic_team.敌方 && magic_range == Magic_range.全体){
            return {_self:hero,table:[...GameRules.SceneManager.friendfindAll(hero)]}
        }
    }
}