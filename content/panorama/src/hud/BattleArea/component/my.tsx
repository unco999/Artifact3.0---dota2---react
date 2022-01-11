import React from "react";
import { Arrow_tip } from "./arrow_tip";
import { Battle_center_area } from "./battle_center_area";
import { Battle_left_area } from "./battle_left_area";
import { Battle_right_area } from "./battle_right_area";
import { CardContext } from "./Card";
import { EnergyBarManager } from "./energyBar";
import { Equipd_shop_Main } from "./equip_shop_main";
import { Tower } from "./tower";
import { Turnbased } from "./turn_based";

export const MyConpoment = (props:{red:number,blue:number}) => {
    return <>
    <Battle_center_area owner={Players.GetLocalPlayer()} red={props.red} blue={props.blue}/>
    <Battle_left_area owner={Players.GetLocalPlayer()} red={props.red} blue={props.blue}/>
    <Battle_right_area owner={Players.GetLocalPlayer()} red={props.red} blue={props.blue}/>
    <Tower owner={Players.GetLocalPlayer()} index={1}/>
    <Tower owner={Players.GetLocalPlayer()} index={2}/>
    <Tower owner={Players.GetLocalPlayer()} index={3}/>
    <EnergyBarManager owner={Players.GetLocalPlayer()} brach={1}/>
    <EnergyBarManager owner={Players.GetLocalPlayer()} brach={2}/>
    <EnergyBarManager owner={Players.GetLocalPlayer()} brach={3}/>
    <Turnbased owend={Players.GetLocalPlayer()} red={props.red} blue={props.blue}/>
    <Arrow_tip/>
    <Equipd_shop_Main onwenr={Players.GetLocalPlayer()}/>
    </>
}