/** 战场上用于显示空格的容器  可做拖入卡牌操作  而实际卡牌并不在此容器里 */

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useGameEvent } from "react-panorama";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";

export const Card_container = (props:{className:string,index:number,brach:number,onwer:number}) => {
    const mian = useRef<Panel|null>()
    const uuid = useUuid()
    const {conponent,up} = useInstance("Card_container",uuid,{},undefined)

    useGameEvent("S2C_SEND_CANSPACE",(event)=>{
        $.Msg("收到数据包")
        $.Msg(event)
        for(const brach in event){
            for(const index in event[brach]){
                if(+brach == props.brach && +event[brach][index] != -1 && +index == props.index){
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
    }

    const OnDragDrop = (panelId:any, dragCallbacks:any) => {
        const card_container_list = ConpoentDataContainer.Instance.NameGetGrap("Card_container").current
        card_container_list.forEach(container =>{
            container.close()
        })
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
        $.Msg("当前客户端传入index",props.index)
        GameEvents.SendCustomGameEventToServer("C2S_CARD_CHANGE_SCENES",{to_scene:scene,index:props.index,uuid:dragCallbacks.Data().uuid})
    }


    useEffect(()=>{
        $.Msg("触发了关闭",conponent?.switch)
        !conponent?.switch && mian.current?.RemoveClass("show")
    },[up])

    return <Panel ref={Panel=>mian.current = Panel} className={"up"}>
            <Label hittest={false} text={props.index}/>
        </Panel>
}