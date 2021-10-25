import React, { Children } from "react";

export const BaseBoard = ({...args}) => {
    return <Panel hittest={false} className={"BaseBoard"}>
        {args.children}
    </Panel>
}