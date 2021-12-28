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

export const Main = () =>{
    const team = useNetTableKey("Card_group_construction_phase","team")
    const gameloopname = useNetTableKey("GameMianLoop",'currentLoopName')
    const loop = useNetTableKey("GameMianLoop","smallCycle")

    $.Msg("bbb",loop)

    return <>
    { gameloopname.current == 'isbattle' &&
    <>
        <MyConpoment red={team.red} blue={team.blue} />
        <YouConpoment red={team.red} blue={team.blue} />
        <CardContext owner={Players.GetLocalPlayer()}/>
        <CardContext owner={Players.GetLocalPlayer() == team.red ? team.blue : team.red}/>
        {loop && loop.current == '3' || loop.current == '1'  && <Curtain/>}
    </>
    }
    </>
}