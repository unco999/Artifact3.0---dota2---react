import React from "react";
import { useNetTableKey } from "react-panorama";
import { Hand_area } from "./hand_area";

export const Main = () =>{
    const gameloopname = useNetTableKey("GameMianLoop",'currentLoopName')


    return <>
        {
            gameloopname.current === 'herodeploy' &&
        <Hand_area className={"red_hand_main"}/>
        }
    </>
}