import React from "react";
import { useNetTableKey } from "react-panorama";
import { CardList } from "./card_list";
import { Tit } from "./tit";

export const Main = () => {
    const gameloopname = useNetTableKey("GameMianLoop",'currentLoopName')

    return <>
    {gameloopname.current == 'showtime' && 
    <Panel className={"showtimemain"}>
        <CardList/>
        <Tit text={"中路"} classname={'tit_center'} delay={1}/>
        <Tit text={"上路"} classname={'tit_left'} delay={3}/>
        <Tit text={"下路"} classname={'tit_right'} delay={3}/>
    </Panel>
    }
    </>
}