import { ICAScene } from "./Scenes";

export type uuid = string;

export interface CardParameter{
    PlayerID:PlayerID
    Index:number
    Name:string
}

/** 职业魔法卡需要英雄卡在场才能释放 
 * 
 * @魔法卡必须要实现的方法
*/
export interface professionalMagicCard{
    SPEEL_ABILITY(uuid:string)
    SPEEL_TARGET(target_uuid:string)
    SPEEL_SCNECE(scene_name:string)
}

export class Card{
    PlayerID:PlayerID
    UUID:uuid
    Index?:number 
    Name:string
    Scene:ICAScene //初始化场景  卡牌所在的位置
    
    constructor(CardParameter:CardParameter,Scene:ICAScene){
        this.UUID = DoUniqueString(CardParameter.Name)
        this.Name = CardParameter.Name
        this.Index = CardParameter.Index
        this.PlayerID = CardParameter.PlayerID
        this.Scene = Scene
        this.Scene.addCard(this)
    }

    CHANGE_SCENE(Scene:ICAScene){
        this.Scene.Remove(this.UUID)
        print(`${this.Name}从${this.Scene.SceneName}场景删除`)
        this.Scene = Scene
        this.Scene.addCard(this)
        print(`${this.Name}添加到${this.Scene.SceneName}场景`)
    }

}

