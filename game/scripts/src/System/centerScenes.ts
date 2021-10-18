import { Card } from "./card";
import { DamegeManeger } from "./DamegeManeger";
import { Tower } from "./Tower";


export type uuid = string;
type route = "left" | "center" | "right";
type index = number;
type battertable = {
    [key: string]: SceneRecordInstance;
};
type handCardtable = {
    [key: string]: HandRecordInstance;
};
/** 场景实例 写成一个类方便事件可以调用该场景的Card进行操作 */
class SceneRecordInstance {
    _identifier: string;
    _haveCard: Record<uuid, Card> = {};

    constructor(identifier: string) {
        this._identifier = identifier;
        this.RegisterGamEvent();
    }

    RegisterGamEvent() {
        CustomGameEventManager.RegisterListener("SCENES_INSTANCE", (_, event) => {
            const oparation = event.oparation;
            const eva = event.eva;
            if (this.filter(oparation)) {
                this.call(eva);
            }
        });
    }

    call(eva: any) {

    }

    /** 过滤器   从表中筛选当前client的指令  进行card操作 */
    filter(str: string[]) {
        let boolean = false;
        if (this._identifier === 'ALL') boolean = true;
        str.forEach((str) => {
            if (this._identifier.indexOf(str) > -1) {
                boolean = true;
            }
        });
        return boolean;
    }

    CardBoard(uuid: uuid) {

    }

    FindHandCrad(uuid: uuid) {

    }
}

class routeRecordInstance extends SceneRecordInstance {
    _indexCrad: Record<index, Card | null> = {};

}


class HandRecordInstance {
    _identifier: string;
    _haveCard: Record<uuid, Card> = {};

    constructor(identifier: string) {
        this._identifier = identifier;
        this.RegisterGamEvent();
    }

    RegisterGamEvent() {
        CustomGameEventManager.RegisterListener("HAND", (_, event) => {
            const oparation = event.oparation;
            const eva = event.eva;
            if (this.filter(oparation)) {
                this.call(eva);
            }
        });
    }

    RemoveHandCard(uuid: uuid) {
        this._haveCard[uuid] = null;
    }

    AddHandCard(uuid: uuid, template: number) {

    }

    call(eva: any) {

    }

    /** 过滤器   从表中筛选当前client的指令  进行card操作 */
    filter(str: string[]) {
        let boolean = false;
        if (this._identifier === 'ALL') boolean = true;
        str.forEach((str) => {
            if (this._identifier.indexOf(str) > -1) {
                boolean = true;
            }
        });
        return boolean;
    }

}

/** 中心战场控制器 */
export class CenterScene {

    battletable = {
        AllPresentCollectCard: new SceneRecordInstance("ALL"), // 所有在场地上的单位
        RedPresentCollectCard: new SceneRecordInstance("REDALL"), // 所有红队在场地的单位
        BluePresentCollectCard: new SceneRecordInstance("BLUEALL"), // 所有蓝队在场地的单位
        LeftPresentCollectCard: new SceneRecordInstance("LEFTALL"), // 所有左路的单位
        CenterPresentCollectCard: new SceneRecordInstance("CENTERALL"), // 所有中路的单位
        RightPresentCollectCard: new SceneRecordInstance("RIGHTALL"), //所有右路的单位
        RedLeftPresentCollectCard: new routeRecordInstance("LEFTRED"), //红队左路
        RedCenterPresentCollectCard: new routeRecordInstance("REDCENTER"), //红队中路
        RedRightPresentCollectCard: new routeRecordInstance("REDRIGHT"), //红队右路
        BlueLeftPresentCollectCard: new routeRecordInstance("BLUELEFT"), //蓝队左路
        BlueCenterPresentCollectCard: new routeRecordInstance("BLUECENTER"), //蓝队中路
        BlueRightPresentCollectCard: new routeRecordInstance("BLUERIGHT"), //蓝队右路
    };

    handCardtable = {
        AllCard: new HandRecordInstance("ALL"), // 所有手牌
        BluehandCard: new HandRecordInstance("BLUE"), // 蓝隊手牌
        RedhandCard: new HandRecordInstance("RED"), //  红队手牌
    };

    tower = {
        RedLeftTower:new Tower(GameRules.Red.GetPlayerID(),1),
        RedCenterTower:new Tower(GameRules.Red.GetPlayerID(),2),
        RedRightTower:new Tower(GameRules.Red.GetPlayerID(),3),
        BlueLeftTower:new Tower(GameRules.Blue.GetPlayerID(),1),
        BlueCenterTower:new Tower(GameRules.Blue.GetPlayerID(),2),
        BlueRightTower:new Tower(GameRules.Blue.GetPlayerID(),3),
    }

    /**左线路结算 */
    LeftlineSettlement() {
        const red_left = this.battletable.RedLeftPresentCollectCard._indexCrad;
        const blue_left = this.battletable.BlueLeftPresentCollectCard._indexCrad;
        const damagetable:Record<number,DamegeManeger> = {}
        for (let key = 0; key < 5; key++) {
            damagetable[key] = new DamegeManeger(red_left[key], blue_left[key]);
        }
        const id = CustomGameEventManager.RegisterListener("LEFT_LINE_SETTLEMENT_ATTACK_OVER",()=>{
            for(const key in damagetable){
                damagetable[key].run()
            }
            CustomGameEventManager.UnregisterListener(id)
        })
        CustomGameEventManager.Send_ServerToAllClients("LEFT_LINE_SETTLEMENT",{})
    }


    /**中线路结算 */
    CenterlineSettlement() {
        const red_left = this.battletable.RedCenterPresentCollectCard._indexCrad;
        const blue_left = this.battletable.BlueCenterPresentCollectCard._indexCrad;
        const damagetable:Record<number,DamegeManeger> = {}
        for (let key = 0; key < 5; key++) {
            damagetable[key] = new DamegeManeger(red_left[key], blue_left[key]);
        }
        const id = CustomGameEventManager.RegisterListener("CENTE_LINE_SETTLEMENT_ATTACK_OVER",()=>{
            for(const key in damagetable){
                damagetable[key].run()
            }
            CustomGameEventManager.UnregisterListener(id)
        })
        CustomGameEventManager.Send_ServerToAllClients("CENTE_LINE_SETTLEMENT",{})
    }

    /**右线路结算 */
    RightlineSettlement() {
        const red_left = this.battletable.RedRightPresentCollectCard._indexCrad;
        const blue_left = this.battletable.BlueRightPresentCollectCard._indexCrad;
        const damagetable:Record<number,DamegeManeger> = {}
        for (let key = 0; key < 5; key++) {
            damagetable[key] = new DamegeManeger(red_left[key], blue_left[key]);
        }
        const id = CustomGameEventManager.RegisterListener("RIGHT_LINE_SETTLEMENT_ATTACK_OVER",()=>{
            for(const key in damagetable){
                damagetable[key].run()
            }
            CustomGameEventManager.UnregisterListener(id)
        })
        CustomGameEventManager.Send_ServerToAllClients("RIGHT_LINE_SETTLEMENT",{})
    }
}