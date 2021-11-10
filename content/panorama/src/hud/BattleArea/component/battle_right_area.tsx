import React from "react";
import { Card_container } from "./card_container";

export const Battle_right_area = (props:{red:number,blue:number}) =>{
    return <Panel className={"battle_right_area_main"}>
            <Panel className={"Card_container_parent"}>
            <Card_container className={"Card_container_right_1"}/>
            <Card_container className={"Card_container_right_2"}/>
            <Card_container className={"Card_container_right_3"}/>
            <Card_container className={"Card_container_right_4"}/>
            <Card_container className={"Card_container_right_5"}/>
            </Panel>
            </Panel>
}