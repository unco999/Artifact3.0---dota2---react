import Queue from "../structure/Queue";

/**
 * @场景类下  有手牌  上 中 下路  正在释放场景 坟墓  牌堆
 */

import { LinkedList } from "../structure/Linkedlist";
import { Card, uuid } from "./Card";

type PlayerScene = Record<PlayerID, ICAScene> | {};


/**
 * @每个场景以拥有卡牌为核心
 */
export interface ICASceneManager {
    Hand: PlayerScene;   //手牌
    GoUp: PlayerScene;   //上路
    Midway: PlayerScene;  //中路
    LaidDown: PlayerScene; //下路
    ReleaseScene: PlayerScene; //下路
    Cardheaps: PlayerScene; //牌堆
    Grave: PlayerScene; // 坟墓
    registerCardheapsScene: (CAScene: ICAScene) => void;
}

export interface ICAScene {
    SceneName:string
    CaSceneManager: ICASceneManager;
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
}

/**牌堆 需要Heapsinit */
export class Cardheaps implements ICAScene {
    SceneName = 'Cardheaps'
    CaSceneManager: ICASceneManager;
    CardPool: Record<uuid, Card> = {};
    CardQueue : Queue;
    HeapsCount = 25;  //牌堆生成牌
    PlayerID:PlayerID

    constructor(PlayerID: PlayerID, ICASceneManager: ICASceneManager) {
        this.PlayerID = PlayerID
        ICASceneManager.registerCardheapsScene(this);
    }

    register(){
        this.CaSceneManager.Cardheaps[this.PlayerID] = this
    }

    Heapsinit(HeapsCardbuilder: IHeapsCardbuilder) {
        this.CardPool = HeapsCardbuilder.generator();
        this.CardQueue = HeapsCardbuilder.newqueue();
    }

    Remove(uuid: string) {
        this.CardPool[uuid] = null;
    }

    addCard(Card: Card): Card {
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

    dequeue():Card{
        const card =  this.CardQueue.dequeue() as Card
        print("打印ID",card.UUID)
        this.CardPool[card.UUID] = null
        return card
    }

}

/**场景管理类 */
export class ScenesManager implements ICASceneManager{
    Hand: PlayerScene = {};
    GoUp: PlayerScene = {};
    Midway: PlayerScene = {};
    LaidDown: PlayerScene = {}; 
    ReleaseScene: PlayerScene ={};
    Cardheaps: PlayerScene = {};
    Grave: PlayerScene = {};

    /**注册牌堆 */
    registerCardheapsScene(CAScene: ICAScene){
        this.Cardheaps[CAScene.PlayerID] = CAScene
    }

    /**注册手牌 */
    registerHandsScene(CAScene:ICAScene){
        this.Hand[CAScene.PlayerID] = CAScene
    }

    /**注册上路 */
    registerGoUpScene(CAScene:ICAScene){
        this.GoUp[CAScene.PlayerID] = CAScene
    }

    /**注册中路 */
    registerMidwayScene(CAScene:ICAScene){
        this.Midway[CAScene.PlayerID] = CAScene
    }
    
    /**注册下路 */
    registerLaidDownScene(CAScene:ICAScene){
         this.Midway[CAScene.PlayerID] = CAScene
    }

    /**注册释放场景 */
    registerReleaseScene(CAScene:ICAScene){
        this.Midway[CAScene.PlayerID] = CAScene
    }

    /**注册坟墓 */
    registerGraveScene(CAScene:ICAScene){
        this.Grave[CAScene.PlayerID] = CAScene
    }
}

