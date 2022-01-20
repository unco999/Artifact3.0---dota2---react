import React from "react";
import { useNetTableKey } from "react-panorama";
import { Battle_center_area } from "./battle_center_area";
import { Battle_left_area } from "./battle_left_area";
import { Battle_right_area } from "./battle_right_area";
import { CardContext } from "./Card";
import { Effect } from "./effect";
import { MyConpoment } from "./my";
import { YouConpoment } from "./you";
import {Curtain} from "./curtain"
import { Fog } from "./fog";

export const Main = () =>{
    const team = useNetTableKey("Card_group_construction_phase","team")
    const gameloopname = useNetTableKey("GameMianLoop",'currentLoopName')

    return <>
    { gameloopname.current == 'isbattle' &&
    <>
        <Fog/>
        <MyConpoment red={team.red} blue={team.blue} />
        <YouConpoment red={team.red} blue={team.blue} />
        <CardContext owner={Players.GetLocalPlayer()}/>
        <CardContext owner={Players.GetLocalPlayer() == team.red ? team.blue : team.red}/>
    </>
    }
    </>
}