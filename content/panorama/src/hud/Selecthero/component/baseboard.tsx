import React, { Children } from "react";

export const BaseBoard = ({...args}) => {
    return <Panel className={"BaseBoard"}>
        {args.children}
    </Panel>
}