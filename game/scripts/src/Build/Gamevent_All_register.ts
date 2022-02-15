import { brash_solidier } from "../feature/brush_solidier";
import { damage } from "../feature/damage";
import { EquipCard, EquipContainer } from "../instance/Equip";
import { Hero } from "../instance/Hero";
import { HOOK, ModifilerContainer } from "../instance/Modifiler";
import { BattleArea, Hand, Scenes } from "../instance/Scenes";
import { Unit } from "../instance/Unit";
import { Timers } from "../lib/timers";
import { reloadable } from "../lib/tstl-utils";
import { 游戏循环 } from "../Manager/BattleGameLoop";
import { add_cuurent_glod, get_cuurent_glod } from "../Manager/nettablefuc";

@reloadable
export class GamaEvent_All_register{
    static register(){
        //刷小兵组件
        CustomGameEventManager.RegisterListener("C2S_BRUSH_SOLIDER",()=>{
            GameRules.brash_solidier.brushTwoSoldiers() 
        })
        CustomGameEventManager.RegisterListener("C2S_BUY_ITEM",(_,event)=>{
            const loop = CustomNetTables.GetTableValue("GameMianLoop","smallCycle").current
            print("当前阶段是",loop != 游戏循环.商店购买阶段.toString())
            if(loop != 游戏循环.商店购买阶段.toString()){
                CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(event.PlayerID),"S2C_INFORMATION",{information:"目前阶段无法购买装备"})
                return
            }
            if(get_cuurent_glod(event.PlayerID) < 3){
                CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(event.PlayerID),"S2C_INFORMATION",{information:"您连3个金币都没有..."})
                return 
            }
            add_cuurent_glod(-3,event.PlayerID)
            const item = event.itemname
            const card = new EquipCard({Id:item,Index:-1,PlayerID:event.PlayerID},GameRules.SceneManager.GetCardheapsScene(event.PlayerID))
            GameRules.SceneManager.global_add(card.UUID,card)
            GameRules.SceneManager.update()
            GameRules.SceneManager.change_secens(card.UUID,"HAND")
            CustomGameEventManager.Send_ServerToAllClients("S2C_BRUSH_ITEM",{})
        })
        CustomGameEventManager.RegisterListener("TEST_C2S_CALL_ATTACK",()=>{
            const redmidway = GameRules.SceneManager.GetGoUpScene(GameRules.Red.GetPlayerID()) as BattleArea
            const bluemidway = GameRules.SceneManager.GetGoUpScene(GameRules.Blue.GetPlayerID())as BattleArea
            const start = redmidway.quantityOfChessPieces > bluemidway.quantityOfChessPieces ? redmidway : bluemidway
            let index = 0
            start.foreach((card:Unit)=>{
                if(card.isAttackPreHook()){
                   index += RandomFloat(1,2)
                }
                Timers.CreateTimer(index,()=>{
                    const target = card.Scene.find_oppose().IndexGet(card.Index) as Unit
                    print("攻击方",card.UUID,"受害方",target?.UUID)
                    const _damage = new damage(card as Unit,target)
                    _damage.attacklement()     
                })
            })
        })
        //伤害动画测试
        CustomGameEventManager.RegisterListener("C2S_CALL_ATTACK",()=>{
            GameRules.SceneManager.GetMidwayScene(GameRules.Red.GetPlayerID()).foreach(card=>{
                const target = card.Scene.find_oppose().IndexGet(card.Index) as Unit
                CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTACK",{uuid:card.UUID})
                CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_ATTACK",{uuid:target.UUID})
             })
        })

        CustomGameEventManager.RegisterListener("C2S_TEST_REDUCE",()=>{
            print("能量条-1")
            GameRules.energyBarManager.enrgyBarData[GameRules.Blue.GetPlayerID() + "1"].add_cuurent_energy(-1)
        })

        
        CustomGameEventManager.RegisterListener("C2S_TEST_MAX_REDUCE",()=>{
            print("能量条上线+1")
            GameRules.energyBarManager.enrgyBarData[GameRules.Blue.GetPlayerID() + "1"].current_max_enrygy_add(1)
        })
        CustomGameEventManager.RegisterListener("C2S_TEST_RANDOM_EQUIP",(_,event)=>{
            print("手牌加入一张装备牌") 
            const max_index = (GameRules.SceneManager.GetHandsScene(event.PlayerID) as Hand).max_index
            const _equit = new EquipCard({Id:"item_robe",Index:max_index,PlayerID:event.PlayerID},GameRules.SceneManager.GetCardheapsScene(event.PlayerID))
            GameRules.SceneManager.global_add(_equit.UUID,_equit)
            GameRules.SceneManager.change_secens(_equit.UUID,"HAND",6);
        })
        // CustomGameEventManager.RegisterListener("C2S_TEST_STATE",(event)=>{
        //     GameRules.GameLoopState
        // })
        //分路测试
        CustomGameEventManager.RegisterListener("C2S_TEST_SCENE_LINK",(_,event)=>{
            GameRules.SceneManager.GetHandsScene(event.PlayerID).Print()
            print("打印结束")
        })
        CustomGameEventManager.RegisterListener("C2S_ALL_Stun",(_,event)=>{
            (GameRules.SceneManager.GetGoUpScene(event.PlayerID)).foreach((card:Hero)=>{
                print("当前遍取到的英雄",card.UUID)
                card.addmodifiler(ModifilerContainer.instance.Get_prototype_modifiler("stund1round_modifiler"))
            })
        })
    }
}