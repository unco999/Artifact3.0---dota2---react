import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { render, useGameEvent, useNetTableValues } from 'react-panorama';
import shortid from 'shortid'

export const useUuid = () => {
    const [uuid,setuuid] = useState<string>()

    useLayoutEffect(()=>{
        setuuid(shortid.generate())
    },[])

    return uuid
}

export default useUuid