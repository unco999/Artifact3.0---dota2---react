import { Card } from "./card";
import { relation } from "./scenes";

export enum TRIGGERLIST {
}

export type trigger = {[P in TRIGGERLIST]:Function}
/**modifer的场景效果 */
export type ModifierEffect = {[P in relation]:Effect}

/**modifier的细分效果 比如近邻卡牌所触发的效果 */
export class Effect {
    af:Card
    influentialAttack:number
    influentialDefense:number
    influentialHealth:number
    continuousRound:number //持续回合(当前剩余的持续回合) -1为永久
    trigger:trigger

    constructor(af:Card){
        this.af = af
    }

    SetTrigger(key:TRIGGERLIST,Funtion:Function){
        this.trigger[key] = Funtion
    }

    Destory(){
        for(let key = 0 ; key < this.af.Modifier.length ; key ++ ){
            if(this.af.Modifier[key] === this){
                delete this.af.Modifier[key]
            }
        }
        this.af == null
    }
}

/**动画过渡由客户端完成激活事件回调给服务端   服务端不做任何异步处理 */
export class CardModifier{
    OriginCard:Card  // 释放者
    ModifierEffect:ModifierEffect //根据场景的不同 modifier的效果也会不同

    constructor(){
    }

    /** 设置该modifier的目标 */
    SetTarget(){

    }

    /** 释放该modifer的特性 */
    play(){
        
    }

}