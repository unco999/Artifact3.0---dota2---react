/** 战场上用于显示空格的容器  可做拖入卡牌操作  而实际卡牌并不在此容器里 */

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useGameEvent } from "react-panorama";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";

export const Card_container = (props:{className:string,index:number,brach:number,onwer:number}) => {
    const mian = useRef<Panel|null>()
    const uuid = useUuid()
    const container = useInstance("Card_container",uuid,{},undefined)

    useGameEvent("S2C_SEND_CANSPACE",(event)=>{
        $.Msg(event)
        for(const brach in event){
            for(const index in event[brach]){
                if(+brach === props.brach && +event[brach][index] === props.index){
                    $.Msg("有板通过了检测")
                    mian.current?.AddClass("up")    
                }    
            }
        }
    },[])


    useEffect(()=>{
        !container?.switch && mian.current?.RemoveClass("up")
    },[container])

    return <Panel ref={Panel=>mian.current = Panel} className={"up"}/>
}