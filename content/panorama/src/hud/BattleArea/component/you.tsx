import React from "react";
import { Battle_center_area } from "./battle_center_area";
import { Battle_left_area } from "./battle_left_area";
import { Battle_right_area } from "./battle_right_area";
import { CardContext } from "./Card";
import { EnergyBarManager } from "./energyBar";
import { Equipd_shop_Main } from "./equip_shop_main";
import { Tower } from "./tower";
import { Turnbased } from "./turn_based";

export const YouConpoment = (props:{red:number,blue:number}) => {
    return <>
    <Battle_center_area owner={Players.GetLocalPlayer() == props.red ? props.blue : props.red} red={props.red} blue={props.blue}/>
    <Battle_left_area owner={Players.GetLocalPlayer() == props.red ? props.blue : props.red} red={props.red} blue={props.blue}/>
    <Battle_right_area owner={Players.GetLocalPlayer() == props.red ? props.blue : props.red} red={props.red} blue={props.blue}/>
    <Tower owner={Players.GetLocalPlayer() == props.red ? props.blue : props.red} index={1}/>
    <Tower owner={Players.GetLocalPlayer() == props.red ? props.blue : props.red} index={2}/>
    <Tower owner={Players.GetLocalPlayer() == props.red ? props.blue : props.red} index={3}/>
    <EnergyBarManager owner={Players.GetLocalPlayer() == props.red ? props.blue : props.red} brach={1}/>
    <EnergyBarManager owner={Players.GetLocalPlayer() == props.red ? props.blue : props.red} brach={2}/>
    <EnergyBarManager owner={Players.GetLocalPlayer() == props.red ? props.blue : props.red} brach={3}/>
    <Turnbased owend={Players.GetLocalPlayer() == props.red ? props.blue : props.red} red={props.red} blue={props.blue}/>
    <Label text={props.red == Players.GetLocalPlayer() ? "他是蓝色" : "他是红色"} />
    </>
}