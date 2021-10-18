import { Card } from "./card";

export class CardState{
    af:Card //属于哪张卡
    cardAttack:number
    cardarrmor:number
    cardheal:number
    
    constructor(attack:number,arrmor:number,heal:number){
        this.cardAttack = attack
        this.cardarrmor = arrmor
        this.cardheal = heal
    }

    setAf(af:Card){
        this.af = af; 
    }
}