import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { render, useGameEvent, useNetTableValues } from 'react-panorama';
import hyperid from 'hyperid';
import { ComponentNode, ConpoentDataContainer } from '../ConpoentDataContainer';


export const useimport = (name:string,uuid?:string|undefined,daley?:number) =>{
    const [container,setcontainer] = useState<ComponentNode>()
    const [state,setstate] = useState(0)

    useEffect(()=>{
        $.Schedule(daley ?? 0.1,()=>{
            const main = ConpoentDataContainer.Instance.NameGetNode(name).current
            setcontainer(main)
            main.register_monitor(setstate)
        })
    },[state])


    return container
}