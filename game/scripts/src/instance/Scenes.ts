import Queue from "../structure/Queue";

/**
 * @场景类下  有手牌  上 中 下路  正在释放场景 坟墓  牌堆
 */

import { LinkedList } from "../structure/Linkedlist";
import { Card, uuid } from "./Card";

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
    // newtrickCard():Queue
}

export class Scenes implements ICAScene{
    SceneName: string;
    CaSceneManager: ScenesManager;
    CardPool: Record<string, Card> = {};    
    PlayerID: PlayerID;

    constructor(CaSceneManager:ScenesManager){
        this.CaSceneManager = CaSceneManager
    }

    Remove(uuid: string) {
        this.CardPool[uuid] = null;
    }

    addCard(Card: Card): Card {
        this.CardPool[Card.UUID] = Card;
        Card.Scene = this
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
    SceneName = "Cardheaps"
    CardPool: Record<uuid, Card> = {};
    CardQueue:Queue;
    trickCard:Queue
    HeapsCount = 25;  //牌堆生成牌

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager)
        this.PlayerID = PlayerID
        ICASceneManager.SetCardheapsScene(this);
    }

    Heapsinit(HeapsCardbuilder: IHeapsCardbuilder) {
        this.CardPool = HeapsCardbuilder.generator();
        this.CardQueue = HeapsCardbuilder.newqueue();
        // this.trickCard = HeapsCardbuilder.newtrickCard();
    }

    /**小技能出队 */
    small_ability_dequeue():Card{
        const card =  this.CardQueue.dequeue() as Card
        print("打印ID",card.UUID)
        this.CardPool[card.UUID] = null
        return card
    }
    
    /**大招出队*/
    trick_abilidy_dequeue():Card{
        const card =  this.trickCard.dequeue() as Card
        print("打印ID",card.UUID)
        this.CardPool[card.UUID] = null
        return card
    }

    

}

/**手牌区 */
export class Hand extends Scenes{
    SceneName = 'Hand'

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager)
        this.PlayerID = PlayerID
        ICASceneManager.SetHandsScene(this);
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


    register_game_event(){
        CustomGameEventManager.RegisterListener("C2S_CARD_CHANGE_SCENES",(_,event)=>{
            if(!GameRules.gamemainloop.filter) return;
            this.change_secens(event.uuid,event.to_scene)
            if(this.All[event.uuid]){
                this.All[event.uuid].update(event.to_scene)
            }
            this.update()
        })
    }

    /** 附加给全局 ALL*/
    global_add(uuid:uuid,Card:Card){
        this.All[uuid] = Card
    }

    /** 更新网表至nettable */
    update(){
        const BlueCardheaps = this.GetCardheapsScene(GameRules.Blue.GetPlayerID()).update_uuid()
        const RedCardheaps = this.GetCardheapsScene(GameRules.Red.GetPlayerID()).update_uuid()
        const BlueHand = this.GetHandsScene(GameRules.Blue.GetPlayerID()).update_uuid()
        const RedHand = this.GetHandsScene(GameRules.Red.GetPlayerID()).update_uuid()
        // const BlueGoUp = this.GoUp[GameRules.Blue.GetPlayerID()].update_uuid()
        // const RedGoUp = this.GoUp[GameRules.Red.GetPlayerID()].update_uuid()
        // const BlueMidway = this.Midway[GameRules.Blue.GetPlayerID()].update_uuid()
        // const RedMidway = this.Midway[GameRules.Red.GetPlayerID()].update_uuid()
        // const BlueLaidDown = this.LaidDown[GameRules.Blue.GetPlayerID()].update_uuid()
        // const RedLaidDown = this.LaidDown[GameRules.Red.GetPlayerID()].update_uuid()
        // const BlueReleaseScene = this.ReleaseScene[GameRules.Blue.GetPlayerID()].update_uuid()
        // const RedLReleaseScene = this.ReleaseScene[GameRules.Red.GetPlayerID()].update_uuid()
        // const BlueGrave = this.Grave[GameRules.Blue.GetPlayerID()].update_uuid()
        // const RedGrave = this.Grave[GameRules.Red.GetPlayerID()].update_uuid()
        print("打印排毒is是是")
        DeepPrintTable(BlueCardheaps)
        DeepPrintTable(RedCardheaps)
        CustomNetTables.SetTableValue('Scenes',"Cardheaps" + GameRules.Blue.GetPlayerID(),BlueCardheaps)
        CustomNetTables.SetTableValue('Scenes',"Cardheaps" + GameRules.Red.GetPlayerID(),RedCardheaps)
        CustomNetTables.SetTableValue('Scenes',"Hand" + GameRules.Blue.GetPlayerID(),BlueHand)
        CustomNetTables.SetTableValue('Scenes',"Hand" + GameRules.Red.GetPlayerID(),RedHand)
        // CustomNetTables.SetTableValue('Scenes',"GoUp" + GameRules.Blue.GetPlayerID(),BlueGoUp)
        // CustomNetTables.SetTableValue('Scenes',"GoUp" + GameRules.Red.GetPlayerID(),RedGoUp)
        // CustomNetTables.SetTableValue('Scenes',"BlueMidway" + GameRules.Blue.GetPlayerID(),BlueMidway)
        // CustomNetTables.SetTableValue('Scenes',"RedMidway" + GameRules.Red.GetPlayerID(),RedMidway)
        // CustomNetTables.SetTableValue('Scenes',"LaidDown" + GameRules.Blue.GetPlayerID(),BlueLaidDown)
        // CustomNetTables.SetTableValue('Scenes',"LaidDown" + GameRules.Red.GetPlayerID(),RedLaidDown)
        // CustomNetTables.SetTableValue('Scenes',"ReleaseScene" + GameRules.Blue.GetPlayerID(),BlueReleaseScene)
        // CustomNetTables.SetTableValue('Scenes',"ReleaseScene" + GameRules.Red.GetPlayerID(),RedLReleaseScene)
        // CustomNetTables.SetTableValue('Scenes',"Grave" + GameRules.Blue.GetPlayerID(),BlueGrave)
        // CustomNetTables.SetTableValue('Scenes',"Grave" + GameRules.Red.GetPlayerID(),RedGrave)
    }

    /**牌改变场景*/
    change_secens(uuid:string,to:string){
        const card = this.All[uuid]
        const playerid = card.PlayerID

        switch(to){
            case 'HAND':{
                this.All[uuid].Scene.Remove(uuid)
                this.All[uuid].update("HAND")
                this.GetHandsScene(playerid).addCard(card)
                print(this.All[uuid].Scene.SceneName)
                break;
            }
            case 'MIDWAY':{
                this.All[uuid].Scene.Remove(uuid)
                this.GetMidwayScene(playerid).addCard(card)
                this.All[uuid].update('MIDWAY')
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
        print("打印當前牌库")
        DeepPrintTable(this.Cardheaps[PlayerID])
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

