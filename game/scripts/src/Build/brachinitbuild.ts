import { Card } from "../instance/Card";
import { IHeapsCardbuilder } from "../instance/Scenes";
import { Unit } from "../instance/Unit";
import Queue from "../structure/Queue";

export class brachinitbuild implements IHeapsCardbuilder{
    brach:{1:Array<Card>,2:Array<Card>,3:Array<Card>} = {1:[],2:[],3:[]}

    constructor(PlayerID:PlayerID){
        const _table = CustomNetTables.GetTableValue("Card_group_construction_phase",'herobrach')[PlayerID.toString()]
        for(const brach in _table){
            for(const index in _table[brach]){
                const _Unit = new Unit({"Index":+index,Id:_table[brach][index],'PlayerID':PlayerID},GameRules.SceneManager.GetCardheapsScene(PlayerID))
                GameRules.SceneManager.global_add(_Unit.UUID,_Unit)
                this.brach[brach as unknown as 1|2|3].push(_Unit)
            }
        }
    }

    filter(option:string,PlayerID:PlayerID){
        print("打印分录",option)
        switch(option){
            case "0":{
                return "GOUP"
            }
            case "1":{
                return "MIDWAY"
            }
            case "2":{
                return "LAIDDOWN"
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