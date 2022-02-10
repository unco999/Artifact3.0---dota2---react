import React from "react";
import { useState } from "react";

export const StateCompoent = (props:{name:string,duration:string}) =>{
    $.Msg("创造了buffer",props.name)

    return <Panel className="StateCompoentMain"  onmouseover={panel=>$.DispatchEvent("DOTAShowTextTooltip",panel,`当前buff为${props.name},剩余回合${props.duration}`)} onmouseout={panel=>$.DispatchEvent('DOTAHideTextTooltip')}>
        <Image  className="StateCompoentImage">
            <Label text={props.duration ?? 0} className="StateCompoentLabel"/>
        </Image>
    </Panel>
}