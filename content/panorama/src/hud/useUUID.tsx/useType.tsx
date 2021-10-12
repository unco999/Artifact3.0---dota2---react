import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { render, useGameEvent, useNetTableValues } from 'react-panorama';

export const usetype = (str:string) => {
   const [index,setindex] = useState(0)
   const [cur_dialog,set_cur_dialog]= useState("")
   const [end,setend] = useState(false)

   useLayoutEffect(()=>{
      set_cur_dialog("")
      setindex(0);
      setend(false)
   },[str])

   useEffect(()=>{
     const time = $.Schedule(0.05,() => {
         if(index >= str.length) {
            setend(true)
            return () => $.CancelScheduled(time)   
         }
        set_cur_dialog(str.substring(0,index))
        setindex(value => value + 1)
      });
   },[str,index])



   return [cur_dialog,end]
}

export default usetype