import Queue from "../structure/Queue";

/**
 * @场景类下  有手牌  上 中 下路  正在释放场景 坟墓  牌堆
 */

import { LinkedList } from "../structure/Linkedlist";
import { Card, uuid } from "./Card";
import { Timers } from "../lib/timers";
import { AbilityCard, SmallSkill, TrickSkill } from "./Ability";
import { Stack } from "../structure/Stack";
import { Unit } from "./Unit";

type PlayerScene = Record<number, Scenes | BattleArea> ;



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

    shuffle(){

    }

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
        if(this.Cardlinked.length == 1){
            this.Cardlinked = new LinkedList()
        }else{
            this.Cardlinked.remove(this.CardPool[uuid])
        }
        super.Remove(uuid)
        let index = 0
        for(const card of this.Cardlinked){
            index++
            card.Index = index
            CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(this.PlayerID),"S2C_SEND_INDEX",{[card.UUID]:card.Index})
        }
    }

    update_uuid(){
        return this.Cardlinked.toArray()
    }

}

export class BattleArea extends Scenes{
    CardList:Array<Card|-1> = [-1,-1,-1,-1,-1]

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager)
        this.PlayerID = PlayerID
        this.reigster_gamevent()
    }

    reigster_gamevent(){
        CustomGameEventManager.RegisterListener("TEST_C2S_CALL_CENTER",()=>{
            print("开始执行卡片居中")
            this.call_cetner()
        })
    }

    shuffle(){
        const stack = new Stack()
        const stack_number = new Stack()
        for(let key =  0; key < this.CardList.length ; key ++){
            if(this.CardList[key] != -1){
                stack.Push(this.CardList[key])
                stack_number.Push(key)
            }
        }
        stack_number.shuffle()
        this.CardList = [-1,-1,-1,-1,-1]
        while(stack.Size != 0){
             const card = stack.pop as Card
             const index = stack_number.pop as number
             this.CardList[index] = card
             card.Index = index
             card.update(card.Scene.SceneName)
        }
    }

    getbrachoption(){
        let mark = [-1,-1]
        for(let index = 0; index < 3 ; index ++){
            if(this.CardList[3 - index - 1] == -1   ){
                if(mark[0] == -1){
                    mark[0] = 3 - index
                }
            }
            if(this.CardList[3 + index - 1] == -1){
                if(mark[1] == -1){
                    mark[1] = 3 + index
                }
            }
            if(mark[0] != -1 || mark[1] != -1){
                 return mark
            }
        }
        return mark
    }

    Print(){
        for(let i = 0 ; i < this.CardList.length ; i++){
           if(this.CardList[i]!= -1){
               print("当前",this.SceneName,"的",i,"号位置","不为空********************")
           }else{
              print("当前",this.SceneName,"的",i,"号位置","空-------------------")
           }
        }
    }

    AutoAddCard(card:Card,index?:number){
        if(index){
            print("中路手動兼職",index)
            super.addCard(card)
            card.Index = index
            this.CardList[index - 1] = card
            return;
        }
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
        print("中路mark情況",mark)
        card.Index = mark
        card.Scene = this
        this.CardList[mark] = card
        this.CardPool[card.UUID] = card
        return card
    }

    Remove(uuid){
        for(let index = 0 ; index < this.CardList.length ; index ++){
           if((this.CardList[index]) instanceof Card){
               if((this.CardList[index] as Card).UUID == uuid){
                   this.CardList[index] = -1
                   this.CardPool[uuid] = null
               }
           }
        }
     }

     call_cetner(){
        this.CardList.forEach((card:Card)=>{
            if(card instanceof Unit){
                card.center()
            }
        })
     }

}

export class Midway extends BattleArea{
    SceneName = 'MIDWAY'

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(PlayerID,ICASceneManager)
        this.PlayerID = PlayerID
        ICASceneManager.SetMidwayScene(this);
    }
}
export class GoUp extends BattleArea{
    SceneName = 'GOUP'

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(PlayerID,ICASceneManager)
        this.PlayerID = PlayerID
        ICASceneManager.SetGoUpScene(this);
    }
}

export class LaidDown extends BattleArea{
    SceneName = 'LAIDDOWN'
    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(PlayerID,ICASceneManager)
        this.PlayerID = PlayerID
        ICASceneManager.SetLaidDownScene(this);
    }
}

//施法场景
export class Ability extends Scenes {
    SceneName = "ABILITY"

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager)
        this.PlayerID = PlayerID
        ICASceneManager.SetGraveScene(this);
    }
}

//坟墓场景
export class Grave extends Scenes {
    SceneName = "GRAVE"
    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager)
        this.PlayerID = PlayerID
        ICASceneManager.SetGraveScene(this);
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
    private Ability: PlayerScene = {};


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
            print("有牌要改變場景",event.to_scene,"改變的index為",event.index)
            if(!GameRules.gamemainloop.filter) return;
            this.change_secens(event.uuid,event.to_scene,event.index)
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
        CustomGameEventManager.RegisterListener("C2S_actingOnCard",(_,event)=>{
            if(this.All[event.attach] instanceof AbilityCard){
                (this.All[event.attach] as AbilityCard).SPEEL_TARGET(event.my)
            }        
        })
    }

    //**获得一个当前单位能加入的索引 */
    getoptionbrach(){

    }



    /** 附加给全局 ALL*/
    global_add(uuid:uuid,Card:Card){
        this.All[uuid] = Card
    }

    remove(uuid:uuid){
        this.All[uuid] = null
    }

    getAll(PlyaerID:PlayerID){
        const table = []
        for(const uuid in this.All){
            this.All[uuid].PlayerID == PlyaerID && table.push(uuid)
        }
        return table
    }

    get_All_summon(PlyaerID:PlayerID){
        const table = []
        for(const uuid in this.All){
            if(this.All[uuid].PlayerID == PlyaerID && this.All[uuid].type == 'Solider'){
                 table.push(uuid)
            }
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

    /**更新召唤物列表 */
    update_summon(){
        CustomNetTables.SetTableValue("Scenes","summon"+GameRules.Red.GetPlayerID(),this.get_All_summon(GameRules.Red.GetPlayerID()))
        CustomNetTables.SetTableValue("Scenes","summon"+GameRules.Blue.GetPlayerID(),this.get_All_summon(GameRules.Blue.GetPlayerID()))
    }

    /**牌改变场景*/
    change_secens(uuid:string,to:string,index?:number){
        const card = this.All[uuid]
        const playerid = card.PlayerID

        print(card.UUID,"要去",to)

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
                (this.GetMidwayScene(playerid) as Midway).AutoAddCard(card,index)
                this.All[uuid].update('MIDWAY')
                break;
            }
            case 'LAIDDOWN':{
                this.All[uuid].Scene.Remove(uuid);
                (this.GetLaidDownScene(playerid) as LaidDown).AutoAddCard(card,index)
                this.All[uuid].update('LAIDDOWN')
                break;
            }
            case 'GOUP':{
                this.All[uuid].Scene.Remove(uuid);
                (this.GetGoUpScene(playerid) as GoUp).AutoAddCard(card,index)
                this.All[uuid].update('GOUP')
                break;
            }
            case 'Ability':{
                this.All[uuid].Scene.Remove(uuid);
                this.GetAbilityScene(playerid).addCard(card)
                this.All[uuid].update('ABILITY')
                break;
            }
            case 'Grave':{
                this.All[uuid].Scene.Remove(uuid);
                this.GetGraveScene(playerid).addCard(card)
                this.All[uuid].update('GRAVE')
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

    
    SetGoUpScene(Scene:BattleArea){
        this.GoUp[Scene.PlayerID] = Scene
    }

    SetAbilityScene(Scene:Scenes){
        this.Ability[Scene.PlayerID] = Scene
    }

    SetMidwayScene(Scene:BattleArea){
        this.Midway[Scene.PlayerID] = Scene
    }

    SetLaidDownScene(Scene:BattleArea){
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

    GetAbilityScene(PlayerID:PlayerID){
        return this.Ability[PlayerID]
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

