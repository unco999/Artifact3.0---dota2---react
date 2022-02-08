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
        $.Msg("收到事件",event)
        for(const brach in event){
            for(const index in event[brach]){
                if(+brach == props.brach && +event[brach][index] != -1 && +index == props.index){
                    mian.current?.AddClass("show")    
                }    
            }
        }
    },[])

    useGameEvent("S2C_OFF_ALL_SPACE",()=>{
        mian.current?.RemoveClass("show")
    },[])



    useEffect(()=>{
        if(props.onwer == Players.GetLocalPlayer()){
            $.RegisterEventHandler( 'DragDrop', mian.current!, OnDragDrop );
            $.RegisterEventHandler( 'DragEnter', mian.current!, OnDragEnter );
        }
    },[])

    const OnDragEnter = (panelId:any, dragCallbacks:any) => {
    }

    const abilityreplacement = () => {
        
    }

    const OnDragDrop = (panelId:any, dragCallbacks:any) => {
        $.Msg("传入的事件")
        $.Msg(dragCallbacks.Data())
        if(dragCallbacks.Data().data?.vacancyRelease){
            GameEvents.SendCustomGameEventToServer("C2S_SPACE_CALL_SPELL",{SKILL_ID:dragCallbacks.Data().id,target_index:props.index.toString(),spell_ability_card_uuid:dragCallbacks.Data().cardid})
            return
        }
        if(dragCallbacks.Data().data?.replacementCard){
             GameEvents.SendCustomGameEventToServer("C2S_REP_SKILL",{abilityname:dragCallbacks.Data().id,to:props.brach.toString(),index:props.index.toString(),uuid:dragCallbacks.Data().cardid})
             return;
        }
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
        GameEvents.SendCustomGameEventToServer("C2S_CARD_CHANGE_SCENES",{to_scene:scene,index:props.index,uuid:dragCallbacks.Data().uuid})
    }


    useEffect(()=>{
        !conponent?.switch && mian.current?.RemoveClass("show")
    },[up])

    return <Panel ref={Panel=>mian.current = Panel} className={"up"}>
            <Label hittest={false} text={props.index}/>
        </Panel>
}