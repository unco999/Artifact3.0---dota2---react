import React, { useEffect, useRef } from "react";
import { useNetTableKey } from "react-panorama";
import shortid from "shortid";
import { JsonString2Array } from "../../../Utils";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";
import { Card } from "./SelectCardCompoent";

export const teamState:Record<string,string> = {
    "BlueSelectstage" : 'blue',
    "RedSelectstage" : 'red'
}

export const Pool = ({...args}) => {
    const id = useUuid()
    const container = useInstance("Pool",id,{},undefined)
    const heroid = JsonString2Array(useNetTableKey("Card_group_construction_phase","heroThatCanChooseOnTheCurrentField"))
    const mainpanel = useRef<Panel[]|null>([])
    

    const toggle = (panel:Panel) => {
        panel.RemoveClass("born")
        $.Schedule(0.5,()=>panel.AddClass("born"))
    }

    const optional = (panel:Panel) => {
        if(args?.loopdata?.currentteam){
           if(args.playerteam[teamState[args.loopdata.currentteam]] === Players.GetLocalPlayer()){
                if(container?.getKeyString(Players.GetLocalPlayer() + "isselect") == null){
                    container?.SetKeyAny(Players.GetLocalPlayer() + "isselect",[undefined,undefined])
                }
                const isselect = container!.getKeyString<[number|undefined,number|undefined]>(Players.GetLocalPlayer() + "isselect")
                const selectindex = container?.getKeyString<number>(Players.GetLocalPlayer() + "selectindex")
                if(!selectindex) container?.SetKeyAny(Players.GetLocalPlayer() + "selectindex",0)
                isselect[container!.getKeyString<number>(Players.GetLocalPlayer() + "selectindex")] = panel.Data().id
           }else{
                container?.SetKeyAny(Players.GetLocalPlayer() + "isselect",[undefined,undefined])
                container?.SetKeyAny(Players.GetLocalPlayer() + "selectindex",0)
           }
        }
    }

    return <Panel className={"Pool"}>
        {heroid.map((value,index)=><Card onactivate={(Panel:Panel)=>optional(Panel)} onload={(panel:Panel)=>{toggle(panel);panel.Data().id = value}} key={"pool"+index + value} id={value}/>)}
    </Panel>
}