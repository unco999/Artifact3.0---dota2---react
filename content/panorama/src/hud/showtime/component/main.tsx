import React from "react";
import { useNetTableKey } from "react-panorama";
import { CardList } from "./card_list";

export const Main = () => {
    const gameloopname = useNetTableKey("GameMianLoop",'currentLoopName')

    return <>
    {gameloopname.current == 'showtime' && 
    <Panel className={"showtimemain"}>
        <CardList/>
    </Panel>
    }
    </>
}