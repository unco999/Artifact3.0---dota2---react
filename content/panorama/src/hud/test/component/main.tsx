import React from "react";

export const Main = () =>{
    return <Panel className={'testMain'}>
            <TextButton text={"刷小兵"} className={"defualt"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_BRUSH_SOLIDER",{})}}/>
            <TextButton text={"结算后卡片居中"} className={"defualt"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("TEST_C2S_CALL_CENTER",{})}}/>
            <TextButton text={"伤害结算"} className={"defualt"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("TEST_C2S_CALL_ATTACK",{})}}/>
            <TextButton text={"攻击特效测试"} className={"default"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_CALL_ATTACK",{})}}/>
        </Panel>
}