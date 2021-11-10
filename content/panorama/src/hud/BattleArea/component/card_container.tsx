/** 战场上用于显示空格的容器  可做拖入卡牌操作  而实际卡牌并不在此容器里 */

import React from "react";

export const Card_container = (props:{className:string}) => {
    return <Panel className={props.className}/>
}