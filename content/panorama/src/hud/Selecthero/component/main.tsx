import React from "react";
import { useNetTableKey } from "react-panorama";
import { BaseBoard } from "./baseboard";
import { Gloabtip } from "./gloabtip";
import { Okbutton } from "./okbutton";
import { Ownedpool } from "./ownedpool";
import { Pool } from "./pool";
import { Tip } from "./tip";

export const Main = () => {
    const playerHasChosen = useNetTableKey("Card_group_construction_phase",'playerHasChosen')
    const loopdata = useNetTableKey("Card_group_construction_phase",'selectloop')
    const playerteam = useNetTableKey('Card_group_construction_phase','team')
    const gameloopname = useNetTableKey("GameMianLoop",'currentLoopName')


    return <> 
        {
        gameloopname?.current == 'selectherocard'&&
        <BaseBoard>
        <Pool loopdata={loopdata} playerteam={playerteam}/>
        <Ownedpool player={"red"} loopdata={loopdata} playerHasChosen={playerHasChosen}/>
        <Ownedpool player={"blue"} loopdata={loopdata} playerHasChosen={playerHasChosen}/>
        <Tip loopdata={loopdata}/>
        <Okbutton playerteam={playerteam} loopdata={loopdata} />
        <Gloabtip/>
    </BaseBoard>
    }
    </>
}