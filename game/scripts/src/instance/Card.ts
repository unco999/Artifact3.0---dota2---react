import { BattleArea, GoUp, ICAScene, Midway } from "./Scenes";

export type uuid = string;

export interface CardParameter{
    PlayerID:PlayerID
    Index:number
    Id:string
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

export abstract class Card{
    PlayerID:PlayerID
    UUID:uuid
    Index?:number 
    Id:string
    Scene:ICAScene //初始化场景  卡牌所在的位置
    type:string
    
    constructor(CardParameter:CardParameter,Scene:ICAScene){
        this.UUID = DoUniqueString(GetSystemTime())
        this.Id = CardParameter.Id
        this.Index = CardParameter.Index
        this.PlayerID = CardParameter.PlayerID
        this.Scene = Scene
        this.register_gameevent()
        this.Scene.addCard(this)
        print("创造了",this.UUID)
    }

    abstract ToData():any

    /**注冊原子級別的事件 */
    register_gameevent(){
        CustomGameEventManager.RegisterListener('C2S_GET_CARD',(_,event)=>{
            if( event.uuid == this.UUID){
                print("收到查询原子事件")
                CustomGameEventManager.Send_ServerToAllClients("S2C_GET_CARD",{Id:this.Id,Index:this.Index,uuid:this.UUID,Scene:this.Scene.SceneName,type:this.type,playerid:this.PlayerID,data:this.ToData()})   
            }
        })
    }

    /**查找左边是否有空位 */
    isThereAVacancyOnTheLeft(){
        const scene = this.Scene as BattleArea
        return scene.CardList[this.Index - 1 - 1] == -1
    }

    /**查找右边是否有空位 */
    findNoVacancyOnTheRight(){
        const scene = this.Scene as BattleArea
        return scene.CardList[this.Index - 1 + 1] == -1
    }

    /**卡牌向右边移动 */
    right(){
        const _scenes = this.Scene as BattleArea
        while(this.Index > 0 && _scenes.CardList[this.Index + 1 - 1] == -1 && this.Index < 3){
                _scenes.CardList[this.Index -1] = -1
                this.Index++
                _scenes.CardList[this.Index -1] = this 
        }
        this.update(this.Scene.SceneName)
    }

    /**卡牌向左边移动 */
    left(){
        const _scenes = this.Scene as BattleArea
        while(this.Index > 3 && _scenes.CardList[this.Index - 1 - 1] == -1 && this.Index <= 5){
            _scenes.CardList[this.Index - 1] = -1
            this.Index--
            _scenes.CardList[this.Index - 1] = this
        }
        this.update(this.Scene.SceneName)
    }

    /**是否在手牌 */
    ishand(){
        return this.Scene.SceneName === 'Hand'
    }

    /**是否已经上场 */
    isBattle(){
        return this.isMideay() || this.isLaidDown || this.isReleaseScene
    }

    /**是否在中路 */
    isMideay(){
        return this.Scene.SceneName == 'Midway'
    }

    /**是否在下路 */
    isLaidDown(){
        return this.Scene.SceneName == 'LaidDown'
    }

    /**是否释法状态 */
    isReleaseScene(){
        return this.Scene.SceneName == 'ReleaseScene'
    }

    /**是否在牌堆 */
    isCardheaps(){
        return this.Scene.SceneName == 'Cardheaps'
    }

    /**是否在坟墓 */
    isGrave(){
        return this.Scene.SceneName == 'Grave'
    }

    /**发送事件 */
    update(to:string){
        print("发送了场景改变事件","我的的todata是",this.ToData())
        print(this.UUID,"我當前的場景是",this.Scene.SceneName,"我要去",to,"我的index是",this.Index)  
        CustomGameEventManager.Send_ServerToAllClients('S2C_CARD_CHANGE_SCENES',{Scene:to,uuid:this.UUID,Index:this.Index,Id:this.Id,type:this.type,playerid:this.PlayerID,data:this.ToData()})
    }

    
}

