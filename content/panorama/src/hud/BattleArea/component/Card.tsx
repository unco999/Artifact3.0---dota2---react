import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMachine } from '@xstate/react';
import { createMachine, SingleOrArray } from 'xstate';
import { useGameEvent, useNetTableKey } from "react-panorama";
import { JsonString2Array, JsonString2Arraystrt0 } from "../../../Utils";
import shortid from "shortid";
import { ConpoentDataContainer } from "../../ConpoentDataContainer";
import { arrow_data } from "./arrow_tip";
import { Summon } from "./summon";
import { EquipmentManager } from "./equipment";
import { GLOABAL_EVENT } from "./global";
import { useGlobalEvent } from "../../useUUID.tsx/useglobalevent";
import { StateCompoent } from "./Unit_state";

export enum state{
    牌堆,
    手牌,
    施放,
    战场,    
    坟墓,
    装备,
}

export enum optionMask {
    蓝队有操作 = 0x000001,
    红队有操作 = 0x000002,
    蓝队点击跳过 = 0x000004,
    红队点击跳过 = 0x000008,
    默认状态 = 0x000010
}


enum Magic_brach{
    "本路",
    "跨线",
    "对格"
}

enum Magic_range{
    "单体",
    "近邻",
    "全体"
}

enum Magic_team{
    "友方",
    "敌方",
    "双方",
    "自己"
}

const Machine = createMachine({
    id:'Card',
    initial:'defualt',
    states:{
        defualt:{
            entry:"defualt_entry",
            on:{toHAND:"hand",toABILITY:"ability",toHEAPS:"heaps",toMIDWAY:"midway",toGOUP:"goup",toLAIDDOWN:"laiddown",toGRAVE:"grave",toREMOVE:"remove",toHIDE:'hidden_area'},
            exit:"defualt_exit"
        },
        heaps:{
            entry:'heaps_entry',
            on:{toHAND:"hand",toHIDE:'hidden_area'},
            exit:'heaps_exit'
        },
        hand:{
            entry:'hand_entry',
            on:{toHAND:"hand",toHEAPS:"heaps",toMIDWAY:"midway",toGOUP:"goup",toLAIDDOWN:"laiddown",toABILITY:'ability',toREMOVE:'remove',toHIDE:'hidden_area'},
            exit:"hand_exit"
        },
        midway:{
            entry:'midway_entry',
            on:{toHAND:"hand",toHEAPS:"heaps",toMIDWAY:"midway",toGOUP:"goup",toLAIDDOWN:"laiddown",toGRAVE:"grave",toREMOVE:"remove"},
            exit:"midway_exit"
        },
        goup:{
            entry:'goup_entry',
            on:{toHAND:"hand",toHEAPS:"heaps",toMIDWAY:"midway",toGOUP:"goup",toLAIDDOWN:"laiddown",toGRAVE:"grave",toREMOVE:"remove"},
            exit:"goup_exit"
        },
        laiddown:{
            entry:'laiddown_entry',
            on:{toHAND:"hand",toHEAPS:"heaps",toMIDWAY:"midway",toGOUP:"goup",toLAIDDOWN:"laiddown",toGRAVE:"grave",toREMOVE:"remove"},
            exit:"laiddown_exit"
        },
        ability:{
            entry:"ability_entry",
            on:{toGRAVE:'grave'},
            exit:"ability_exit"
        },
        equipment:{
        },
        grave:{
            on:{toHAND:"hand",toGOUP:"goup",toLAIDDOWN:"laiddown",toGRAVE:"grave"},
            entry:"grave_entry",
            exit:"grave_exit"
        },
        remove:{
            entry:"remove_entry"
        },
        hidden_area:{
            entry:"hidden_area_entry",
            on:{toHAND:"hand"},
            exit:"hidden_area_exit"
        }
    }
})

 
export const Card = (props:{index:number,uuid:string,owner:number,team:{red:number,blue:number}}) => {
    const prefix = useMemo(()=> props.owner == Players.GetLocalPlayer() ? "my_" : "you_",[props])
    const [modifilers,setmodifiler] = useState<Array<{name:string,duration:string,texture:string,id:string}>>([])
    const graveTipFunction = useRef(()=>{})
    const id = useRef(Math.floor(Math.random() * 20) + 1)
    const preHighSelectType = useRef("") // 当前选中的类型css样式
    const ref = useRef<Panel|null>()
    const dummy = useRef<Panel|null>()
    const effect = useRef<Panel|null>()
    const [current_effect,set_current_effect] = useState("")
    const preindex = useRef<number>(-1) //板子的上一次索引
    const effect_parameter = useRef<{cameraOrigin:string,lookAt:string}>({cameraOrigin:"0 600 0",lookAt:"0 0 0"}) //特效面板的默认值
    const [attribute,setattribute] = useState<{
        uuid: string;
        attack: number;
        arrmor: number;
        heal: number;
    }>() //获取单位的三维与modifiler
    const parent = useRef<Panel|null>()
    const update = useGlobalEvent(['isdrag'],()=>{return state.Scene == 'GOUP'||state.Scene == 'MIDWAY'||state.Scene == 'LAIDDOWN'})
    const [state,setstate] = useState<{Id:string,Index:number,uuid:string,Scene?:string,type?:string,playerid?:PlayerID,data:any}>({Id:'null',Index:-1,uuid:'null',data:""})
    const [xstate,send] = useMachine(Machine,{
        actions:{
            defualt_entry:()=>{
                dummyoperate('add',prefix + "hide")
                const id = GameEvents.Subscribe("S2C_GET_CARD",(event)=>{
                    if(event.uuid != props.uuid) return; 
                    setstate(event)
                    GameEvents.Unsubscribe(id) 
                })
                GameEvents.SendCustomGameEventToServer("C2S_GET_CARD",{uuid:props.uuid})
            },
            defualt_exit:()=>{
                $.Schedule(1,()=>{
                    dummyoperate('remove',prefix + "hide")
                })
            },
            midway_entry:()=>{
                preindex.current = state.Index
                dummyoperate('add',prefix + 'Midway' + state.Index);
            },
            midway_exit:()=>{
                 dummyoperate('remove',prefix + 'Midway' + preindex.current );
            },
            goup_entry:()=>{
                preindex.current = state.Index
                dummyoperate('add',prefix + 'Goup' + state.Index );
            },
            goup_exit:()=>{
                 dummyoperate('remove',prefix + 'Goup' + preindex.current);
            },
            laiddown_entry:()=>{
                preindex.current = state.Index
                dummyoperate('add',prefix + 'Laiddown' + state.Index);
            },
            laiddown_exit:()=>{
                 dummyoperate('remove',prefix + 'Laiddown' + preindex.current);
            },
            heaps_entry:()=>{
                preindex.current = state.Index
                dummyoperate('add',prefix + 'Heaps');
            },
            heaps_exit:()=>{
                dummyoperate('remove',prefix + "Heaps")
            },
            hand_entry:()=>{ 
                preindex.current = state.Index
                dummyoperate('add',prefix + "Hand"+ state.Index)
            },
            hand_exit:()=>{ 
                dummyoperate('remove',prefix + "Hand"+ preindex.current)
            },
            ability_entry:()=>{
                dummyoperate('add',prefix + "ability")
            },
            ability_exit:()=>{
                dummyoperate('remove',prefix + "ability")
            },
            grave_entry:()=>{
                dummyoperate('add',prefix + "death")
                    dummyoperate('remove',prefix + 'Laiddown' + preindex.current)
                    dummyoperate('remove',prefix + 'Goup' + preindex.current)
                    dummyoperate('remove',prefix + 'Midway' + preindex.current)
                    preindex.current = state.Index
                    dummyoperate('add',prefix + "ingrave")
            },
            grave_exit:()=>{
                dummyoperate('remove',prefix + "ingrave")
                dummyoperate('remove',prefix + "death")
                dummy.current?.RemoveClass("hide")
            },
            remove_entry:()=>{
                dummyoperate('add',prefix + "death")
            },
            hidden_area_entry:()=>{
                preindex.current = state.Index
                dummyoperate('add',prefix + "hidden_area" + state.Index)
            },
            hidden_area_exit:()=>{
                dummyoperate('remove',prefix + "hidden_area" + preindex.current )
                dummy.current?.RemoveClass("hide")
            }
        }
    })

    useEffect(()=>{
        state.Scene && send("to" + state.Scene)
    },[state])

    /** uuid获得时发送获取属性回调 */ 

    /**获取当前属性 */
    useGameEvent("S2C_SEND_ATTRIBUTE",(event)=>{//
        if(event.uuid == props.uuid){
            setattribute(event)
        }
    },[props.uuid])

    useEffect(()=>{
        GameEvents.SendCustomGameEventToServer("C2S_GET_ATTRIBUTE",{uuid:props.uuid})
    },[props.uuid])

    /**获取单位modifiler信息 */
    useEffect(()=>{
        
    },[])

    /**每次本体动 马甲跟着动 */
    const dummyoperate  = (action:"remove"|"add",classname:string) => {
        if(action == 'add'){
            ref.current?.AddClass(classname)
            dummy.current?.AddClass(classname)
            effect.current?.AddClass(classname)
        }else{
            ref.current?.RemoveClass(classname)
            dummy.current?.RemoveClass(classname)
            effect.current?.RemoveClass(classname)
        }
    }

    useGameEvent("S2C_SEND_MODIFILER",(event)=>{
        if(props.uuid != event.uuid) return
        setmodifiler(JsonString2Array(event.data))
        $.Msg("收到了buffer数据包",event)
    },[])

    useEffect(()=>{
        GameEvents.SendCustomGameEventToServer("C2S_GET_MODIFILER",{uuid:props.uuid})
    },[props.uuid])

    /**卡牌改变场景 */
    useGameEvent("S2C_CARD_CHANGE_SCENES",(event)=>{
        if(props.uuid != event.uuid) return
        setstate(event)
        send("to" + state.Scene)
    },[])

    /**卡牌死亡特效 */
    useGameEvent("S2C_SEND_DEATH_ANIMATION",(event)=>{
        if(props.uuid != event.uuid) return
        const _random = (Math.floor(Math.random() * 3)+1)
        ref.current?.AddClass(prefix + "death_animation"+ _random)
        ref.current?.RemoveClass("select_target" + preHighSelectType.current)
        $.Schedule(1,()=>{
            // ref.current?.AddClass(prefix + "death")
            ref.current?.RemoveClass(prefix + "death_animation"+ _random)
        })
    },[props.uuid])

    /**卡牌攻击事件 */
    useGameEvent("S2C_SEND_ATTACK",(event)=>{
        if(props.uuid != event.uuid) return
        ref.current?.AddClass(prefix + "attack_animation")
        $.Schedule(1.5,()=>{
            ref.current?.RemoveClass(prefix + "attack_animation")
        })
    },[props.uuid])

    useGameEvent("S2C_SKILL_READY",(event)=>{
        if(props.uuid != event.uuid) return
        ref.current?.AddClass("skill_ready")
    },[props.uuid])

    /**该面板被作为可选目标被高亮 */
    useGameEvent("S2C_SEATCH_TARGET_OPEN",(event)=>{
        if(props.uuid != event.uuid) return
        ref.current?.AddClass("select_target" + event.type)
        preHighSelectType.current = event.type
        $.RegisterEventHandler( 'DragDrop', dummy.current!, OnDragDrop ) 
        $.RegisterEventHandler( 'DragEnter', dummy.current!, OnDragEnter )
        $.RegisterEventHandler( 'DragLeave',dummy.current!,OnDragLeave) 
        // set_current_effect("particles/killstreak/killstreak_ti10_hud_lv1.vpcf")
    },[props.uuid])


    
    const OnDragDrop = (_:any,dragCallbacks:any) => {
        const switchNumber = CustomNetTables.GetTableValue("GameMianLoop","smallCycle")
        if(switchNumber.current != "1"){
            return 
        }
        const id = dragCallbacks.Data().id
        const cardid = dragCallbacks.Data().cardid
        $.Msg("对目标开始释放技能")
        GameEvents.SendCustomGameEventToServer("C2S_SPELL_SKILL",{SKILL_ID:id,target_uuid:props.uuid,spell_ability_card_uuid:cardid})
        C2S_SEATCH_TARGET(false,dragCallbacks.Data().id) // 关闭技能提示器
    }

    const OnDragLeave = () =>{
    }
    
    const OnDragEnter = () =>{
    }

    // useEffect(()=>{
    //     if(!state.Scene) return;
    //     if(!dummy.current) return; 
    //     if(state.Scene == "MIDWAY" || state.Scene == "GOUP" || state.Scene == "LAIDDOWN"){
    //         $.RegisterEventHandler( 'DragDrop', dummy.current!, OnDragDrop ) 
    //         $.RegisterEventHandler( 'DragEnter', dummy.current!, OnDragEnter )
    //         $.RegisterEventHandler( 'DragLeave',dummy.current!,OnDragLeave) 
    //     }else{
    //         $.RegisterEventHandler( 'DragDrop', dummy.current!, ()=>{} ) 
    //         $.RegisterEventHandler( 'DragEnter', dummy.current!, ()=>{} )
    //         $.RegisterEventHandler( 'DragLeave',dummy.current!,()=>{}) 
    //     }
    // },[state])


    useGameEvent("S2C_SEND_UP_EQUIMENT_SHOW",(event)=>{
        if(props.uuid != event.uuid) return;
    },[props.uuid]) 


    useGameEvent("SC2_PLAY_EFFECT",(event)=>{
        if(props.uuid != event.uuid) return;
        set_current_effect(event.paticle)
        $.Schedule(1.5,()=>{
            set_current_effect("")
        })
    },[props.uuid]) //

    //技能目标关闭高亮
    useGameEvent("S2C_SEATCH_TARGET_OFF",(event)=>{
        if(props.uuid != event.uuid) return
        ref.current?.RemoveClass("select_target" + preHighSelectType.current)
        $.RegisterEventHandler( 'DragDrop', dummy.current!, ()=>{} ) 
        $.RegisterEventHandler( 'DragEnter', dummy.current!, ()=>{} )
        $.RegisterEventHandler( 'DragLeave',dummy.current!,()=>{}) 
    },[props.uuid])
    
    //技能释放主体提示
    useGameEvent("S2C_SKILL_OFF",(event)=>{
        if(props.uuid != event.uuid) return
        ref.current?.RemoveClass("skill_ready")
    },[props.uuid]) 

    //被命中魔法伤害
    useGameEvent("S2C_HURT_DAMAGE",(event)=>{
        if(props.uuid != event.uuid) return
        ref.current?.AddClass("hurt")
        set_current_effect(event.particle)
                 $.Schedule(1.5,()=>{
                     ref.current?.RemoveClass("hurt")
                     set_current_effect("")
                 })
    },[props.uuid])

    // useEffect(()=>{
    //     if(state.Scene == "GOUP" || state.Scene == "MIDWAY" || state.Scene == "LAIDDOWN"){
    //         const id = GameEvents.Subscribe("S2C_HURT_DAMAGE",(event)=>{
    //             if(props.uuid != event.uuid) return                
    //             set_current_effect("particles/econ/items/centaur/centaur_ti6_gold/centaur_ti6_warstomp_gold.vpcf");
    //             ref.current?.AddClass("hurt")
    //             $.Schedule(1.5,()=>{
    //                 set_current_effect("")
    //                 ref.current?.RemoveClass("hurt")
    //             })
    //         })
    //         return ()=>GameEvents.Unsubscribe(id)
    //     }
    // },[props.uuid,state])

    /**注册墓地tip */
    useEffect(()=>{
        if(state.Scene == "GRAVE"){
            const id = GameEvents.Subscribe("S2C_SEND_GRAVE_ARRAY",(event)=>{
                const table = JsonString2Array(event)
                graveTipFunction.current = ()=> $.DispatchEvent("DOTAShowTextTooltip",ref.current!,"当前墓地英雄 <br/>" + table.map(str=>str + "<br/>"))
                GameEvents.Unsubscribe(id)
            })
            GameEvents.SendCustomGameEventToServer("C2S_GET_GRAVE_ARRAY",{})
        }
    },[state])


    //drag事件
    useEffect(()=>{
        if(state.type == "Solider") return;
        if(xstate.value == 'hand' && props.owner == Players.GetLocalPlayer()){
            dummy.current && $.RegisterEventHandler( 'DragStart', dummy.current!, OnDragStart );
            dummy.current && $.RegisterEventHandler( 'DragEnd',dummy.current!, OnDragEnd);
        }
        // if(state.Scene == 'MIDWAY' || state.Scene == 'GOUP' || state.Scene == 'LAIDDOWN'){
        //     $.Msg("注册了拖拽事件")
        //     ref.current && $.RegisterEventHandler( 'DragStart', ref.current!, OnDragStart );
        //     ref.current && $.RegisterEventHandler( 'DragEnd', ref.current!, OnDragEnd );
        // }
        //暂时注释掉可以拖入的组件
        // if(xstate.value == 'midway' || xstate.value == 'goup' || xstate.value == 'laiddown'){
        //     $.RegisterEventHandler( 'DragDrop', ref.current!, OnDragDrop );
        //     $.RegisterEventHandler( 'DragEnter', ref.current!, OnDragEnter );
        // }
    },[props.owner,xstate.value])

    //改变index事件
    useGameEvent("S2C_SEND_INDEX",(event)=>{
        const keys = Object.keys(event)
        if(keys[0] == props.uuid && xstate.value == 'hand' || xstate.value == 'hide'){

            dummyoperate('remove',prefix + "Hand"+ preindex.current)
            preindex.current = event[keys[0]]
            dummyoperate('add',prefix + "Hand"+ event[keys[0]])
        }
    },[xstate])


    const IsCurrenOparetorPlayerLocal = () =>{
        return CustomNetTables.GetTableValue("GameMianLoop","current_operate_playerid")?.cuurent == Players.GetLocalPlayer().toString()
    }

    /**英雄部署回合检测 */
    const IsheroDeploymentRound = () => {
        return CustomNetTables.GetTableValue("GameMianLoop","smallCycle")?.current == "0"
    }

    const OnDragStart = (panelId:any, dragCallbacks:any) =>{
        const displayPanel = $.CreatePanel( "Panel", $.GetContextPanel(), "cache" ) as HeroImage
        const {red,blue} = props.team
        const local_isoparetor = CustomNetTables.GetTableValue("GameMianLoop",Players.GetLocalPlayer() == red ? "red_is_oparator" : "blue_is_oparator")
        if(local_isoparetor?.current){
            return  //如果玩家进行了本轮的操作 禁止拖拽
        }
        //**加入拖动的是装备卡片 */
        if(state.type == "EQUIP" && ref.current){
            if(!Game.IsInToolsMode()) {
                if(!IsheroDeploymentRound()) return;
            }
            parent.current = ref.current?.GetParent()
            ref.current.Data().data = state.data
            dragCallbacks.displayPanel = ref.current;
            dragCallbacks.offsetX = -30; 
            dragCallbacks.offsetY = -30;
            ref.current?.AddClass("dragEquip")
            return
        }
        if(state.type == 'Hero' && ref.current){
            if(!IsheroDeploymentRound()) return;
            parent.current = ref.current?.GetParent()
            ref.current.Data().uuid = state.uuid
            dragCallbacks.displayPanel = ref.current;
            dragCallbacks.offsetX = 50; 
            dragCallbacks.offsetY = -150;
            splitOptionalPrompt()
            ref.current?.AddClass("dragHero")
            return 
        }
        if(state.type == 'SmallSkill' || state.type == "TrickSkill"  && ref.current){
            if(!IsCurrenOparetorPlayerLocal()) return;
            displayPanel.Data().id = state.Id
            displayPanel.Data().cardid = state.uuid
            displayPanel.Data().data = state.data
            $.Msg("当前拖动的id",state.data)
        }
        dragCallbacks.displayPanel = displayPanel;
        dragCallbacks.offsetX = 0; 
        dragCallbacks.offsetY = 0;
        displayPanel.Data().data = state.data
        ref.current?.AddClass('drag')
        GLOABAL_EVENT.instance.SetDATA("isdrag",true)
        changeCoordinates()
        C2S_SEATCH_TARGET(true)
    }

    /**技能提示器 */
    const C2S_SEATCH_TARGET = (bool:boolean,id?:string) =>{
        GameEvents.SendCustomGameEventToServer(bool == true ?  "C2S_SEATCH_TARGET_OPEN" : "C2S_SEATCH_TARGET_OFF",{
            abilityname:id ? id : state.Id 
        })
    }

    const OnDragEnd = (panelId:any, dragCallbacks:any) =>{
        $.Schedule(0.2,()=>{GLOABAL_EVENT.instance.SetDATA("isdrag",false)})
        ref.current?.RemoveClass('drag')
        if(state.type == "EQUIP"){
            ref.current?.RemoveClass("dragEquip")//
            ref.current?.SetParent(parent.current ?? $.GetContextPanel())
            return
        }
        if(state.type == "Hero"){
            ref.current?.RemoveClass("dragHero")//
            graveTipFunction.current = () => {}
            ref.current?.SetParent(parent.current ?? $.GetContextPanel())
            closeOptionalPrompt()
            return
        }
        if(state.type == 'SmallSkill' || state.type == "TrickSkill"){
            closeOptionalPrompt()
        }
        dragCallbacks.DeleteAsync( 0 );
        const container = ConpoentDataContainer.Instance.NameGetNode("arrow_tip").current
        container.close()
        state.type == 'Hero' && closeOptionalPrompt()
        C2S_SEATCH_TARGET(false,dragCallbacks.Data().id) // 关闭技能提示器
    }

    /**打开分路可选提示器 */
    const splitOptionalPrompt = () =>{
        GameEvents.SendCustomGameEventToServer("C2S_GET_CANSPACE",{uuid:state.uuid})
    }

    /**关闭分路可选提示器 */
    const closeOptionalPrompt = () =>{
        const containeise = ConpoentDataContainer.Instance.NameGetGrap("Card_container").current
        containeise.forEach(container=>{
            container.close()
        })
    }

    //**打开指引提示器 */
    const changeCoordinates = () => {
        // 
       const container = ConpoentDataContainer.Instance.NameGetNode("arrow_tip").current
       cb()
       container.open()
       function cb(){
             if(!ref.current?.actualxoffset) return;
             const cursor = GameUI.GetCursorPosition()
             const mouse:arrow_data = {
             0:{start:{x:ref.current!.actualxoffset!,y:ref.current!.actualyoffset,},end:{x:cursor[0],y:cursor[1]}}
             }
             container.SetKeyAny("data",mouse)
             if(GLOABAL_EVENT.instance.GetDATA("isdrag")){
                $.Schedule(Game.GetGameFrameTime(),cb)
             }
       }
    }

    // const disposablePointing = () => {
    //     const container = ConpoentDataContainer.Instance.NameGetNode("arrow_tip").current
    //     function cb(){
    //        const mouse:arrow_data = {
    //         1:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:0,y:450}},
    //         2:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:120,y:450}},
    //         3:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:900,y:600}},
    //         4:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:1100,y:600}},
    //         5:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:1300,y:600}},
    //         6:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:1450,y:600}},
    //         7:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:1600,y:600}},
    //         8:{start:{x:ref.current!.actualxoffset,y:ref.current!.actualyoffset,},end:{x:1850,y:600}},
    //         }
    //         container.SetKeyAny("data",mouse)
    //     }
    //     cb()
    //     container.open()
    // }

    const hidedisposablePointing = () => {
        const container = ConpoentDataContainer.Instance.NameGetNode("arrow_tip").current
        container.close()
    }
 
    const effect_select_scenes = () =>{
        switch(state.Scene){
            case "GOUP":{
                return prefix + 'Goup' + state.Index 
            }
            case "MIDWAY":{
                return prefix + 'Midway' + state.Index 
            }
            case "LAIDDOWN":{
                return prefix + 'Laiddown' + state.Index 
            }
            case "HAND":{
                return prefix + 'HAND' + state.Index 
            }
            default:{
                return ""
            }
        }

    }


    const Heaps = () => {
        return <>
         <Panel className={prefix+'Card'} ref={Panel => ref.current = Panel}/>
        </>
    }

    const frame = useRef<Panel|null>()

    const Ability = () => {
        return <>
         <Panel draggable={true} ref={Panel => dummy.current = Panel} onmouseover={()=>{frame.current?.AddClass("show");ref.current?.AddClass(prefix+"hover")}} onmouseout={()=>{frame.current?.RemoveClass("show");ref.current?.RemoveClass(prefix+"hover")}} className={prefix+"Carddummy"}/>
         <Panel ref={Panel => ref.current = Panel}  className={prefix+'Card'} >
             <Label text={props.uuid} className={"uuid"}/>
              <Panel ref={Panel=>frame.current = Panel} className={"card_frame"}/>
              <Panel style={{width:'90%',height:"90%",align:'center center'}}>
              <DOTAAbilityImage abilityname={(GameUI?.CustomUIConfig() as any)?.Ability?.CardGame[state.Id]?.originname ?? ""} className={'abilityimage'}/>
              <Label text={(GameUI?.CustomUIConfig() as any)?.Ability?.CardGame[state.Id]?.remark ?? ""} className={"Abilitydescribe"}/>
        </Panel>
        </Panel>
        </>
    }

    const Summoning = () => {
        if(state.Scene == "REMOVE"){
            return <></>
        }

        return <>
        <Panel hittest={true}
         onmouseactivate={()=>{GameEvents.SendCustomGameEventToServer("TEST_C2S_DEATH",{uuid:props.uuid})}}   className={prefix+'Card'} ref={Panel => ref.current = Panel}>
                 <DOTAScenePanel ref={(panel:ScenePanel)=>{ $.Msg("刷新"); $.Schedule(0.1,()=>panel?.SetUnit && panel.SetUnit(state.data?.icon,"",true))}} className={"Solider"} hittest={false} map={"unit"}  antialias={true}>
                 <Panel className={"Modifiler_Main"}>
                  {modifilers.map(value=><StateCompoent key={shortid.generate()} name={value.name} duration={value.duration}/>)}
                  </Panel>
                  </DOTAScenePanel>
                <Label text={props.uuid} className={"uuid"}/>
                <Panel className={"threeDimensional"}>
                <Panel className={"attack"}>
                    <Label text={attribute?.attack}/>
                 </Panel>
                    <Panel className={"arrmor"}>
                <Label text={attribute?.arrmor}/>
                    </Panel>
                <Panel className={"heal"}>
                <Label text={attribute?.heal}/>
                </Panel>
            </Panel>
            </Panel>
            {current_effect != "" &&<GenericPanel hittest={false} key={shortid.generate()} ref={panel=>{effect.current = panel;effect.current?.AddClass(effect_select_scenes())}} className={prefix + "effect"}  type={"DOTAParticleScenePanel"} particleName={current_effect} particleonly="true"  startActive="true" cameraOrigin={effect_parameter.current?.cameraOrigin} lookAt={effect_parameter.current?.lookAt} fov="25" />}
            <Panel hittest={true} draggable={true} ref={Panel => dummy.current = Panel} onmouseover={()=>ref.current?.AddClass(prefix+"hover")} onmouseout={()=>ref.current?.RemoveClass(prefix+"hover")} className={prefix+"Carddummy"}/>
        </>
    }

    const solider = useRef<ScenePanel|null>()

    useEffect(()=>{
            solider.current && solider.current.SetUnit(state.data.icon,"",true)
    },[solider.current])

    const You_hand = () => {
        return <Panel className={prefix+'Card'} ref={Panel => ref.current = Panel}/>
    }

    const Solider = () => {
        if(state.Scene == 'GRAVE'){
            return <></>
        }
        if(state.Scene == "REMOVE"){
            return <></>
        }
        return <>
         <Panel hittest={true}
         onmouseactivate={()=>{GameEvents.SendCustomGameEventToServer("TEST_C2S_DEATH",{uuid:props.uuid})}}   className={prefix+'Card'} ref={Panel => ref.current = Panel}>
                 <DOTAScenePanel key={props.uuid} ref={(panel:ScenePanel)=>{solider.current = panel}}  className={"Solider"} hittest={false} map={"unit"}  antialias={true}>
                 <Panel className={"Modifiler_Main"}>
                  {modifilers.map(value=><StateCompoent key={shortid.generate()} name={value.name} duration={value.duration}/>)}
                  </Panel>
                  </DOTAScenePanel>
                <Panel className={"threeDimensional"}>
                <Panel className={"attack"}>
                    <Label text={attribute?.attack}/>
                 </Panel>
                    <Panel className={"arrmor"}>
                <Label text={attribute?.arrmor}/>
                    </Panel>
                <Panel className={"heal"}>
                <Label text={attribute?.heal}/>
                </Panel>
            </Panel>
            </Panel>
            {current_effect != "" &&<GenericPanel hittest={false} key={shortid.generate()} ref={panel=>{effect.current = panel;effect.current?.AddClass(effect_select_scenes())}} className={prefix + "effect"}  type={"DOTAParticleScenePanel"} particleName={current_effect} particleonly="true"  startActive="true" cameraOrigin={effect_parameter.current?.cameraOrigin} lookAt={effect_parameter.current?.lookAt} fov="50" />}
            <Panel hittest={true} draggable={true} ref={Panel => dummy.current = Panel} onmouseover={()=>ref.current?.AddClass(prefix+"hover")} onmouseout={()=>ref.current?.RemoveClass(prefix+"hover")} className={prefix+"Carddummy"}/>
        </>
    }

//
    const card_type = () =>{
        if(GLOABAL_EVENT.instance.GetDATA("isdrag") == false ){
            state.Scene != "HAND" && dummy.current?.AddClass("hide")
        }else{
            dummy.current?.RemoveClass("hide")
        }
        if(state.Scene == "REMOVE"){
            return <></>
        }
        if(state.Scene == "HAND" && Players.GetLocalPlayer() != props.owner){
            return You_hand()
        }
        if(state.Scene == 'HEAPS'){
            return Heaps()
        }
        if(state.type == 'Hero'){
            return <>
            <Panel hittest={true} draggable={true} ref={Panel => ref.current = Panel} onmouseactivate={()=>{$.Msg("ggg");/**GameEvents.SendCustomGameEventToServer("TEST_C2S_DEATH",{uuid:props.uuid})**/}}  className={prefix+'Card'} 
            onmouseover={()=>{state.Scene == "GRAVE" && graveTipFunction.current()}} onmouseout={()=>$.DispatchEvent('DOTAHideTextTooltip')}
            >
                  <Panel className={"Modifiler_Main"}>
                  {modifilers.map(value=><StateCompoent key={shortid.generate()} name={value.name} duration={value.duration}/>)}
                  </Panel>
                  <EquipmentManager key={props.uuid}  owned={props.owner} uuid={props.uuid}/>
                  <DOTAHeroMovie hittest={false}  className={"heroimage"} heroname={(GameUI.CustomUIConfig() as any).CardHero.CardGame[state.Id].name} />
                  <Panel hittest={false}  className={"threeDimensional"}>
                <Panel hittest={false}  className={"attack"}>
                    <Label hittest={false}  text={attribute?.attack}/>
                </Panel>
                <Panel hittest={false}  className={"arrmor"}>
                    <Label hittest={false}  text={attribute?.arrmor}/>
                </Panel>
                <Panel hittest={false}  className={"heal"}>
                    <Label text={attribute?.heal}/>
                </Panel>
            </Panel>
            </Panel>
            {current_effect != "" &&<GenericPanel key={shortid.generate()} hittest={false} ref={panel=>{effect.current = panel;effect.current?.AddClass(effect_select_scenes())}} className={prefix + "effect"}  type={"DOTAParticleScenePanel"} particleName={current_effect} particleonly="true"  startActive="true" cameraOrigin={effect_parameter.current?.cameraOrigin} lookAt={effect_parameter.current?.lookAt} fov="50" />}
            <Panel hittest={true}  draggable={true} ref={Panel => dummy.current = Panel} onmouseover={()=>ref.current?.AddClass(prefix+"hover")} onmouseout={()=>ref.current?.RemoveClass(prefix+"hover")} className={prefix+"Carddummy"}/>
            </>
        }
        if(state.type == 'SmallSkill' || state.type == 'TrickSkill'){
            return Ability()
        }
        if(state.type == 'Solider'){
            return Solider()
        }
        if(state.type == 'EQUIP'){
            return <>
           <Panel draggable={true} ref={Panel => dummy.current = Panel} onmouseover={()=>{frame.current?.AddClass("show");ref.current?.AddClass(prefix+"hover")}} onmouseout={()=>{frame.current?.RemoveClass("show");ref.current?.RemoveClass(prefix+"hover")}} className={prefix+"Carddummy"}/>
           <Panel ref={Panel => ref.current = Panel}  className={prefix+'Card'} >
              <Panel ref={Panel=>frame.current = Panel} className={"card_frame"}/>
              <Panel style={{width:'90%',height:"90%",align:'center center'}}>
              <DOTAItemImage itemname={state.Id} style={{width:"100%",height:"100%"}}/>
            </Panel>
             </Panel>
            </>
        }
        if(state.type = "Summoned"){
            return Summoning()
        }
    }

    return <>
            {card_type()}
           </>
}

export const CardContext = (props:{owner:number}) => {
    const [allheaps,setallheaps] = useState<string[]>([])
    const team = useNetTableKey("Card_group_construction_phase","team")

    useGameEvent('S2C_BRUSH_SOLIDER',()=>{
        const all = CustomNetTables.GetTableValue('Scenes','ALL' + props.owner)
        setallheaps(JsonString2Array(all))
    },[])

    useGameEvent("S2C_BRUSH_ITEM",()=>{
        const all = CustomNetTables.GetTableValue('Scenes','ALL' + props.owner)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
        const all_array = JsonString2Array(all)
        setallheaps(all_array)
    },[])

    $.Msg("刷新了主控制器")


    useEffect(()=>{                                                             
            $.Schedule(0.5,()=>{
                const all = CustomNetTables.GetTableValue('Scenes','ALL' + props.owner)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
                const all_array = JsonString2Array(all)
                setallheaps(all_array)
            })
    },[])


    return <Panel hittest={false} className={"CardContext"}>
        {allheaps.map((uuid,index)=><Card  owner={props.owner} team={team} key={uuid+ props.owner.toString()} index={index} uuid={uuid}/>)}
    </Panel>
}