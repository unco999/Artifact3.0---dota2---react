import React from "react";
import { useNetTableKey } from "react-panorama";
import { Battle_my_area } from "./battle_my_area";
import { Battle_center_area } from "./battle_center_area";
import { Battle_left_area } from "./battle_left_area";
import { Battle_you_area } from "./battle_you_area";
import { Battle_right_area } from "./battle_right_area";
import { CardContext } from "./Card";

export const Main = () =>{
    const team = useNetTableKey("Card_group_construction_phase","team")
    const gameloopname = useNetTableKey("GameMianLoop",'currentLoopName')

    return <>
    { gameloopname.current == 'isbattle' &&
    <>
        <Battle_center_area red={team.red} blue={team.blue}/>
        <Battle_left_area red={team.red} blue={team.blue}/>
        <Battle_right_area red={team.red} blue={team.blue}/>
        <Battle_you_area className={"battle_red_center_area"}/>
        <Battle_you_area className={"battle_red_left_area"}/>
        <Battle_you_area className={"battle_red_right_area"}/>
        <Battle_my_area className={"battle_blue_center_area"}/>
        <Battle_my_area className={"battle_blue_left_area"}/>
        <Battle_my_area className={"battle_blue_right_area"}/>
        <CardContext/>
    </>
    }
    </>
}