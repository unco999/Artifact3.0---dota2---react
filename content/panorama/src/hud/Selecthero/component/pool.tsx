import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNetTableKey } from "react-panorama";
import shortid from "shortid";
import { JsonString2Array } from "../../../Utils";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";
import { Card } from "./SelectCardCompoent";

export const teamState:Record<string,string> = {
    "BlueSelectstage" : 'blue',
    "RedSelectstage" : 'red'
}

export const Pool = ({...args}) => {
    const id = useUuid()
    const {conponent,up} = useInstance("Pool",id,{},undefined)
    const heroid = JsonString2Array(useNetTableKey("Card_group_construction_phase","heroThatCanChooseOnTheCurrentField"))
    const heroselected = JsonString2Array(useNetTableKey("Card_group_construction_phase",'heroSelected'))
    const main = useRef<Panel|null>()



    useEffect(()=>{
        conponent?.SetKeyAny(Players.GetLocalPlayer() + "isselect",[undefined,undefined])
        conponent?.SetKeyAny(Players.GetLocalPlayer() + "selectindex",0)
    },[args?.loopdata?.currentteam])

    useEffect(()=>{
        if(args?.gameloop === 'branch'){
            main.current?.RemoveClass("show")
        }else{
            main.current?.AddClass("show")
        }
    },[args.gameloop])


    const optional = (panel:Panel) => {
        if(args?.loopdata?.currentteam){
           if(args.playerteam[teamState[args.loopdata.currentteam]] === Players.GetLocalPlayer()){
                if(filter(panel.Data().id) === 0) return
                if(conponent?.getKeyString(Players.GetLocalPlayer() + "isselect") == null){
                    conponent?.SetKeyAny(Players.GetLocalPlayer() + "isselect",[undefined,undefined])
                }
                const isselect = conponent!.getKeyString<[number|undefined,number|undefined]>(Players.GetLocalPlayer() + "isselect")
                const selectindex = conponent?.getKeyString<number>(Players.GetLocalPlayer() + "selectindex")
                if(!selectindex) conponent?.SetKeyAny(Players.GetLocalPlayer() + "selectindex",0)
                isselect[conponent!.getKeyString<number>(Players.GetLocalPlayer() + "selectindex")] = panel.Data().id
                if(args?.loopdata?.remainingOptionalQuantity == 2){
                    conponent?.SetKeyAny(Players.GetLocalPlayer() + "selectindex",conponent!.getKeyString<number>(Players.GetLocalPlayer() + "selectindex") == 1 ? 0 : 1)
                }
                let b:boolean = false
                for(const key in isselect){
                    if(isselect[key] != undefined){
                        b = true
                    }
                }
                okbutton(b)
           }else{
                conponent?.SetKeyAny(Players.GetLocalPlayer() + "isselect",[undefined,undefined])
                conponent?.SetKeyAny(Players.GetLocalPlayer() + "selectindex",0)
           }
        }
    }



    const okbutton = (bool:boolean)=> {
        const okbutton =ConpoentDataContainer.Instance.NameGetNode("okbutton").current
        if(bool){
            okbutton.addclassName("hight")
        }else{
            okbutton.addclassName("")
        }
    }

    const filter = (heroid:number) => {
        let bool = 1
        for(const key in heroselected){
            const heroided = heroselected[key]
            if(heroid == heroided){
                bool = 0
            }
        }
        return bool
    }

    const list = useMemo(()=>{
        const jsx_list = []
        for(const key in heroid){
            jsx_list.push(<Card onactivate={(Panel:Panel)=>optional(Panel)} filter={filter(heroid[key])} onload={(panel:Panel)=>{panel.Data().id = heroid[key]}} key={"pool"+ key + filter(heroid[key]) } id={heroid[key]}/>)
        }
        return jsx_list
    },[heroselected,heroid])



    return <Panel ref={Panel=>main.current = Panel} className={"Pool"}>
        {list}
    </Panel>
}