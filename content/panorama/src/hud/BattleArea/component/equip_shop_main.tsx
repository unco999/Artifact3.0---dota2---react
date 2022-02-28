import React, { useEffect, useRef, useState } from "react";
import { useGameEvent, useNetTableValues } from "react-panorama";
import shortid from "shortid";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";
import { Equip_box } from "./equip_shop_box";

export const Equipd_shop_Main = (props:{onwenr:number}) =>{
    const uuid = useUuid()
    const {conponent,up} = useInstance("equip_shop",uuid,{},undefined)
    const ref = useRef<Panel|null>()
    const xref = useRef<Panel|null>()

    useEffect(()=>{
        if(conponent?.switch == true){
            ref.current?.RemoveClass("hide")
            xref.current?.RemoveClass("hide")
        }else{
            ref.current?.AddClass("hide")
            xref.current?.AddClass("hide")
        }
    },[conponent?.switch,up])

    useGameEvent("S2C_OPEN_EQUIP_SHOP",()=>{
        conponent?.open()
    },[conponent])

    return<> 
        <Panel ref={panel=>ref.current = panel} className={"Euquip_Main"}>
        <Panel className={"Main_in"}>
        <Equip_box itemname={"item_ultimate_scepter"} glod={2}/>
        <Equip_box itemname={"item_aegis"} glod={4}/>
        <Equip_box itemname={"item_bfury"} glod={3}/>
        <Equip_box itemname={"item_aghanims_shard"} glod={2}/>
        <Equip_box itemname={"item_force_field"} glod={4}/>
        <Equip_box itemname={"item_desolator"} glod={3}/>
        <Equip_box itemname={"item_radiance"} glod={3}/>
        <Equip_box itemname={"item_shivas_guard"} glod={3}/>
        <Equip_box itemname={"item_heart"} glod={3}/>
        <Equip_box itemname={"item_monkey_king_bar"} glod={3}/>
        <Draw/>
        </Panel>
    </Panel>
    <Panel ref={panel=>xref.current = panel} onactivate={()=>{$.Msg("点击了"); conponent.close()}} className={'exit'}>
        <Label text={"关闭界面"}/>
    </Panel>
    </>
}


const Draw = () =>{
    return <Panel className={"Equip_box"}>
    <Panel className={"Equip"}/>
    <Panel className={"buy"} style={{marginTop:'3px '}}>
    <Label text={"2金币"} style={{color:"gold"}}/>
    </Panel>
    <Panel className={"buy"}>
    <Label text={"抽牌"} onactivate={()=>{GameEvents.SendCustomGameEventToServer("C2S_GET_ONE_CARD",{})}} />
    </Panel>
</Panel>
}