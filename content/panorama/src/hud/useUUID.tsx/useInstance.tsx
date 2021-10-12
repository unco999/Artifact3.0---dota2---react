import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { render, useGameEvent, useNetTableValues } from 'react-panorama';
import hyperid from 'hyperid'
import { ComponentNode, ConpoentDataContainer, State } from '../ConpoentDataContainer';


export enum COMPOENT_FUNCTION {
    'horizontalArrangement'= 'horizontalArrangement',
} 

export const useInstance = (name:string,uuid:string|undefined,css:Partial<VCSSStyleDeclaration>,state?:State[]):ComponentNode|undefined =>{
    const [_updata,_set_update] = useState(0)
    const [component,set_compoent] = useState<ComponentNode>()
    
    useLayoutEffect(()=>{
        if(uuid){
            ConpoentDataContainer.Instance.addNode(name,uuid,_set_update,Object.assign({},css),state,undefined)
        }
    },[uuid])

    useEffect(()=>{
        if(!uuid) return ;
        set_compoent(ConpoentDataContainer._instance.UuidGetNode(uuid))
    },[_updata])


    return component
}