import React from "react";
import { OwendCard } from "./ownedCard";
import { OwendCardList } from "./ownedCardlist";
import { Playerinformation } from "./playerinformation";

export const Ownedpool = ({...args}) => {
    return <Panel className={`${args.player}Ownedpool`}>
            <Playerinformation {...args}/>
            <OwendCardList {...args}/>
        </Panel>
}