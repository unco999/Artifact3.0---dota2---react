import { brash_solidier } from "../feature/brush_solidier";
import { damage } from "../feature/damage";
import { EquipCard } from "../instance/Equip";
import { Hand } from "../instance/Scenes";
import { Unit } from "../instance/Unit";

export class GamaEvent_All_register{
    static register(){
        //刷小兵组件
        CustomGameEventManager.RegisterListener("C2S_BRUSH_SOLIDER",()=>{
            brash_solidier.brushTwoSoldiers() 
        })
        CustomGameEventManager.RegisterListener("TEST_C2S_CALL_ATTACK",()=>{
            const redmidway = GameRules.SceneManager.GetMidwayScene(GameRules.Red.GetPlayerID())
            const bluemidway = GameRules.SceneManager.GetMidwayScene(GameRules.Blue.GetPlayerID())
            const start = redmidway.quantityOfChessPieces > bluemidway.quantityOfChessPieces ? redmidway : bluemidway
            start.foreach(card=>{
               const target = card.Scene.find_oppose().IndexGet(card.Index) as Unit
               print(target,"找到的target为")
            //    const _damage = new damage(card as Unit,target)
            //    _damage.attacklement()
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
    }
}