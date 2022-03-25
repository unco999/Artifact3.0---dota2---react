import React from "react";

export const Tip = ({...args}) => {
    const team = args.loopdata ? args.loopdata.currentteam : 0
    const remainingOptionalQuantity = args.loopdata ? args.loopdata.remainingOptionalQuantity : 0
    const time = args.loopdata  ? args.loopdata.timeLeft : 0

    return <Label text={`${time}秒内请${$.Localize("#"+team)}选择${remainingOptionalQuantity}张英雄`} className={"Tip"}/>
} 