import React, { useEffect, useRef } from "react";
import { useGameEvent, useNetTableKey } from "react-panorama";

export const Curtain = () => {
    const table = useNetTableKey("GameMianLoop",'current_operate_brach')
    const panel1 = useRef<Panel|null>()
    const panel2 = useRef<Panel|null>()
    const panel3 = useRef<Panel|null>()

    useEffect(()=>{
        if(table){
            $.Msg("第一步检测")
            if(table.cuurent == '1'){
                panel1.current?.AddClass("high")
                panel2.current?.RemoveClass("high")
                panel3.current?.RemoveClass("high")
                return
            }   
            if(table.cuurent == '2'){
                panel1.current?.RemoveClass("high")
                panel2.current?.AddClass("high")
                panel3.current?.RemoveClass("high")
                return
            }
            if(table.cuurent == '3'){
                panel1.current?.RemoveClass("high")
                panel2.current?.RemoveClass("high")
                panel3.current?.AddClass("high")
                return
            }
        }
        panel1.current?.AddClass("high")
        panel2.current?.AddClass("high")
        panel3.current?.AddClass("high")
        return
    },[table])
    

    return <>
        <Panel ref={Panel => panel1.current = Panel} hittest={false} className={"curtain1"}>
        </Panel>
        <Panel ref={Panel => panel2.current = Panel} hittest={false} className={"curtain2"}>
        </Panel>
        <Panel ref={Panel => panel3.current = Panel} hittest={false} className={"curtain3"}>
        </Panel>
        </>

}