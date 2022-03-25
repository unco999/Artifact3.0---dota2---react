import React, { useEffect, useRef } from "react";

export const Equip_box = (props:{itemname:string,glod:number}) => {
    const ref = useRef<ItemImage|null>()
    
    const mouseover = (panel:Panel) =>{
        $.DispatchEvent("DOTAShowTitleTextTooltipStyled",panel!,$.Localize("#custom_"+ props.itemname),$.Localize("#custom_"+ props.itemname+"_Description"),"tip");
    }

    const mouseout = (panel:Panel) =>{
        $.DispatchEvent("DOTAHideTitleTextTooltip",panel!)
    }

    return <Panel className={"Equip_box"}>
            <DOTAItemImage onmouseover={(panel)=>mouseover(panel)} onmouseout={(penel)=>mouseout(penel)} itemname={props.itemname} className={"Equip"} showtooltip={false}/>
            <Panel className={"buy"} style={{marginTop:'3px '}}>
            <Label text={`${props.glod}金币`} style={{color:"gold"}}/>
            </Panel>
            <Panel className={"buy"}>
            <Label text={"购买"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_BUY_ITEM",{itemname:props.itemname,glod:props.glod})} } />
            </Panel>
        </Panel>
}