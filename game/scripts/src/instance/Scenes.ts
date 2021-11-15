import Queue from "../structure/Queue";

/**
 * @场景类下  有手牌  上 中 下路  正在释放场景 坟墓  牌堆
 */

import { LinkedList } from "../structure/Linkedlist";
import { Card, uuid } from "./Card";
import { Timers } from "../lib/timers";
import { SmallSkill, TrickSkill } from "./Ability";

type PlayerScene = Record<number, Scenes> ;



export interface ICAScene {
    SceneName:string
    CaSceneManager: ScenesManager;
    CardPool: Record<uuid, Card>;
    PlayerID:PlayerID
    Remove(uuid: uuid);
    addCard(Card: Card): Card;
    foreach(callback: (Card) => void);
    UUIDGet(uuid: uuid): Card;
    IndexGet(index: number): Card;
    getAll(): Card[];
}

export interface IHeapsCardbuilder {
    generator(): Record<uuid, Card>;
    newqueue():Queue;
    newtrickCard():Queue
}

export class Scenes implements ICAScene{
    SceneName: string;
    CaSceneManager: ScenesManager;
    CardPool: Record<uuid, Card> = {};    
    PlayerID: PlayerID;

    getIndex(Card:Card){
        return 
    }

    constructor(CaSceneManager:ScenesManager){
        this.CaSceneManager = CaSceneManager
    }

    Remove(uuid: string) {
        this.CardPool[uuid] = null;
    }

    addCard(Card: Card): Card {
        Card.Scene = this
        this.CardPool[Card.UUID] = Card;
        return Card;
    }

    foreach(callback: (Card: Card) => void) {
        for (const key in this.CardPool) {
            callback(this.CardPool[key]);
        }
    }

    UUIDGet(uuid: string): Card {
        return this.CardPool[uuid];
    }

    IndexGet(index: number): Card {
        for (const key in this.CardPool) {
            if (this.CardPool[key].Index = index) {
                return this.CardPool[key];
            }
        }
    }

    getAll(): Card[] {
        const list = []
        this.foreach((card)=>{
            list.push(card)
        })
        return list
    }

    update_uuid(){
        const table = []
        this.foreach((card)=>{
            table.push(card.UUID)
        })
        return table
    }
}

/**牌堆 需要Heapsinit */
export class Cardheaps extends Scenes {
    SceneName = "HEAPS"
    HeapsCount = 25;  //牌堆生成牌


    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager)
        this.PlayerID = PlayerID
        ICASceneManager.SetCardheapsScene(this);
    }



    /**随机抽取一张小技能 */
    Trick_ability_dequeue():Card{
        const uuids = Object.keys(this.CardPool)
        let card:Card
        while(!card){
           const extract = this.CardPool[uuids[RandomInt(0,uuids.length)]]
           if(extract instanceof SmallSkill){
               card = extract
           }
        }
        return card
    }

        /**随机抽取一张大技能 */
    Small_ability_dequeue():Card{
            const uuids = Object.keys(this.CardPool)
            let card:Card
            while(!card){
               const extract = this.CardPool[uuids[RandomInt(0,uuids.length)]]
               if(extract instanceof TrickSkill){
                   card = extract
               }
            }
            return card
    }
    

}

/**手牌区 */
export class Hand extends Scenes{
    SceneName = 'HAND'
    Cardlinked:LinkedList<Card> = new LinkedList()
    CardList:Array<Card|-1> = [-1,-1,-1,-1,-1]

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager)
        this.PlayerID = PlayerID
        ICASceneManager.SetHandsScene(this);
    }

    addCard(Card:Card){
        this.CardPool[Card.UUID] = Card
        Card.Scene = this
        this.Cardlinked.prepend(Card)
        Card.Index = this.Cardlinked.length
        return Card
    }

    Remove(uuid:uuid){
        print("运行了手牌规则")
        super.Remove(uuid)
        this.Cardlinked.remove(this.CardPool[uuid])
        let index = 0
        for(const card of this.Cardlinked){
            index++
            card.Index = index
        }
        print("手炮规则运行完毕")
    }

    update_uuid(){
        return this.Cardlinked.toArray()
    }

}

export class Midway extends Scenes{
    SceneName = 'MIDWAY'
    CardList:Array<Card|-1> = [-1,-1,-1,-1,-1]

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager)
        this.PlayerID = PlayerID
        ICASceneManager.SetMidwayScene(this);
    }

    //获得一个当前可选的空位
 
    getbrachoption(){
        let mark = [-1,-1]
        for(let index = 0; index <= 3 ; index ++){
            if(this.CardList[2 - index] == -1   ){
                if(mark[0] == -1){
                    mark[0] = 2 - index + 1
                }
            }
            if(this.CardList[2 + index] == -1){
                if(mark[1] == -1){
                    mark[1] = 2 + index + 1
                }
            }
            if(mark[0] != -1 && mark[1] != -1){
                 break;
            }
        }
        return mark
    }
    addCard(card:Card){
        let mark;
        for(let index = 0 ; index < 4 ; index ++){
            if(this.CardList[3 - index - 1] === -1){
                mark = 3 - index
                break;
            }
            if(this.CardList[3 + index - 1] === -1){
                mark = 3 + index
                break
            }
        }
        if(!mark){
            print("自动加入路线出错了")
        }
        card.Index = mark
        this.CardList[mark] = card
        this.CardPool[card.UUID] = card
        return card
    }

    Remove(uuid){
        for(let index = 1 ; index < this.CardList.length ; index ++){
           if(this.CardList[index] instanceof Card){
               if((this.CardList[index] as Card).UUID == uuid){
                   this.CardList[index] = -1
                   this.CardPool[uuid] = null
               }
           }
        }
     }


}

export class GoUp extends Scenes{
    SceneName = 'GOUP'
    CardList:Array<Card|-1> = [-1,-1,-1,-1,-1]

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager)
        this.PlayerID = PlayerID
        ICASceneManager.SetGoUpScene(this);
    }


    getbrachoption(){
        let mark = [-1,-1]
        for(let index = 0; index <= 3 ; index ++){
            if(this.CardList[2 - index] == -1   ){
                if(mark[0] == -1){
                    mark[0] = 2 - index + 1
                }
            }
            if(this.CardList[2 + index] == -1){
                if(mark[1] == -1){
                    mark[1] = 2 + index + 1
                }
            }
            if(mark[0] != -1 && mark[1] != -1){
                 break;
            }
        }
        return mark
    }

    addCard(card:Card){
        let mark;
        for(let index = 0 ; index < 4 ; index ++){
            if(this.CardList[3 - index - 1] === -1){
                mark = 3 - index
                break;
            }
            if(this.CardList[3 + index - 1] === -1){
                mark = 3 + index
                break
            }
        }
        if(!mark){
            print("自动加入路线出错了")
        }
        card.Index = mark
        this.CardList[mark] = card
        this.CardPool[card.UUID] = card
        return card
    }

    Remove(uuid){
        for(let index = 1 ; index < this.CardList.length ; index ++){
           if(this.CardList[index] instanceof Card){
               if((this.CardList[index] as Card).UUID == uuid){
                   this.CardList[index] = -1
                   this.CardPool[uuid] = null
               }
           }
        }
     }

}

export class LaidDown extends Scenes{
    SceneName = 'LAIDDOWN'
    CardList:Array<Card|-1> = [-1,-1,-1,-1,-1]

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager)
        this.PlayerID = PlayerID
        ICASceneManager.SetLaidDownScene(this);
    }

    getbrachoption(){
        let mark = [-1,-1]
        for(let index = 0; index <= 3 ; index ++){
            if(this.CardList[2 - index] == -1   ){
                if(mark[0] == -1){
                    mark[0] = 2 - index + 1
                }
            }
            if(this.CardList[2 + index] == -1){
                if(mark[1] == -1){
                    mark[1] = 2 + index + 1
                }
            }
            if(mark[0] != -1 && mark[1] != -1){
                 break;
            }
        }
        return mark
    }

    
    addCard(card:Card){
        let mark;
        for(let index = 0 ; index < 4 ; index ++){
            if(this.CardList[3 - index - 1] === -1){
                mark = 3 - index
                break;
            }
            if(this.CardList[3 + index - 1] === -1){
                mark = 3 + index
                break
            }
        }
        if(!mark){
            print("自动加入路线出错了")
        }
        card.Index = mark
        this.CardList[mark] = card
        this.CardPool[card.UUID] = card
        return card
    }

    Remove(uuid){
        for(let index = 1 ; index < this.CardList.length ; index ++){
           if(this.CardList[index] instanceof Card){
               if((this.CardList[index] as Card).UUID == uuid){
                   this.CardList[index] = -1
                   this.CardPool[uuid] = null
               }
           }
        }
        print("成功删除场景HAND")
    }
}


/**场景管理类 */
export class ScenesManager{
    private All:Record<uuid,Card> = {}
    private Hand: PlayerScene = {};
    private GoUp: PlayerScene = {};
    private Midway: PlayerScene = {};
    private LaidDown: PlayerScene = {}; 
    private ReleaseScene: PlayerScene = {};
    private Cardheaps: PlayerScene = {};
    private Grave: PlayerScene = {};


    constructor(){
        this.register_game_event()
    }

    register_game_event(){
        //測試模式下每10秒打印棋局
        // if(IsInToolsMode()){
        //     Timers.CreateTimer(()=>{
        //         print("红色")
        //         DeepPrintTable(this.GetHandsScene(GameRules.Red.GetPlayerID()).update_uuid())
        //         DeepPrintTable(this.GetCardheapsScene(GameRules.Red.GetPlayerID()).update_uuid())
        //         print("蓝色")
        //         DeepPrintTable(this.GetHandsScene(GameRules.Blue.GetPlayerID()).update_uuid())
        //         DeepPrintTable(this.GetCardheapsScene(GameRules.Blue.GetPlayerID()).update_uuid())
        //         return 10
        //     },[])
        // }
        CustomGameEventManager.RegisterListener("C2S_CARD_CHANGE_SCENES",(_,event)=>{
            if(!GameRules.gamemainloop.filter) return;
            if(this.All[event.uuid]){
                this.All[event.uuid].Index = event.index
            }
            this.change_secens(event.uuid,event.to_scene)
        })
        CustomGameEventManager.RegisterListener("C2S_GET_SCENES",(_,event)=>{
            switch(event.get){
                case "HAND":{
                    CustomGameEventManager.Send_ServerToAllClients("S2C_GET_SCENES",this.GetHandsScene(event.PlayerID).update_uuid())
                }
            }
        })
        CustomGameEventManager.RegisterListener('C2S_GET_CANSPACE',(_,event)=>{
            const table = {};
            const GoUp = (this.GetGoUpScene(event.PlayerID) as GoUp).getbrachoption();
            const LaidDown = (this.GetLaidDownScene(event.PlayerID) as LaidDown).getbrachoption();
            const Midway = (this.GetMidwayScene(event.PlayerID) as Midway).getbrachoption();
            table[0] = GoUp
            table[1] = Midway
            table[2] = LaidDown
            print("分路打印")
            DeepPrintTable(table)
            CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(event.PlayerID),"S2C_SEND_CANSPACE",table)
        })
    }

    //**获得一个当前单位能加入的索引 */
    getoptionbrach(){

    }

    /** 附加给全局 ALL*/
    global_add(uuid:uuid,Card:Card){
        this.All[uuid] = Card
    }

    getAll(PlyaerID:PlayerID){
        const table = []
        for(const uuid in this.All){
            this.All[uuid].PlayerID == PlyaerID && table.push(uuid)
        }
        return table
    }

    /** 更新网表至nettable */
    update(){
        // const BlueGoUp = this.GoUp[GameRules.Blue.GetPlayerID()].update_uuid()
        // const RedGoUp = this.GoUp[GameRules.Red.GetPlayerID()].update_uuid()
        // const BlueLaidDown = this.LaidDown[GameRules.Blue.GetPlayerID()].update_uuid()
        // const RedLaidDown = this.LaidDown[GameRules.Red.GetPlayerID()].update_uuid()
        // const BlueReleaseScene = this.ReleaseScene[GameRules.Blue.GetPlayerID()].update_uuid()
        // const RedLReleaseScene = this.ReleaseScene[GameRules.Red.GetPlayerID()].update_uuid()
        // const BlueGrave = this.Grave[GameRules.Blue.GetPlayerID()].update_uuid()
        // const RedGrave = this.Grave[GameRules.Red.GetPlayerID()].update_uuid()
        CustomNetTables.SetTableValue("Scenes","ALL"+GameRules.Red.GetPlayerID(),this.getAll(GameRules.Red.GetPlayerID()))
        CustomNetTables.SetTableValue("Scenes","ALL"+GameRules.Blue.GetPlayerID(),this.getAll(GameRules.Blue.GetPlayerID()))
        // CustomNetTables.SetTableValue('Scenes',"GoUp" + GameRules.Blue.GetPlayerID(),BlueGoUp)
        // CustomNetTables.SetTableValue('Scenes',"GoUp" + GameRules.Red.GetPlayerID(),RedGoUp)
        // CustomNetTables.SetTableValue('Scenes',"LaidDown" + GameRules.Blue.GetPlayerID(),BlueLaidDown)
        // CustomNetTables.SetTableValue('Scenes',"LaidDown" + GameRules.Red.GetPlayerID(),RedLaidDown)
        // CustomNetTables.SetTableValue('Scenes',"ReleaseScene" + GameRules.Blue.GetPlayerID(),BlueReleaseScene)
        // CustomNetTables.SetTableValue('Scenes',"ReleaseScene" + GameRules.Red.GetPlayerID(),RedLReleaseScene)
        // CustomNetTables.SetTableValue('Scenes',"Grave" + GameRules.Blue.GetPlayerID(),BlueGrave)
        // CustomNetTables.SetTableValue('Scenes',"Grave" + GameRules.Red.GetPlayerID(),RedGrave)
        print("打印")
    }

    /**牌改变场景*/
    change_secens(uuid:string,to:string){
        const card = this.All[uuid]
        const playerid = card.PlayerID

        switch(to){
            case 'HAND':{
                print(this.All[uuid].Scene.SceneName);
                this.All[uuid].Scene.Remove(uuid);
                this.GetHandsScene(playerid).addCard(card)
                this.All[uuid].update("HAND")
                break;
            }
            case 'MIDWAY':{
               this.All[uuid].Scene.Remove(uuid);
                (this.GetMidwayScene(playerid) as Midway).addCard(card)
                this.All[uuid].update('MIDWAY')
                break;
            }
            case 'LAIDDOWN':{
                this.All[uuid].Scene.Remove(uuid);
                (this.GetLaidDownScene(playerid) as LaidDown).addCard(card)
                this.All[uuid].update('LAIDDOWN')
                break;
            }
            case 'GOUP':{
                this.All[uuid].Scene.Remove(uuid);
                (this.GetGoUpScene(playerid) as GoUp).addCard(card)
                this.All[uuid].update('GOUP')
                break;
            }
        }
    }

    SetCardheapsScene(Scene:Cardheaps){
         this.Cardheaps[Scene.PlayerID] = Scene
    }

    SetHandsScene(Scene:Scenes){
        this.Hand[Scene.PlayerID] = Scene
    }

    SetGoUpScene(Scene:Scenes){
        this.GoUp[Scene.PlayerID] = Scene
    }

    SetMidwayScene(Scene:Scenes){
        this.Midway[Scene.PlayerID] = Scene
    }

    SetLaidDownScene(Scene:Scenes){
        this.LaidDown[Scene.PlayerID] = Scene
    }

    SetReleaseScene(Scene:Scenes){
        this.ReleaseScene[Scene.PlayerID] = Scene
    }

    SetGraveScene(Scene:Scenes){
        this.Grave[Scene.PlayerID] = Scene
    }

    GetCardheapsScene(PlayerID:PlayerID):Cardheaps{
        return this.Cardheaps[PlayerID] as Cardheaps
    }

    GetHandsScene(PlayerID:PlayerID){
        return this.Hand[PlayerID]
    }

    GetGoUpScene(PlayerID:PlayerID){
        return this.GoUp[PlayerID]
    }

    GetMidwayScene(PlayerID:PlayerID){
        return this.Midway[PlayerID]
    }

    GetLaidDownScene(PlayerID:PlayerID){
        return this.LaidDown[PlayerID]
    }

    GetReleaseScene(PlayerID:PlayerID){
        return this.ReleaseScene[PlayerID]
    }

    GetGraveScene(PlayerID:PlayerID){
        return this.Grave[PlayerID]
    }

}

