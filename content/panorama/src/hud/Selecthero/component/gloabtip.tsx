import React from "react";
import { useInstance } from "../../useUUID.tsx/useInstance";
import useUuid from "../../useUUID.tsx/useUuid";

export const Gloabtip = () => {
    const uuid = useUuid()
    const container = useInstance("Gloabtip",uuid,{},undefined)

    return <Panel className={'gloabtip'} style={{...container?.csstable}}/>
}