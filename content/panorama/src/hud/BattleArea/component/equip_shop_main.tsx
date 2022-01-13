import React, { useEffect, useRef, useState } from "react";
import { useNetTableValues } from "react-panorama";
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

    return<> 
        <Panel ref={panel=>ref.current = panel} className={"Euquip_Main"}>
        <Panel className={"Main_in"}>
        <Equip_box itemname={"item_ultimate_scepter"}/>
        <Equip_box itemname={"item_aegis"}/>
        <Equip_box itemname={"item_bfury"}/>
        <Equip_box itemname={"item_aghanims_shard"}/>
        <Equip_box itemname={"item_force_field"}/>
        </Panel>
    </Panel>
    <Panel ref={panel=>xref.current = panel} onactivate={()=>{$.Msg("点击了"); conponent.close()}} className={'exit'}>
        <Label text={"关闭界面"}/>
    </Panel>
    </>
}