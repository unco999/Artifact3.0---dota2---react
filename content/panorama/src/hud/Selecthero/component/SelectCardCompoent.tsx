import React from "react";

export const Card = ({...args}) =>{
    return <DOTAHeroImage heroid={args.id} heroimagestyle={"portrait"} className={'Card'}/>
}