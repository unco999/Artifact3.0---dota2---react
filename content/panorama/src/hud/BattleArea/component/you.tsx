import React from "react";
import { Battle_center_area } from "./battle_center_area";
import { Battle_left_area } from "./battle_left_area";
import { Battle_right_area } from "./battle_right_area";
import { CardContext } from "./Card";

export const YouConpoment = (props:{red:number,blue:number}) => {
    return <>
    <Battle_center_area owner={Players.GetLocalPlayer() == props.red ? props.blue : props.red} red={props.red} blue={props.blue}/>
    <Battle_left_area owner={Players.GetLocalPlayer() == props.red ? props.blue : props.red} red={props.red} blue={props.blue}/>
    <Battle_right_area owner={Players.GetLocalPlayer() == props.red ? props.blue : props.red} red={props.red} blue={props.blue}/>
    </>
}