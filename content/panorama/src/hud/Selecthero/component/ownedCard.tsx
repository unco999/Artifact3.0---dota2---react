import React, { useEffect, useRef } from "react";
import { useGameEvent, useNetTableKey, useNetTableValues } from "react-panorama";

export const OwendCard = ({...args}) => {
    const cardviewref = useRef<HeroImage|null>()
    const mainref = useRef<Panel|null>()

    useEffect(()=>{
        if(args.heroid != -1){
            cardviewref.current?.AddClass("bright")
        }
    },[args.heroid])

    const OnDragEnter = (panelId:any, draggedPanel:any) => {
        args.heroid === -1 && mainref.current?.AddClass("high")
    }

    const OnDragLeave = (panelId:any, draggedPanel:any) => {
        mainref.current?.RemoveClass("high")
    }

    useEffect(()=>{
        if(!mainref.current) return
        $.Msg(args.heroid,"执行了绑定")
        $.RegisterEventHandler( 'DragEnter', mainref.current,OnDragEnter);
        $.RegisterEventHandler( 'DragLeave', mainref.current,OnDragLeave);
    },[])

    return <Panel  draggable={true} ref={panel=>mainref.current = panel} className={args.player + "ownedCard"}>
            <Label hittest={false} text={args.num} className={args.player + "num"}/>
            <DOTAHeroImage hittest={false} ref={panel => cardviewref.current = panel} heroid={args.heroid as HeroID} heroimagestyle={"portrait"} className={args.player + "Card"}/>
        </Panel>
}