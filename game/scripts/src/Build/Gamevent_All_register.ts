import { brash_solidier } from "../feature/brush_solidier";
import { damage } from "../feature/damage";
import { Unit } from "../instance/Unit";

export class GamaEvent_All_register{
    static register(){
        //刷小兵组件
        CustomGameEventManager.RegisterListener("C2S_BRUSH_SOLIDER",()=>{
            brash_solidier.brushTwoSoldiers() 
        })
        CustomGameEventManager.RegisterListener("TEST_C2S_CALL_ATTACK",()=>{
            GameRules.SceneManager.GetMidwayScene(GameRules.Red.GetPlayerID()).foreach(card=>{
               const target = card.Scene.find_oppose().IndexGet(card.Index) as Unit
               const _damage = new damage(card as Unit,target)
               _damage.settlement()
            })
        })
    }
}