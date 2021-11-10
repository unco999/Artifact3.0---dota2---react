import React from "react";
import { Card_container } from "./card_container";

export const Battle_left_area = (props:{red:number,blue:number}) =>{
    return <Panel className={"battle_left_area_main"}>
            <Panel className={"Card_container_parent"}>
            <Card_container className={"Card_container_left_1"}/>
            <Card_container className={"Card_container_left_2"}/>
            <Card_container className={"Card_container_left_3"}/>
            <Card_container className={"Card_container_left_4"}/>
            <Card_container className={"Card_container_left_5"}/>
            </Panel>
        </Panel>
}

