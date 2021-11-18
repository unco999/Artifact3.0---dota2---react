import React from "react";

export const Main = () =>{
    return <Panel className={'testMain'}>
            <TextButton text={"刷小兵"} className={"defualt"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_BRUSH_SOLIDER",{})}}/>
        </Panel>
}