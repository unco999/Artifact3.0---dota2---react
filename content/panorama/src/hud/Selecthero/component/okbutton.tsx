import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";

export const Okbutton = (props:{playerteam:{red:number,blue:number},loopdata: {
    timeLeft: number;
    currentteam: string;
    optionalnumber: number;
    remainingOptionalQuantity: number;
}}) => {
    const uuid = useUuid()
    const container = useInstance("okbutton",uuid,{},undefined)
    const panel = useRef<Panel|null>()

    useEffect(()=>{
        panel.current?.RemoveClass("hight")
    },[props?.loopdata?.currentteam])


    const button = () => {
        const Pool = ConpoentDataContainer.Instance.NameGetNode('Pool').current
        if(!Pool) return
        const isselect = Pool.getKeyString<[number,number]>(Players.GetLocalPlayer() + "isselect")
        if(isselect[1] == undefined){
            isselect[1] = -1
        }
        if(props.playerteam.blue == Players.GetLocalPlayer()){  
            GameEvents.SendCustomGameEventToServer("BLUE_SELECT_HERO_CARD",{array:isselect})
        }else{  
            GameEvents.SendCustomGameEventToServer("RED_SELECT_HERO_CARD",{array:isselect})
        }
    }

    return <Panel ref={Panel=>panel.current = Panel} className={"Okbutton" + " " + container?.className} onactivate={()=>button()}>
        <Label text={"确定选择"}/>
            </Panel>
}