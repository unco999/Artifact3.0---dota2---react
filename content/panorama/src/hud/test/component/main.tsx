import React, { useEffect, useMemo, useState } from "react";
import { useNetTableKey, useNetTableValues } from "react-panorama";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";

export const Main = () =>{
    const data = useNetTableValues("GameMianLoop")
    const team = useNetTableKey("Card_group_construction_phase","team")
    const [update,setupdate] = useState<boolean>(false)
    const list = useMemo(() =>{
        const _list = []
        for(let i = 55 ; i < 120 ; i++) {
            _list.push(i)
        }
        return _list
    },[])
    
    useEffect(()=>{
        $.Schedule(1,()=>setupdate(value=>!value))
    },[update])

    const openShop = () =>{
        const container = ConpoentDataContainer.Instance.NameGetNode("equip_shop").current
        container.open()
    }

    return <Panel className={'testMain'}>
            <TextButton text={"临时测试内容"} className={"default"} onactivate={()=>$.Msg()}/>
            <TextButton text={"刷小兵"} className={"defualt"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_BRUSH_SOLIDER",{})}}/>
            <TextButton text={"结算后卡片居中"} className={"defualt"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("TEST_C2S_CALL_CENTER",{})}}/>
            <TextButton text={"伤害结算"} className={"defualt"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("TEST_C2S_CALL_ATTACK",{})}}/>
            <TextButton text={"从牌库抽大招"} className={"default"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_GET_ABILITY_T",{})}}/>
            <TextButton text={"从牌库抽一张技能牌"} className={"default"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_GET_ABILITY_CARD",{})}}/>
            <TextButton text={"当前能量-1"} className={"default"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_TEST_REDUCE",{})}}/>
            <TextButton text={"随机增加一张装备牌"} className={"default"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_TEST_RANDOM_EQUIP",{})}}/>
            <TextButton text={"本方全队晕眩"} className={"default"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_ALL_Stun",{})}}/>
            <TextButton text={"本方全部阵亡"} className={"default"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("TEST_ALL_DEATCH",{})}}/>
            <TextButton text={"红方点出牌"} className={"default"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_RED_SEND_PlayCard",{player:team.red as PlayerID})}}/>
            <TextButton text={"红方点跳过"} className={"default"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_RED_SEND_SKIP",{player:team.red as PlayerID})}}/>
            <Panel style={{flowChildren:'right-wrap',width:'100%',height:'100%'}}>
            </Panel>
        </Panel>
}