import React, { useEffect, useRef } from "react";
import { useGameEvent, useNetTableKey, useNetTableValues } from "react-panorama";

export const OwendCard = ({...args}) => {
    const cardviewref = useRef<HeroImage|null>()

    useEffect(()=>{
        if(args.heroid != 0){
            cardviewref.current?.AddClass("bright")
        }
    },[args.heroid])

    return <Panel className={args.player + "ownedCard"}>
            <Label text={args.num} className={args.player + "num"}/>
            <DOTAHeroImage ref={panel => cardviewref.current = panel} heroid={args.heroid as HeroID} heroimagestyle={"portrait"} className={args.player + "Card"}/>
        </Panel>
}