import React from "react";

export const Card = ({...args}) =>{
    return <DOTAHeroImage draggable={true} onload={args.onload} heroid={args.id} heroimagestyle={"portrait"} className={'Card'}/>
}