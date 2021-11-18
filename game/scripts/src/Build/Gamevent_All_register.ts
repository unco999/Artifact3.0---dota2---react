import { brash_solidier } from "../feature/brush_solidier";

export class GamaEvent_All_register{
    static register(){
        //刷小兵组件
        CustomGameEventManager.RegisterListener("C2S_BRUSH_SOLIDER",()=>{
            brash_solidier.brushTwoSoldiers() 
        })
    }
}