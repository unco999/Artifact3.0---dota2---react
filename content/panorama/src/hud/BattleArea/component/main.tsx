import React from "react";
import { useNetTableKey } from "react-panorama";
import { Battle_blue_area } from "./battle_blue_area";
import { Battle_center_area } from "./battle_center_area";
import { Battle_left_area } from "./battle_left_area";
import { Battle_red_area } from "./battle_red_area";
import { Battle_right_area } from "./battle_right_area";

export const Main = () =>{
    const gameloopname = useNetTableKey("GameMianLoop",'currentLoopName')
//
$.Msg(CustomNetTables.GetTableValue("GameMianLoop",'smallCycle'))

    return <>
    { gameloopname.current == 'isbattle' &&
    <>
        <Battle_center_area/>
        <Battle_left_area/>
        <Battle_right_area/>
        <Battle_red_area className={"battle_red_center_area"}/>
        <Battle_red_area className={"battle_red_left_area"}/>
        <Battle_red_area className={"battle_red_right_area"}/>
        <Battle_blue_area className={"battle_blue_center_area"}/>
        <Battle_blue_area className={"battle_blue_left_area"}/>
        <Battle_blue_area className={"battle_blue_right_area"}/>
    </>
    }
    </>
}