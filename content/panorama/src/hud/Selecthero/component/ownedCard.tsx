import React, { useEffect, useRef, useState } from "react";
import { DOTAHeroImageAttributes, useGameEvent, useNetTableKey, useNetTableValues } from "react-panorama";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";
import { teamState } from "./pool";

export const OwendCard = ({...args}) => {
    const cardviewref = useRef<HeroImage|null>()
    const mainref = useRef<Panel|null>()
    const [drag,setdrag] = useState(true)
    const branchok = useNetTableKey('Card_group_construction_phase','brachisok')

    useEffect(()=>{
        if(args.heroid != -1){
            cardviewref.current?.AddClass("bright")
            mainref.current && onload(mainref.current)
        }
    },[args.heroid])

    useEffect(()=>{
        if(branchok && branchok[Players.GetLocalPlayer()]){
            branchok[Players.GetLocalPlayer()] == 1 && setdrag(false)
        }
    },[branchok])

    const onload = (panel:Panel) => { 
        $.RegisterEventHandler( 'DragEnter', panel, OnDragEnter );
        $.RegisterEventHandler( 'DragDrop', panel, OnDragDrop );
        $.RegisterEventHandler( 'DragLeave', panel, OnDragLeave );
        $.RegisterEventHandler( 'DragStart', panel, OnDragStart );
        $.RegisterEventHandler( 'DragEnd',panel, OnDragEnd);
    }

    

    const OnDragStart = (panelId:any, dragCallbacks:any) =>{
        if(args.playerteam[args.player] != Players.GetLocalPlayer()) return 
        var displayPanel = $.CreatePanel( "DOTAHeroImage", $.GetContextPanel(), "test" ) as HeroImage
        // 在创建的那个panel里面保存一些数据，在其他的回调中可以用
        displayPanel.heroname = (GameUI?.CustomUIConfig() as any).CardHero?.CardGame[args.heroid]?.name ?? ""
        displayPanel.AddClass("dragicon")
        displayPanel.Data().heroid = args.heroid
        dragCallbacks.displayPanel = displayPanel;
        dragCallbacks.offsetX = 0; 
        dragCallbacks.offsetY = 0;
    }

    const OnDragEnd = (panelId:any, dragCallbacks:any) =>{
        dragCallbacks.DeleteAsync( 0 );
    }

    const OnDragLeave = () => {

    }

    const OnDragDrop = () =>{

    }

    const OnDragEnter = () =>{

    }

    return <Panel draggable={drag}   ref={panel=>mainref.current = panel} className={args.player + "ownedCard"}>
            <Panel className={"Cardframe"}>
            <DOTAHeroImage hittest={false} ref={panel => cardviewref.current = panel} heroname={(GameUI?.CustomUIConfig() as any).CardHero?.CardGame[args.heroid]?.name ?? ""} heroimagestyle={"portrait"} className={args.player + "Card"}/>
            </Panel>
            <Label text={"英雄名字"} className={"goldenWord"}/>
            <Label text={args.heroid != -1 ? "已选择" : "等待..."}  />
        </Panel>
}