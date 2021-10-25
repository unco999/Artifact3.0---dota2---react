import React from "react";
import { BaseBoard } from "./baseboard";
import { Ownedpool } from "./ownedpool";
import { Pool } from "./pool";

export const Main = () => {
    return <BaseBoard>
        <Pool/>
        <Ownedpool player={"red"}/>
        <Ownedpool player={"blue"}/>
    </BaseBoard>
}