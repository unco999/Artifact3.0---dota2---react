import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { render, useGameEvent, useNetTableValues } from 'react-panorama';
import { GLOABAL_EVENT } from '../BattleArea/component/global';


export enum COMPOENT_FUNCTION {
    'horizontalArrangement'= 'horizontalArrangement',
} 

export const useGlobalEvent = (register_str:string[],boolfuc:Function) => {
    const [_update,setupdate] = useState(false)
    
    useEffect(()=>{
        boolfuc() && GLOABAL_EVENT.instance.register(register_str,setupdate)
    },[register_str])


    return _update
}