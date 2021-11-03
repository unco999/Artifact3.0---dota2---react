import Queue from "../structure/Queue";
import { Card, uuid } from "./Card";
import { ICAScene, IHeapsCardbuilder } from "./Scenes";

export class HandHeapsCardbuilder implements IHeapsCardbuilder{
    data:Record<uuid,Card> = {}

    constructor(){
        for(let i = 0 ; i < 20 ; i++){
            const card = new Card({"Index":i,"Name":math.random().toString(),'PlayerID':GameRules.Blue.GetPlayerID()},GameRules.Cardheaps)
            this.data[card.UUID] = card
        }
    }

    generator(): Record<string, Card> {
        return this.data
    }

    newqueue(): Queue {
        const newQueue = new Queue()
        for(const key in this.data){
            newQueue.enqueue(this.data[key])
        }
        return newQueue
    }

}