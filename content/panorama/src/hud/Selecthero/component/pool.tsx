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
    const heroid = useNetTableKey("Card_group_construction_phase","heroThatCanChooseOnTheCurrentField")
    const heroselected = useNetTableKey("Card_group_construction_phase",'heroSelected') 
    const main = useRef<Panel|null>()
    const currentSelect = useRef([-1,-1])
    const cuurentSelcetIndex = useRef<boolean>(false)
    const SetCuurentSelect = (cuurent_selecet_hero_id:number) => {
        $.Msg(cuurentSelcetIndex.current)
        if(cuurentSelcetIndex.current){
            (currentSelect.current[1] = cuurent_selecet_hero_id) 
            cuurentSelcetIndex.current =! cuurentSelcetIndex.current
        }else{
            (currentSelect.current[0] = cuurent_selecet_hero_id)
            cuurentSelcetIndex.current =! cuurentSelcetIndex.current
        }
        conponent.SetKeyAny(Players.GetLocalPlayer() + "isselect",currentSelect.current)
    }
    const clearCurrntSelect = () => {
        currentSelect.current = [-1,-1]
        conponent.SetKeyAny(Players.GetLocalPlayer() + "isselect",currentSelect.current)
    }
    const isFull = () => {
        conponent.SetKeyAny(Players.GetLocalPlayer() + "isok",currentSelect.current[0] != -1 && currentSelect.current[1] != -1)
    }

    useEffect(()=>{
        if(!conponent) return
        clearCurrntSelect()
    },[args?.loopdata?.currentteam,conponent])

    useEffect(()=>{
        if(!conponent) return;
        conponent.SetKeyAny(Players.GetLocalPlayer() + "okselect",JsonString2Array(heroselected))
    },[heroselected])


    useEffect(()=>{
        if(args?.gameloop === 'branch'){
            main.current?.RemoveClass("show")
        }else{
            main.current?.AddClass("show")
        }
    },[args.gameloop])

    useEffect(()=>{
        $.Msg(heroid)
    },[heroid])


    const optional = (panel:Panel) => {
        $.Msg("当前选择玩家为",args?.loopdata?.currentteam)
        if( args.playerteam[teamState[args?.loopdata?.currentteam]] == Players.GetLocalPlayer()){
            SetCuurentSelect(panel.Data().id)
            isFull()
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


    const list = ()=>{
        const jsx_list = []
        for(const key in heroid){
            jsx_list.push(<Card onactivate={(Panel:Panel)=>optional(Panel)} onload={(panel:Panel)=>{panel.Data().id = heroid[key]}} key={"pool"+ key } id={heroid[key]}/>)
        }
        return jsx_list
    }



    return <Panel ref={Panel=>main.current = Panel} className={"Pool"}>
        {list()}
    </Panel>
}