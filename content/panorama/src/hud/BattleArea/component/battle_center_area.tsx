import React from "react";
import { Card_container } from "./card_container";

export const Battle_center_area = (props:{red:number,blue:number}) =>{
    return <Panel className={"battle_center_area_main"}>
            <Panel className={"Card_container_parent"}>
            <Card_container className={"Card_container_center_1"}/>
            <Card_container className={"Card_container_center_2"}/>
            <Card_container className={"Card_container_center_3"}/>
            <Card_container className={"Card_container_center_4"}/>
            <Card_container className={"Card_container_center_5"}/>
            </Panel>
        </Panel>
}