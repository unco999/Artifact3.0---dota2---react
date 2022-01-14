import Queue from "../structure/Queue";

/**
 * @场景类下  有手牌  上 中 下路  正在释放场景 坟墓  牌堆
 */

import { LinkedList } from "../structure/Linkedlist";
import { Card, uuid } from "./Card";
import { Timers } from "../lib/timers";
import { AbilityCard, SmallSkill, TrickSkill } from "./Ability";
import { Stack } from "../structure/Stack";
import { Solider, Unit } from "./Unit";
import "./Ability";
import { brash_solidier } from "../feature/brush_solidier";
import { BATTLE_BRACH_STATE } from "../Manager/nettablefuc";

type PlayerScene = Record<number, Scenes | BattleArea>;



export interface ICAScene {
    SceneName: string;
    CaSceneManager: ScenesManager;
    CardPool: Record<uuid, Card>;
    PlayerID: PlayerID;
    Remove(uuid: uuid);
    addCard(Card: Card): Card;
    foreach(callback: (Card) => void);
    UUIDGet(uuid: uuid): Card;
    IndexGet(index: number): Card;
    getAll(): Card[];
    find_oppose: () => Scenes;
}

export interface IHeapsCardbuilder {
    generator(): Record<uuid, Card>;
    newqueue(): Queue;
    newtrickCard(): Queue;
}

export class Scenes implements ICAScene {
    SceneName: string;
    CaSceneManager: ScenesManager;
    CardPool: Record<uuid, Card> = {};
    PlayerID: PlayerID;

    shuffle() {

    }

    /**获得棋子数量 */
    get quantityOfChessPieces() {
        return table.maxn(this.CardPool);
    }

    getIndex(Card: Card) {
        return;
    }

    constructor(CaSceneManager: ScenesManager) {
        this.CaSceneManager = CaSceneManager;
    }


    find_oppose() {
        switch (this.SceneName) {
            case 'MIDWAY': {
                return GameRules.SceneManager.GetMidwayScene(this.PlayerID == GameRules.Blue.GetPlayerID() ? GameRules.Red.GetPlayerID() : GameRules.Blue.GetPlayerID());
            }
            case 'GOUP': {
                return GameRules.SceneManager.GetGoUpScene(this.PlayerID == GameRules.Blue.GetPlayerID() ? GameRules.Red.GetPlayerID() : GameRules.Blue.GetPlayerID());
            }
            case 'LAIDDOWN': {
                return GameRules.SceneManager.GetLaidDownScene(this.PlayerID == GameRules.Blue.GetPlayerID() ? GameRules.Red.GetPlayerID() : GameRules.Blue.GetPlayerID());
            }
        }
    }

    Remove(uuid: string) {
        this.CardPool[uuid] = null;
    }

    addCard(Card: Card): Card {
        this.CardPool[Card.UUID] = Card;
        return Card;
    }


    foreach(callback: (Card: Card, index: number) => void) {
        for (const key in this.CardPool) {
            callback(this.CardPool[key], +key);
        }
    }

    UUIDGet(uuid: string): Card {
        return this.CardPool[uuid];
    }

    IndexGet(index: number): Card {
        for (const key in this.CardPool) {
            if (this.CardPool[key].Index == index) {
                return this.CardPool[key];
            }
        }
        return undefined;
    }

    getAll(): Card[] {
        const list = [];
        this.foreach((card) => {
            list.push(card);
        });
        return list;
    }

    update_uuid() {
        const table = [];
        this.foreach((card) => {
            table.push(card.UUID);
        });
        return table;
    }

    /**打印当前分路的所有卡牌 */
    Print() {
        const table = this.CardPool;
        for (const key in table) {
            const card = table[key];
            print("当前分路", this.SceneName);
            print("卡牌", card.UUID, "索引", card.Index);
        }
    }

}

/**牌堆 需要Heapsinit */
export class Cardheaps extends Scenes {
    SceneName = "HEAPS";
    HeapsCount = 25;  //牌堆生成牌


    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager);
        this.PlayerID = PlayerID;
        ICASceneManager.SetCardheapsScene(this);
    }

    Remove(uuid: string) {
        print(uuid + "离开了牌堆");
        super.Remove(uuid);
    }


    /**随机抽取一张小技能 */
    Trick_ability_dequeue(): Card {
        const uuids = Object.keys(this.CardPool);
        let card: Card;
        while (!card) {
            const extract = this.CardPool[uuids[RandomInt(0, uuids.length)]];
            if (extract instanceof SmallSkill) {
                card = extract;
            }
        }
        print("抽取了技能卡牌", card.UUID);
        return card;
    }

    /**随机抽取一张大技能 */
    Small_ability_dequeue(): Card {
        const uuids = Object.keys(this.CardPool);
        let card: Card;
        while (!card) {
            const extract = this.CardPool[uuids[RandomInt(0, uuids.length)]];
            if (extract instanceof TrickSkill) {
                card = extract;
            }
        }
        print("抽取了技能卡牌", card.UUID);
        return card;
    }


}

/**手牌区 */
export class Hand extends Scenes {
    SceneName = 'HAND';
    Cardlinked: LinkedList<Card> = new LinkedList();

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager);
        this.PlayerID = PlayerID;
        ICASceneManager.SetHandsScene(this);
    }

    updateScene() {
        for (const card of this.Cardlinked) {
            CustomGameEventManager.Send_ServerToAllClients("S2C_CARD_CHANGE_SCENES", { Id: card.Id, Index: card.Index, Scene: this.SceneName, playerid: this.PlayerID, type: card.type, uuid: card.UUID, data: "" });
        }
    }

    /**重新排序一次 */
    again_sort() {
        let count = 1;
        for (const card of this.Cardlinked) {
            card.Index = count;
            count++;
        }
    }

    find_type(types: string[]) {
        const table: Card[] = [];
        for (const card of this.Cardlinked) {
            for (const type of types) {
                if (card.type == type) {
                    table.push(card);
                    break;
                }
            }
        }
        return table;
    }

    find_id_and_remove(id: string): boolean {
        let bool = false;
        for (const card of this.Cardlinked) {
            if (card.Id == id) {
                bool = true;
                GameRules.SceneManager.change_secens(card.UUID, "REMOVE");
                this.Cardlinked.remove(card);
                super.Remove(card.UUID);
            }
        }
        this.again_sort();
        return bool;
    }

    get max_index() {
        return this.Cardlinked.length;
    }

    addCard(Card: Card) {
        super.addCard(Card);
        Card.Scene = this;
        this.Cardlinked.append(Card);
        Card.Index = this.Cardlinked.length;
        print(Card.UUID, "是现在的卡牌序列", Card.Index);
        return Card;
    }

    Remove(uuid: uuid) {
        if (this.Cardlinked.length == 1) {
            this.Cardlinked = new LinkedList();
        } else {
            print("删除的cardpool", this.CardPool[uuid].UUID);
            this.Cardlinked.remove(this.CardPool[uuid]);
        }
        super.Remove(uuid);
        this.again_sort();
        this.update();
        print("运行了手牌规则 删除了", uuid, "当前数组长度:", this.Cardlinked.length);
    }


    update_uuid() {
        return this.Cardlinked.toArray();
    }

    update() {
        for (const card of this.Cardlinked) {
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_INDEX", { [card.UUID]: card.Index });
        }
    }

}

export abstract class BattleArea extends Scenes {
    CardList: Array<Card | number> = [-1, -1, -1, -1, -1];

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager);
        this.PlayerID = PlayerID;
        this.reigster_gamevent();
    }

    /**返回当前场景序号 */
    abstract GetSceneIndex()

    /**找最近空格 */
    GetrecentSpace(index:number) {
        for(let i = 0 ; i < 3 ; i++){
            if(this.CardList[index - 1 + i] == -1){
                return i
            }
            if(this.CardList[index - 1 - i] == -1){
                return i
            }
        }
        return -1
    }
    
    GetAllSpace(){
        const list = []
        for(let key = 0 ; key < this.CardList.length ; key ++){
            if(typeof(this.CardList[key]) == 'number') {
                list.push(key + 1)
            }else{
                list.push(-1)
            }
        }
        return list
    }

    reigster_gamevent() {
        CustomGameEventManager.RegisterListener("TEST_C2S_CALL_CENTER", () => {
            print("开始执行卡片居中");
            this.call_cetner();
        });
    }

    index_find(index: number) {
        return this.CardList[index];
    }

    /**若本路线满  返回ture */
    isFull() {
        return !this.CardList.includes(-1);
    }

    shuffle() {
        print("打印当前对垒");
        this.Print();
        const stack = new Stack();
        const stack_number = new Stack();
        for (let key = 0; key < this.CardList.length; key++) {
            if (this.CardList[key] != -1) {
                stack.Push(this.CardList[key]);
                stack_number.Push((this.CardList[key] as Card).Index);
            }
        }
        stack_number.shuffle();
        this.CardList = [-1, -1, -1, -1, -1];
        while (stack.Size != 0) {
            const card = stack.pop as Card;
            const index = stack_number.pop as number;
            this.CardList[index - 1] = card;
            card.Index = index;
        }
        this.CardList.forEach(card => {
            if (card instanceof Card) {
                card.update(card.Scene.SceneName);
            }
        });
    }

    getbrachoption(uuid?: string) {
        const _scenes = this.gridLocation();
        const index_array = _scenes.getAll().map(card => card.Index);
        let mark = [-1, -1, -1, -1, -1];
        index_array.forEach(index => {
            mark[index - 1] = index;
        });
        if (this.isNull()) {
            print("此路", this.SceneName, "为空");
            mark[2] = 3;
            return mark;
        }
        this.foreach(card => {
            if (card.UUID != uuid) {
                this.CardList[card.Index - 1 + 1] == -1 && (mark[card.Index - 1 + 1] = card.Index + 1);
                this.CardList[card.Index - 1 - 1] == -1 && (mark[card.Index - 1 - 1] = card.Index - 1);
            }
        });
        // let bool = true
        // this.foreach(card=>{
        //     if(card instanceof Card){
        //         bool = false
        //     }
        //     mark[card.Index - 1] = -1
        // })
        // if(!bool){
        //     this.CardList[3] = 3 
        // }
        print("当前路线为", this.SceneName);
        DeepPrintTable(mark);
        return mark;

    }

    isNull() {
        let bool = true;
        for (const key in this.CardPool) {
            if (this.CardPool[key]) {
                bool = false;
            }
        }
        return bool;
    }

    Print() {
        for (let i = 0; i < this.CardList.length; i++) {
            if (this.CardList[i] != -1) {
                print("当前", this.SceneName, "的", i, "号位置", "不为空********************");
            } else {
                print("当前", this.SceneName, "的", i, "号位置", "空-------------------");
            }
        }
    }

    AutoAddCard(card: Card, index?: number) {
        super.addCard(card);
        if (index && index != -1) {
            print("中路手動兼職", index);
            card.Index = index;
            this.CardList[index - 1] = card;
            return;
        }
        let mark;
        for (let index = 0; index < 4; index++) {
            if (this.CardList[3 - index - 1] === -1) {
                mark = 3 - index;
                break;
            }
            if (this.CardList[3 + index - 1] === -1) {
                mark = 3 + index;
                break;
            }
        }
        if (!mark) {
            print("自动加入路线出错了");
        }
        print("中路mark情況", mark);
        card.Index = mark;
        card.Scene = this;
        this.CardList[mark] = card;
        this.CardPool[card.UUID] = card;
        return card;
    }

    Remove(uuid) {
        for (let index = 0; index < this.CardList.length; index++) {
            if ((this.CardList[index]) instanceof Card) {
                if ((this.CardList[index] as Card).UUID == uuid) {
                    this.CardList[index] = -1;
                    this.CardPool[uuid] = null;
                    print("删除了", uuid, "序号为", index);
                    print("打印删除后的数据")
                    this.Print()
                }
            }
        }
    }

    /**找左边空位 */
    findleftnull() {
        for (let index = 3; index > 0; index--) {
            if (this.CardList[index - 1] == -1) {
                return index;
            }
        }
        return -1;
    }

    call_cetner() {
        const center = this.CardList[3];
        for (let index = 1; index < 3; index++) {
            if (this.CardList[3 - index - 1] != -1) {
                const leftcard = this.CardList[3 - index - 1] as Card;
                leftcard.right();
            }
            if (this.CardList[3 + index - 1] != -1) {
                const rightcard = this.CardList[3 + index - 1] as Card;
                rightcard.left();
            }
        }
        print("打印当前状况", this.SceneName);
        this.Print();
    }

    abstract gridLocation(): Scenes;

}

export class Midway extends BattleArea {
    SceneName = 'MIDWAY';

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(PlayerID, ICASceneManager);
        this.PlayerID = PlayerID;
        ICASceneManager.SetMidwayScene(this);
    }

    GetSceneIndex(){
        return 1
    }

    /**对格场景查找 */
    gridLocation() {
        return GameRules.SceneManager.GetMidwayScene(this.PlayerID == GameRules.Red.GetPlayerID() ? GameRules.Blue.GetPlayerID() : GameRules.Red.GetPlayerID());
    }

}
export class GoUp extends BattleArea {
    SceneName = 'GOUP';

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(PlayerID, ICASceneManager);
        this.PlayerID = PlayerID;
        ICASceneManager.SetGoUpScene(this);
    }

    
    GetSceneIndex(){
        return 0
    }


    gridLocation() {
        return GameRules.SceneManager.GetGoUpScene(this.PlayerID == GameRules.Red.GetPlayerID() ? GameRules.Blue.GetPlayerID() : GameRules.Red.GetPlayerID());
    }
}

export class LaidDown extends BattleArea {
    SceneName = 'LAIDDOWN';
    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(PlayerID, ICASceneManager);
        this.PlayerID = PlayerID;
        ICASceneManager.SetLaidDownScene(this);
    }

    
    GetSceneIndex(){
        return 2
    }


    gridLocation() {
        return GameRules.SceneManager.GetLaidDownScene(this.PlayerID == GameRules.Red.GetPlayerID() ? GameRules.Blue.GetPlayerID() : GameRules.Red.GetPlayerID());
    }
}

//施法场景
export class Ability extends Scenes {
    SceneName = "ABILITY";

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager);
        this.PlayerID = PlayerID;
        ICASceneManager.SetGraveScene(this);
    }
}

//坟墓场景
export class Grave extends Scenes {
    SceneName = "GRAVE";
    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager);
        this.PlayerID = PlayerID;
        ICASceneManager.SetGraveScene(this);
        this.register_gamevent();
    }

    register_gamevent() {
        CustomGameEventManager.RegisterListener("C2S_GET_GRAVE_ARRAY", () => this.Send_Client());
    }

    Send_Client() {
        const table = [];
        for (const key in this.CardPool) {
            table.push(this.CardPool[key].Id);
        }
        CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_GRAVE_ARRAY", table);
    }

    addCard(card: Card) {
        super.addCard(card);
        print(card.UUID, "加入了墓地！！！！");
        return card;
    }
}

export class Hide extends Scenes {
    SceneName = "HIDE";
    Cardlinked = new LinkedList<Card>();

    constructor(PlayerID: PlayerID, ICASceneManager: ScenesManager) {
        super(ICASceneManager);
        this.PlayerID = PlayerID;
        ICASceneManager.SetHideScene(this);
    }

    /**重新排序一次 */
    again_sort() {
        let count = 1;
        for (const card of this.Cardlinked) {
            card.Index = count;
            count++;
        }
    }

    find_id_and_remove(id: string): boolean {
        let bool = false;
        for (const card of this.Cardlinked) {
            if (card.Id == id) {
                bool = true;
                GameRules.SceneManager.change_secens(card.UUID, "REMOVE");
                this.Cardlinked.remove(card);
            }
        }
        return bool;
    }

    get max_index() {
        return this.Cardlinked.length;
    }

    addCard(Card: Card) {
        super.addCard(Card);
        this.Cardlinked.append(Card);
        Card.Index = this.Cardlinked.length;
        return Card;
    }

    Remove(uuid: uuid) {
        print("运行了手牌规则");
        if (this.Cardlinked.length == 1) {
            this.Cardlinked = new LinkedList();
        } else {
            this.Cardlinked.remove(this.CardPool[uuid]);
        }
        super.Remove(uuid);
        let index = 0;
        for (const card of this.Cardlinked) {
            index++;
            card.Index = index;
            CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(this.PlayerID), "S2C_SEND_INDEX", { [card.UUID]: card.Index });
        }
    }

    update() {
        for (const card of this.Cardlinked) {
            CustomGameEventManager.Send_ServerToAllClients("S2C_SEND_INDEX", { [card.UUID]: card.Index });
        }
    }

    updateScene() {
        for (const card of this.Cardlinked) {
            CustomGameEventManager.Send_ServerToAllClients("S2C_CARD_CHANGE_SCENES", { Id: card.Id, Index: card.Index, Scene: this.SceneName, playerid: this.PlayerID, type: card.type, uuid: card.UUID, data: "" });
        }
    }
}

/**场景管理类 */
export class ScenesManager {
    private All: Record<uuid, Card> = {};
    private Hand: PlayerScene = {};
    private GoUp: PlayerScene = {};
    private Midway: PlayerScene = {};
    private LaidDown: PlayerScene = {};
    private ReleaseScene: PlayerScene = {};
    private Cardheaps: PlayerScene = {};
    private Grave: PlayerScene = {};
    private Ability: PlayerScene = {};
    private Hide: PlayerScene = {};


    constructor() {
        this.register_game_event();
    }

    register_game_event() {
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
        /**上英雄卡牌时候   附带小兵刷新  如本路线为满  就不上小兵 */
        CustomGameEventManager.RegisterListener("C2S_CARD_CHANGE_SCENES", (_, event) => {
            if (!GameRules.gamemainloop.filter) return;
            const card = this.change_secens(event.uuid, event.to_scene, event.index);
            const newScenes = GameRules.SceneManager.GetScenes(event.to_scene, event.PlayerID) as BattleArea;
            GameRules.gamemainloop.small_solider_tag[event.PlayerID] = true;
            /** 本路线满了 不刷小兵*/
            if (newScenes.isFull()) return;
            const solider = GameRules.brash_solidier.AutoSolider(event.PlayerID, newScenes as BattleArea);
            if (RollPercentage(50)) {
                let card_index = card.Index;
                let solider_index = solider.Index;
                GameRules.SceneManager.change_secens(card.UUID, card.Scene.SceneName, solider_index);
                GameRules.SceneManager.change_secens(solider.UUID, solider.Scene.SceneName, card_index);
            }
        });
        CustomGameEventManager.RegisterListener("C2S_GET_SCENES", (_, event) => {
            switch (event.get) {
                case "HAND": {
                    CustomGameEventManager.Send_ServerToAllClients("S2C_GET_SCENES", this.GetHandsScene(event.PlayerID).update_uuid());
                }
            }
        });
        CustomGameEventManager.RegisterListener('C2S_GET_CANSPACE', (_, event) => {
            const table = {};
            const GoUp = (this.GetGoUpScene(event.PlayerID) as GoUp).getbrachoption(event.uuid);
            const LaidDown = (this.GetLaidDownScene(event.PlayerID) as LaidDown).getbrachoption(event.uuid);
            const Midway = (this.GetMidwayScene(event.PlayerID) as Midway).getbrachoption(event.uuid);
            table[0] = GoUp;
            table[1] = Midway;
            table[2] = LaidDown;
            print("分路打印");
            CustomGameEventManager.Send_ServerToPlayer(PlayerResource.GetPlayer(event.PlayerID), "S2C_SEND_CANSPACE", table);
        });
    }

    /**分路实例选择器 */
    fitler(option: BATTLE_BRACH_STATE, PlayerID: PlayerID) {
        switch (option) {
            case "1": {
                return GameRules.SceneManager.GetGoUpScene(PlayerID);
            }
            case "2": {
                return GameRules.SceneManager.GetMidwayScene(PlayerID);
            }
            case "3": {
                return GameRules.SceneManager.GetLaidDownScene(PlayerID);
            }
        }
    }


    //**获得一个当前单位能加入的索引 */
    getoptionbrach() {

    }

    /**对格查找 */
    gather(card: Card) {
        return card.Scene.find_oppose().IndexGet(card.Index);
    }

    /**敌人近邻查找 */
    enemyneighbor(Card: Card) {
        const left = Card.Scene.find_oppose().IndexGet(Card.Index - 1) as Unit ?? -1;
        const center = this.gather(Card) as Unit;
        const right = Card.Scene.find_oppose().IndexGet(Card.Index + 1) as Unit ?? -1;
        return { left: left, center: center, right: right };
    }

    /**友方近邻查找 */
    friendlyNeighbor(Card: Card) {
        const left = Card.Scene.IndexGet(Card.Index - 1) ?? -1;
        const right = Card.Scene.IndexGet(Card.Index + 1) ?? -1;
        return { left: left, right: right };
    }

    /**友方本路查找 */
    friendbrach(Card: Card) {
        return Card.Scene.getAll();
    }

    /**本路敌对查找 */
    enemybrach(Card: Card) {
        return Card.Scene.find_oppose().getAll();
    }

    /**敌人跨线或者全体 */
    enemyfindAll(Card: Card) {
        const goup = GameRules.SceneManager.GetGoUpScene(Card.PlayerID == GameRules.Blue.GetPlayerID() ? GameRules.Red.GetPlayerID() : GameRules.Blue.GetPlayerID());
        const midway = GameRules.SceneManager.GetMidwayScene(Card.PlayerID == GameRules.Blue.GetPlayerID() ? GameRules.Red.GetPlayerID() : GameRules.Blue.GetPlayerID());
        const laiddown = GameRules.SceneManager.GetLaidDownScene(Card.PlayerID == GameRules.Blue.GetPlayerID() ? GameRules.Red.GetPlayerID() : GameRules.Blue.GetPlayerID());
        const table = [...goup.getAll(), ...midway.getAll(), ...laiddown.getAll()];
        return table;
    }

    /**友方跨线或者全体 */
    friendfindAll(Card: Card) {
        const goup = GameRules.SceneManager.GetGoUpScene(Card.PlayerID);
        const midway = GameRules.SceneManager.GetMidwayScene(Card.PlayerID);
        const laiddown = GameRules.SceneManager.GetLaidDownScene(Card.PlayerID);
        const table = [...goup.getAll(), ...midway.getAll(), ...laiddown.getAll()];
        return table;
    }

    /**通过英雄名字找到卡片 */
    get_hero(name: string) {
        for (const uuid in this.All) {
            if (string.format(this.All[uuid].Id) == name) {
                print("找到一个相同的ID", name);
                return this.All[uuid];
            }
        }
        return null;
    }

    get_card(uuid:string){
        return this.All[uuid]
    }

    /** 附加给全局 ALL*/
    global_add(uuid: uuid, Card: Card) {
        this.All[uuid] = Card;
    }

    remove(uuid: uuid) {
        this.All[uuid] = null;
        this.update_summon();
        this.update();
    }

    getAll(PlyaerID: PlayerID) {
        const table = [];
        for (const uuid in this.All) {
            this.All[uuid].PlayerID == PlyaerID && table.push(uuid);
        }
        return table;
    }

    get_All_summon(PlyaerID: PlayerID) {
        const table = [];
        for (const uuid in this.All) {
            if (this.All[uuid].PlayerID == PlyaerID && this.All[uuid].type == 'Solider') {
                table.push(uuid);
            }
        }
        return table;
    }

    get_All_equip(PlyaerID: PlayerID) {
        const table = [];
        for (const uuid in this.All) {
            if (this.All[uuid].PlayerID == PlyaerID && this.All[uuid].type == "EQUIP") {
                table.push(uuid);
            }
        }
        return table;
    }

    get_All_Hero(PlyaerID: PlayerID) {
        const table = [];
        for (const uuid in this.All) {
            if (this.All[uuid].PlayerID == PlyaerID && this.All[uuid].type == "Hero") {
                table.push(uuid);
            }
        }
        return table;
    }


    get_All_Ability(PlyaerID: PlayerID) {
        const table = [];
        for (const uuid in this.All) {
            if (this.All[uuid].PlayerID == PlyaerID && this.All[uuid].type == "SmallSkill" || this.All[uuid].type == "TrickSkill") {
                table.push(uuid);
            }
        }
        return table;
    }

    /** 更新网表至nettable */
    update() {
        // const BlueGoUp = this.GoUp[GameRules.Blue.GetPlayerID()].update_uuid()
        // const RedGoUp = this.GoUp[GameRules.Red.GetPlayerID()].update_uuid()
        // const BlueLaidDown = this.LaidDown[GameRules.Blue.GetPlayerID()].update_uuid()
        // const RedLaidDown = this.LaidDown[GameRules.Red.GetPlayerID()].update_uuid()
        // const BlueReleaseScene = this.ReleaseScene[GameRules.Blue.GetPlayerID()].update_uuid()
        // const RedLReleaseScene = this.ReleaseScene[GameRules.Red.GetPlayerID()].update_uuid()
        // const BlueGrave = this.Grave[GameRules.Blue.GetPlayerID()].update_uuid()
        // const RedGrave = this.Grave[GameRules.Red.GetPlayerID()].update_uuid()
        CustomNetTables.SetTableValue("Scenes", "ALL" + GameRules.Red.GetPlayerID(), this.getAll(GameRules.Red.GetPlayerID()));
        CustomNetTables.SetTableValue("Scenes", "ALL" + GameRules.Blue.GetPlayerID(), this.getAll(GameRules.Blue.GetPlayerID()));
        // CustomNetTables.SetTableValue('Scenes',"GoUp" + GameRules.Blue.GetPlayerID(),BlueGoUp)
        // CustomNetTables.SetTableValue('Scenes',"GoUp" + GameRules.Red.GetPlayerID(),RedGoUp)
        // CustomNetTables.SetTableValue('Scenes',"LaidDown" + GameRules.Blue.GetPlayerID(),BlueLaidDown)
        // CustomNetTables.SetTableValue('Scenes',"LaidDown" + GameRules.Red.GetPlayerID(),RedLaidDown)
        // CustomNetTables.SetTableValue('Scenes',"ReleaseScene" + GameRules.Blue.GetPlayerID(),BlueReleaseScene)
        // CustomNetTables.SetTableValue('Scenes',"ReleaseScene" + GameRules.Red.GetPlayerID(),RedLReleaseScene)
        // CustomNetTables.SetTableValue('Scenes',"Grave" + GameRules.Blue.GetPlayerID(),BlueGrave)
        // CustomNetTables.SetTableValue('Scenes',"Grave" + GameRules.Red.GetPlayerID(),RedGrave)
        // this.update_summon();
        // this.update_equip();
        // this.update_hero()
        // this.update_Ability()
    }

    /**更新英雄卡牌 */
    update_hero() {
        CustomNetTables.SetTableValue("Scenes", "equip" + GameRules.Red.GetPlayerID(), this.get_All_Hero(GameRules.Red.GetPlayerID()));
        CustomNetTables.SetTableValue("Scenes", "equip" + GameRules.Red.GetPlayerID(), this.get_All_Hero(GameRules.Blue.GetPlayerID()));
    }

    /**更新技能卡牌 */
    update_Ability() {
        CustomNetTables.SetTableValue("Scenes", "Ability" + GameRules.Red.GetPlayerID(), this.get_All_Ability(GameRules.Red.GetPlayerID()));
        CustomNetTables.SetTableValue("Scenes", "Ability" + GameRules.Red.GetPlayerID(), this.get_All_Ability(GameRules.Blue.GetPlayerID()));
    }

    /**更新召唤物 */
    update_summon() {
        CustomNetTables.SetTableValue("Scenes", "summon" + GameRules.Red.GetPlayerID(), this.get_All_summon(GameRules.Red.GetPlayerID()));
        CustomNetTables.SetTableValue("Scenes", "summon" + GameRules.Blue.GetPlayerID(), this.get_All_summon(GameRules.Blue.GetPlayerID()));
    }

    /**更新装备卡牌 */
    update_equip() {
        CustomNetTables.SetTableValue("Scenes", "equip" + GameRules.Red.GetPlayerID(), this.get_All_equip(GameRules.Red.GetPlayerID()));
        CustomNetTables.SetTableValue("Scenes", "equip" + GameRules.Red.GetPlayerID(), this.get_All_equip(GameRules.Blue.GetPlayerID()));
    }


    /**牌改变场景*/
    change_secens(uuid: string, to: string, index?: number, update?: boolean) {
        const card = this.All[uuid];
        const playerid = card.PlayerID;

        print(card.UUID, "要去", to);
        switch (to) {
            case 'HAND': {
                const currentscnese = this.GetHandsScene(playerid);
                card.Scene.Remove(uuid);
                card.Scene = currentscnese;
                card.Scene.addCard(card);
                !update && this.All[uuid].update("HAND");
                break;
            }
            case 'MIDWAY': {
                const currentscnese = this.GetMidwayScene(playerid);
                this.All[uuid].Scene.Remove(uuid);
                (this.GetMidwayScene(playerid) as Midway).AutoAddCard(card, index);
                card.Scene = currentscnese;
                !update && this.All[uuid].update('MIDWAY');
                break;
            }
            case 'LAIDDOWN': {
                const currentscnese = this.GetLaidDownScene(playerid);
                this.All[uuid].Scene.Remove(uuid);
                (this.GetLaidDownScene(playerid) as LaidDown).AutoAddCard(card, index);
                card.Scene = currentscnese;
                !update && this.All[uuid].update('LAIDDOWN');
                break;
            }
            case 'GOUP': {
                const currentscnese = this.GetGoUpScene(playerid);
                this.All[uuid].Scene.Remove(uuid);
                (this.GetGoUpScene(playerid) as GoUp).AutoAddCard(card, index);
                card.Scene = currentscnese;
                !update && this.All[uuid].update('GOUP');
                break;
            }
            case 'ABILITY': {
                this.All[uuid].Scene.Remove(uuid);
                this.GetAbilityScene(playerid).addCard(card);
                card.Scene = this.GetAbilityScene(playerid)
                !update && this.All[uuid].update('ABILITY');
                break;
            }
            case 'Grave': {
                const currentscnese = this.GetGraveScene(playerid);
                this.All[uuid].Scene.Remove(uuid);
                card.Scene = currentscnese;
                card.Scene.addCard(card);
                !update && card.update('GRAVE');
                print(card.UUID, "死亡了 去了墓地");
                break;
            }
            case 'REMOVE': {
                this.All[uuid].Scene.Remove(uuid);
                !update && this.All[uuid].update('REMOVE');
                this.remove(uuid);
                break;
            }
            case 'HIDE': {
                card.Scene.Remove(uuid);
                const newScene = this.GetHideScene(playerid);
                card.Scene = newScene;
                card.Scene.addCard(card);
                !update && this.All[uuid].update('HIDE');
                break;
            }
        }
        return card;
    }

    /**获取字符串对应的场景 */
    GetScenes(ScneseString: string, playerid: PlayerID) {
        switch (ScneseString) {
            case 'HAND': {
                return this.GetHandsScene(playerid);
            }
            case 'MIDWAY': {
                return this.GetMidwayScene(playerid);
            }
            case 'LAIDDOWN': {
                return this.GetLaidDownScene(playerid);
            }
            case 'GOUP': {
                return this.GetGoUpScene(playerid);
            }
            case 'Ability': {
                return this.GetAbilityScene(playerid);
            }
            case 'Grave': {
                return this.GetGraveScene(playerid);
            }
            case 'HIDE': {
                return this.GetHideScene(playerid);
            }
        }
    }

    SetCardheapsScene(Scene: Cardheaps) {
        this.Cardheaps[Scene.PlayerID] = Scene;
    }

    SetHandsScene(Scene: Scenes) {
        this.Hand[Scene.PlayerID] = Scene;
    }


    SetGoUpScene(Scene: BattleArea) {
        this.GoUp[Scene.PlayerID] = Scene;
    }

    SetAbilityScene(Scene: Scenes) {
        this.Ability[Scene.PlayerID] = Scene;
    }

    SetMidwayScene(Scene: BattleArea) {
        this.Midway[Scene.PlayerID] = Scene;
    }

    SetLaidDownScene(Scene: BattleArea) {
        this.LaidDown[Scene.PlayerID] = Scene;
    }

    SetReleaseScene(Scene: Scenes) {
        this.ReleaseScene[Scene.PlayerID] = Scene;
    }

    SetGraveScene(Scene: Scenes) {
        this.Grave[Scene.PlayerID] = Scene;
    }

    SetHideScene(Scene: Scenes) {
        this.Hide[Scene.PlayerID] = Scene;
    }


    GetCardheapsScene(PlayerID: PlayerID): Cardheaps {
        return this.Cardheaps[PlayerID] as Cardheaps;
    }

    GetHandsScene(PlayerID: PlayerID) {
        return this.Hand[PlayerID];
    }

    GetAbilityScene(PlayerID: PlayerID) {
        return this.Ability[PlayerID];
    }

    GetHideScene(PlayerID: PlayerID) {
        return this.Hide[PlayerID];
    }

    GetGoUpScene(PlayerID: PlayerID) {
        return this.GoUp[PlayerID];
    }

    GetMidwayScene(PlayerID: PlayerID) {
        return this.Midway[PlayerID];
    }

    GetLaidDownScene(PlayerID: PlayerID) {
        return this.LaidDown[PlayerID];
    }

    GetReleaseScene(PlayerID: PlayerID) {
        return this.ReleaseScene[PlayerID];
    }

    GetGraveScene(PlayerID: PlayerID) {
        return this.Grave[PlayerID];
    }

}

