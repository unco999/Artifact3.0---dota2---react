import React from "react";
import { Card_container } from "./card_container";

export const Battle_center_area = (props:{red:number,blue:number,owner:number}) =>{
    const prefix = (props.owner == Players.GetLocalPlayer() ? "my_" : 'you_' )

    return <Panel className={prefix +  "battle_center_area_main"}>
            <Panel className={prefix + "Card_container_parent"}>
            <Card_container className={"Card_container_center_1"}/>
            <Card_container className={"Card_container_center_2"}/>
            <Card_container className={"Card_container_center_3"}/>
            <Card_container className={"Card_container_center_4"}/>
            <Card_container className={"Card_container_center_5"}/>
            </Panel>
        </Panel>
}