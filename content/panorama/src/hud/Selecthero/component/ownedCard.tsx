import React, { useEffect, useRef } from "react";
import { useGameEvent, useNetTableKey, useNetTableValues } from "react-panorama";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";
import { teamState } from "./pool";

export const OwendCard = ({...args}) => {
    const cardviewref = useRef<HeroImage|null>()
    const mainref = useRef<Panel|null>()

    useEffect(()=>{
        if(args.heroid != -1){
            cardviewref.current?.AddClass("bright")
        }
    },[args.heroid])

    return <Panel  ref={panel=>mainref.current = panel} className={args.player + "ownedCard"}>
            <Panel className={"Cardframe"}>
            <DOTAHeroImage hittest={false} ref={panel => cardviewref.current = panel} heroid={args.heroid as HeroID} heroimagestyle={"portrait"} className={args.player + "Card"}/>
            </Panel>
            <Label text={"英雄名字"} className={"goldenWord"}/>
            <Label text={args.heroid != -1 ? "已选择" : "等待..."}  />
        </Panel>
}