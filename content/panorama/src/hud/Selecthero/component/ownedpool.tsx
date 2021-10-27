import React, { useEffect, useRef } from "react";
import { OwendCard } from "./ownedCard";
import { OwendCardList } from "./ownedCardlist";
import { Playerinformation } from "./playerinformation";
import { teamState } from "./pool";

export const Ownedpool = ({...args}) => {
    const panel = useRef<Panel|null>()

    
    useEffect(()=>{
        if(teamState[args?.loopdata?.currentteam] == args.player){
            panel.current?.AddClass("hight")
        }else{
            panel.current?.RemoveClass("hight")
        }
    },[args?.loopdata?.currentteam])

    return <Panel ref={Panel=>panel.current = Panel}  className={`${args.player}Ownedpool`}>
            <Playerinformation {...args}/>
            <OwendCardList {...args}/>
        </Panel>
}