import { Ability, AbilityFactory } from "./Ability";
import { uuid } from "./centerScenes";
import { DamegeManeger } from "./DamegeManeger";
import { CardModifier, Effect } from "./modifier";
import { CardScenes } from "./scenes";
import { CardState } from "./state";

/**动画过渡由客户端完成激活事件回调给服务端   服务端不做任何异步处理 */
export class Card{
    uuid:string    //card的uuid
    name:string //card的名字
    CardOriginId:number //card的原始类型ID 模板
    CardScenes:CardScenes  //card的当前所在的场景信息
    State:CardState  //卡牌当前的状态 生命 血量 防御等
    Modifier:Effect[] = [] //卡牌当前被附加的modifier
    Ability:Ability[] = [] //该卡牌拥有的技能

    constructor(
        uuid:string,
        name:string,
        CardOriginId:number,
        State:CardState,
        Ability:Ability[]
    ){
        this.CardOriginId = CardOriginId
        this.name = name
        this.State = State
        this.Ability = Ability
        this.uuid = uuid
    }

    ClientOperate(){

    }

    fightSettlement(){
        
    }

    /**死亡 */
    Death(){
        
    }

    /**回合结算接口 */
    RoundSettlement(){
        // 进行modifier的遍历 每回合持续时间-1
        this.Modifier.forEach((modifer)=>{
            if(modifer.continuousRound == 0){
                modifer.Destory()
            }
            if(modifer.continuousRound != -1 && modifer.continuousRound > 0){
                modifer.continuousRound--
            }
        })
    }

    /**计算两张卡牌的场地关系 */
    Card2CardScenesrelation(Card:Card){
       return this.CardScenes.calculateSceneRelationship(Card.CardScenes)
    }

    /** 客户端尝试给该卡牌附加modifier */
    AddModifier(modifier:CardModifier){
       if(this.Modiferfilter(modifier)){
            const SceneEffect = this.Card2CardScenesrelation(modifier.OriginCard)
            this.Modifier.push(modifier.ModifierEffect[SceneEffect])
       }
    }

    /** 总数据结算 包括modifier*/
    totalDataSettlement(){
        const attribute = {attack:0,arrmor:0,health:0}
        for(const element of this.Modifier){
            attribute['attack'] = this.State.cardAttack + element.influentialAttack  ?? 0
            attribute['defense'] = this.State.cardarrmor + element.influentialDefense ?? 0
            attribute['health'] = this.State.cardheal + element.influentialHealth  ?? 0
        }
        return attribute
    }

    /**计算该modifer是否可以使用至此卡牌上 */
    Modiferfilter(modifer:CardModifier){
        return true
    }

}

export class BuildCard{
    _uuid:string
    _Ability:Ability[] = [] //该卡牌拥有的技能
    _State:CardState  //卡牌当前的状态 生命 血量 防御等
    _CardOriginId:number //card的原始类型ID 模板

    Build(CardOriginID:number){
        const data = GameRules.KV.GetCardDataKV(CardOriginID)
        const attack = data['attack']
        const arrmor = data['arrmor']
        const health = data['health']
        const name = data['name']
        const AbilityID:number[] = data['abilityid']
        this._State = new CardState(attack,arrmor,health)
        AbilityID.forEach((AbilityID)=>{
            this._Ability.push(GameRules.AbilityFactory.BUILD(AbilityID))
        })
        return new Card(DoUniqueString(name),name,this._CardOriginId,this._State,this._Ability)
    }

}