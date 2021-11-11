import { Card } from "../instance/Card";
import { IHeapsCardbuilder } from "../instance/Scenes";
import { Unit } from "../instance/Unit";
import Queue from "../structure/Queue";

export class brachinitbuild implements IHeapsCardbuilder{
    brach:{1:Array<number>,2:Array<number>,3:Array<number>}

    constructor(PlayerID:PlayerID){
        const _table = CustomNetTables.GetTableValue("Card_group_construction_phase",'herobrach')[PlayerID.toString()]
        for(const brach in _table){
            for(const index in _table[brach]){
                const _Unit = new Unit({"Index":+index,"Name":_table[brach][index],'PlayerID':PlayerID},this.filter(brach,PlayerID))
                GameRules.SceneManager.global_add(_Unit.UUID,_Unit)
            }
        }
    }

    filter(option:string,PlayerID:PlayerID){
        print("打印分录",option)
        switch(option){
            case "0":{
                return GameRules.SceneManager.GetGoUpScene(PlayerID)
            }
            case "1":{
                return GameRules.SceneManager.GetMidwayScene(PlayerID)
            }
            case "2":{
                return GameRules.SceneManager.GetLaidDownScene(PlayerID)
            }
        }
    }

    generator(): Record<string, Card> {
        return
    }

    newqueue(): Queue {
        return
    }

    newtrickCard(): Queue {
        return
    }
    
}