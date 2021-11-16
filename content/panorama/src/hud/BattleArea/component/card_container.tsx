/** 战场上用于显示空格的容器  可做拖入卡牌操作  而实际卡牌并不在此容器里 */

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useGameEvent } from "react-panorama";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";

export const Card_container = (props:{className:string,index:number,brach:number,onwer:number}) => {
    const mian = useRef<Panel|null>()
    const uuid = useUuid()
    const container = useInstance("Card_container",uuid,{},undefined,"Card_container")

    useGameEvent("S2C_SEND_CANSPACE",(event)=>{
        $.Msg(event)
        for(const brach in event){
            for(const index in event[brach]){
                if(+brach == props.brach && +event[brach][index] == props.index){
                    $.Msg("有板通过了检测",props.brach,"-",props.index)
                    mian.current?.AddClass("show")    
                }    
            }
        }
    },[])

    useEffect(()=>{
        if(props.onwer == Players.GetLocalPlayer()){
            $.RegisterEventHandler( 'DragDrop', mian.current!, OnDragDrop );
            $.RegisterEventHandler( 'DragEnter', mian.current!, OnDragEnter );
        }
    },[])

    const OnDragEnter = (panelId:any, dragCallbacks:any) => {
        $.Msg("板子拖入了")
    }

    const OnDragDrop = (panelId:any, dragCallbacks:any) => {
        let scene = ""
        switch(props.brach){
            case 0:{
                scene = "GOUP";
                break
            }
            case 1:{
                scene = "MIDWAY";
                break
            }
            case 2:{
                scene = "LAIDDOWN"
                break
            }
        }
        GameEvents.SendCustomGameEventToServer("C2S_CARD_CHANGE_SCENES",{to_scene:scene,index:props.index,uuid:dragCallbacks.Data().uuid})
    }


    useEffect(()=>{
        $.Msg("當前面模開關")
        !container?.switch && mian.current?.RemoveClass("show")
    })

    return <Panel ref={Panel=>mian.current = Panel} className={"up"}>
            <Label hittest={false} text={props.index}/>
        </Panel>
}