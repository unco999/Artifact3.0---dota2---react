import { Card } from "./card";

export class DamegeManeger{
    red:Card|undefined
    blue:Card|undefined

    constructor(red:Card,blue:Card){
        this.red = red
        this.blue = blue
    }

    run(){
        const redstate = this.red.totalDataSettlement()
        const bluestate = this.blue.totalDataSettlement()
        this.red.fightSettlement()
        this.blue.fightSettlement()
    }
}