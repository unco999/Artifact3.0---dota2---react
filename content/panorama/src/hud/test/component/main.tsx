import React, { useEffect, useState } from "react";
import { useNetTableValues } from "react-panorama";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";

export const Main = () =>{
    const data = useNetTableValues("GameMianLoop")
    const [update,setupdate] = useState<boolean>(false)
    
    useEffect(()=>{
        $.Msg(data)
        $.Schedule(1,()=>setupdate(value=>!value))
    },[update])

    const openShop = () =>{
        $.Msg("好的")
        const container = ConpoentDataContainer.Instance.NameGetNode("equip_shop").current
        $.Msg(container)
        container.open()
    }

    return <Panel className={'testMain'}>
            <TextButton text={"临时测试内容"} className={"default"} onactivate={()=>$.Msg()}/>
            <TextButton text={"刷小兵"} className={"defualt"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_BRUSH_SOLIDER",{})}}/>
            <TextButton text={"结算后卡片居中"} className={"defualt"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("TEST_C2S_CALL_CENTER",{})}}/>
            <TextButton text={"伤害结算"} className={"defualt"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("TEST_C2S_CALL_ATTACK",{})}}/>
            <TextButton text={"攻击特效测试"} className={"default"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_CALL_ATTACK",{})}}/>
            <TextButton text={"能量上线+1"} className={"default"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_TEST_MAX_REDUCE",{})}}/>
            <TextButton text={"当前能量-1"} className={"default"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_TEST_REDUCE",{})}}/>
            <TextButton text={"随机增加一张装备牌"} className={"default"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_TEST_RANDOM_EQUIP",{})}}/>
        </Panel>
}