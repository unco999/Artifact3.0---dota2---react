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

export type CARD_TYPE = "Hero"|"Solider"|"TrickSkill"|"SmallSkill"|"EQUIP"|"Summoned"

export abstract class Card{
    PlayerID:PlayerID
    UUID:uuid
    Index?:number 
    Id:string
    Scene:ICAScene //初始化场景  卡牌所在的位置
    type:CARD_TYPE
    
    constructor(CardParameter:CardParameter,Scene:ICAScene,type:CARD_TYPE){
        this.type = type
        this.UUID = DoUniqueString("Card")
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
        print("查看左边是否有空位")
        const scene = this.Scene as BattleArea
        return scene.CardList[this.Index - 1 - 1] == -1
    }

    /**查找右边是否有空位 */
    findNoVacancyOnTheRight(){
        print("右边是否有空位")
        const scene = this.Scene as BattleArea
        return scene.CardList[this.Index - 1 + 1] == -1
    }

    /**卡牌向右边移动 带动对面的向左移动*/
    right(){
        print("卡牌右移开始")
        const _scenes = this.Scene as BattleArea
        const _targetScnese = this.Scene.find_oppose() as BattleArea
        if(!_scenes?.CardList) return;
        while(_scenes.CardList[this.Index + 1 - 1] == -1 && this.Index < 3
            && _targetScnese.CardList[this.Index + 1 - 1] == -1
            ){
                const oppositecard = _targetScnese.IndexGet(this.Index)
                if(oppositecard){
                    _targetScnese.CardList[oppositecard.Index - 1] = -1
                    oppositecard.Index++
                    _targetScnese.CardList[oppositecard.Index - 1] = oppositecard
                }
                _scenes.CardList[this.Index -1] = -1
                this.Index++
                _scenes.CardList[this.Index -1] = this 
        }
    }

    /**卡牌向左边移动 带动对面的向左移动*/
    left(){
        print("卡牌左移开始")
        const _scenes = this.Scene as BattleArea
        const _targetScnese = this.Scene.find_oppose() as BattleArea
        while(this.Index > 3 && _scenes.CardList[this.Index - 1 - 1] == -1 
            && _targetScnese.CardList[this.Index - 1 - 1] == -1){
            _scenes.CardList[this.Index - 1] = -1
            const oppositecard = _targetScnese.IndexGet(this.Index)
            if(oppositecard){
                _targetScnese.CardList[oppositecard.Index - 1] = -1
                oppositecard.Index--
                _targetScnese.CardList[oppositecard.Index - 1] = oppositecard
            }
            this.Index--
            _scenes.CardList[this.Index - 1] = this
        }
    }

    /**是否在手牌 */
    ishand(){
        return this.Scene.SceneName === 'Hand'
    }

    /**是否已经上场 */
    isBattle(){
        return this.isMideay() || this.isLaidDown() || this.isReleaseScene() || this.isGoUP()
    }

    isGoUP(){
        return this.Scene.SceneName == 'GOUP'
    }

    /**是否在中路 */
    isMideay(){
        return this.Scene.SceneName == 'MIDWAY'
    }

    /**是否在下路 */
    isLaidDown(){
        return this.Scene.SceneName == 'LAIDDOWN'
    }

    /**是否释法状态 */
    isReleaseScene(){
        return this.Scene.SceneName == 'ABILITY'
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

    