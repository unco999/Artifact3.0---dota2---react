import React from "react";

export const Equip_box = (props:{itemname:string}) => {
    return <Panel className={"Equip_box"}>
            <DOTAItemImage itemname={props.itemname} className={"Equip"}/>
            <Panel className={"buy"} style={{marginTop:'3px '}}>
            <Label text={"2金币"} style={{color:"gold"}}/>
            </Panel>
            <Panel className={"buy"}>
            <Label text={"购买"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_BUY_ITEM",{itemname:props.itemname})} } />
            </Panel>
        </Panel>
}