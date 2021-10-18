import { Effect } from "./modifier";

export enum relation{
    不同分路,
    相同分路不同对线,
    对线,
    相邻,
    近邻,
}

/**动画过渡由客户端完成激活事件回调给服务端   服务端不做任何异步处理 */
export class CardScenes{
    scenesid:number // 卡牌所在场景具体位置 -1为不在场上
    scenestype:number // 卡牌所在场景的类型 
    sceneroute:number // 卡牌所在场景的分路

    constructor(){
        
    }

    /**计算两张卡牌相关的场景方式 */
    calculateSceneRelationship(CardScenes:CardScenes):relation{
        return 
    }
}