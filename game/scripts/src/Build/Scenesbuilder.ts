import Queue from "../structure/Queue";
import { Card, uuid } from "../instance/Card";
import { ICAScene, IHeapsCardbuilder, Scenes } from "../instance/Scenes";

/** 负责构造手牌 */
export class HandHeapsCardbuilder implements IHeapsCardbuilder{
    data:Record<uuid,Card> = {}

    constructor(scenes:Scenes,player:PlayerID){
        for(let i = 0 ; i < 50 ; i++){
            const card = new Card({"Index":i,"Name":i.toString() + ((math.random() > 0.5) ? "trick" : 2),'PlayerID':player},scenes)
            this.data[card.UUID] = card
            GameRules.SceneManager.global_add(card.UUID,card)
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

    newtrickCard(){
        const newQueue = new Queue
        for(const uuid in this.data){
           if(this.data[uuid].Name.includes("trick")){
              newQueue.enqueue(this.data[uuid])
           }
        }
        return newQueue
    }

}