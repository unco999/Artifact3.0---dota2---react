import React, { useRef } from "react";
import shortid from "shortid";
import { Card } from "./SelectCardCompoent";

export const Pool = () => {
    const heroid = [1,2,3,4]
    const mainpanel = useRef<Panel[]|null>([])
    
    const OnDragStart = (panelId:any, dragCallbacks:any,index:number) =>{
        const displayPanel = $.CreatePanel( "DOTAHeroImage", $.GetContextPanel(), "test" )
        displayPanel.heroimagestyle = 'icon'
        displayPanel.heroid = heroid[index] as HeroID
        dragCallbacks.displayPanel = displayPanel;
        dragCallbacks.offsetX = -20; 
        dragCallbacks.offsetY = -20; 
    }

    const OnDragEnd = (panelId:any, dragCallbacks:any,index:number) => {
        dragCallbacks.DeleteAsync( 0 );
    }

    const OnDragLeave = (panelId:any, dragCallbacks:any,index:number) => {
        $.Msg("开始拖动了")
    }

    const OnDragDrop = (panelId:any, dragCallbacks:any,index:number) => {
        $.Msg("开始拖动了")
    }

    const OnDragEnter = (panelId:any, dragCallbacks:any,index:number) => {
        $.Msg(dragCallbacks)
    }

    const register = (panel:Panel,index:number) =>{
        $.Msg(index,"执行了绑定")//
        $.RegisterEventHandler( 'DragEnter', panel, (panelId:any, dragCallbacks:any,)=> OnDragEnter(panelId,dragCallbacks,index) );
        $.RegisterEventHandler( 'DragDrop', panel, (panelId:any, dragCallbacks:any,)=> OnDragDrop(panelId,dragCallbacks,index) );
        $.RegisterEventHandler( 'DragLeave', panel, (panelId:any, dragCallbacks:any,)=> OnDragLeave(panelId,dragCallbacks,index) );
        $.RegisterEventHandler( 'DragStart', panel, (panelId:any, dragCallbacks:any,)=> OnDragStart(panelId,dragCallbacks,index) );
        $.RegisterEventHandler( 'DragEnd', panel, (panelId:any, dragCallbacks:any,)=> OnDragEnd(panelId,dragCallbacks,index));
    } 

    return <Panel className={"Pool"}>
        {heroid.map((value,index)=><Card onload={(panel:any)=>register(panel,index)} key={shortid.generate()} id={value}/>)}
    </Panel>
}