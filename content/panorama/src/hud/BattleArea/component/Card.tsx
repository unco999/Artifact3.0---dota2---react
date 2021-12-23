import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export enum state{
    牌堆,
    手牌,
    施放,
    战场,    
    坟墓,
    装备,
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
    "双方"
}

const Machine = createMachine({
    id:'Card',
    initial:'defualt',
    states:{
        defualt:{
            entry:"defualt_entry",
            on:{toHAND:"hand",toHEAPS:"heaps",toMIDWAY:"midway",toGOUP:"goup",toLAIDDOWN:"laiddown",toGRAVE:"grave",toREMOVE:"remove"},
            exit:"defualt_exit"
        },
        heaps:{
            entry:'heaps_entry',
            on:{toHAND:"hand"},
            exit:'heaps_exit'
        },
        hand:{
            entry:'hand_entry',
            on:{toHAND:"hand",toHEAPS:"heaps",toMIDWAY:"midway",toGOUP:"goup",toLAIDDOWN:"laiddown",toABILITY:'ability',toREMOVE:'remove'},
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
            entry:"grave_entry",
            exit:"grave_exit"
        },
        remove:{
            entry:"remove_entry"
        }
    }
})

 
export const Card = (props:{index:number,uuid:string,owner:number}) => {
    const prefix = useMemo(()=> props.owner == Players.GetLocalPlayer() ? "my_" : "you_",[props])
    const id = useRef(Math.floor(Math.random() * 20) + 1)
    const ref = useRef<Panel|null>()
    const dummy = useRef<Panel|null>()
    const effect = useRef<Panel|null>()
    const [current_effect,set_current_effect] = useState("")
    const preindex = useRef<number>(-1) //板子的上一次索引
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
                const id = GameEvents.Subscribe("S2C_GET_CARD",(event)=>{
                    if(event.uuid != props.uuid) return; 
                    setstate(event)
                    GameEvents.Unsubscribe(id) 
                })
                GameEvents.SendCustomGameEventToServer("C2S_GET_CARD",{uuid:props.uuid})
            },
            defualt_exit:()=>{

            },
            midway_entry:()=>{
                preindex.current = state.Index
                dummyoperate('add',prefix + 'Midway' + state.Index);
            },
            midway_exit:()=>{
                if(state.Scene != 'MIDWAY') return;
                 dummyoperate('remove',prefix + 'Midway' + preindex.current );
            },
            goup_entry:()=>{
                preindex.current = state.Index
                dummyoperate('add',prefix + 'Goup' + state.Index );
            },
            goup_exit:()=>{
                if(state.Scene != 'GOUP') return;
                 dummyoperate('remove',prefix + 'Goup' + preindex.current);
            },
            laiddown_entry:()=>{
                preindex.current = state.Index
                dummyoperate('add',prefix + 'Laiddown' + state.Index);
            },
            laiddown_exit:()=>{
                if(state.Scene != 'LAIDDOWN') return;
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
                $.Msg("进入了魔法阶段")
                dummyoperate('add',prefix + "ability")
            },
            ability_exit:()=>{
                dummyoperate('remove',prefix + "ability")
            },
            grave_entry:()=>{
                dummyoperate('add',prefix + "death")
                    dummyoperate('remove',prefix + 'Laiddown' + state.Index)
                    dummyoperate('remove',prefix + 'Goup' + state.Index)
                    dummyoperate('remove',prefix + 'Midway' + state.Index)
                    dummyoperate('add',prefix + "ingrave")
                    $.Msg("有牌死亡了")
            },
            remove_entry:()=>{
                $.Msg("有牌直接被删除了")
                dummyoperate('add',prefix + "death")
            }
        }
    })

    useEffect(()=>{
        state.Scene && send("to" + state.Scene)
    },[state])

    /** uuid获得时发送获取属性回调 */ 

    /**获取当前属性 */
    useGameEvent("S2C_SEND_ATTRIBUTE",(event)=>{
        if(event.uuid == props.uuid){
            $.Msg("客户端受到了伤害事件")
            setattribute(event)
        }
    },[props.uuid])

    useEffect(()=>{
        GameEvents.SendCustomGameEventToServer("C2S_GET_ATTRIBUTE",{uuid:props.uuid})
    },[props.uuid])

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

    /**卡牌改变场景 */
    useGameEvent("S2C_CARD_CHANGE_SCENES",(event)=>{
        if(props.uuid != event.uuid) return
        setstate(event)
    },[setstate,xstate])

    /**卡牌死亡特效 */
    useGameEvent("S2C_SEND_DEATH_ANIMATION",(event)=>{
        if(props.uuid != event.uuid) return
        const _random = (Math.floor(Math.random() * 3)+1)
        ref.current?.AddClass(prefix + "death_animation"+ _random)
        ref.current?.RemoveClass("select_target")
        $.Schedule(1.5,()=>{
            ref.current?.AddClass(prefix + "death")
            ref.current?.RemoveClass(prefix + "death_animation"+ _random)
        })
    },[props.uuid])

    /**卡牌攻击事件 */
    useGameEvent("S2C_SEND_ATTACK",(event)=>{
        if(props.uuid != event.uuid) return
        $.Msg(props.uuid,"开始攻击了!!!!!!!!!!!")
        ref.current?.AddClass(prefix + "attack_animation")
        $.Schedule(1.5,()=>{
            ref.current?.RemoveClass(prefix + "attack_animation")
        })
    },[props.uuid])

    useGameEvent("S2C_SKILL_READY",(event)=>{
        if(props.uuid != event.uuid) return
        ref.current?.AddClass("skill_ready")
        $.Msg(props.uuid + "开始释放法术")
    },[props.uuid])

    /**该面板被作为可选目标被高亮 */
    useGameEvent("S2C_SEATCH_TARGET_OPEN",(event)=>{
        if(props.uuid != event.uuid) return
        ref.current?.AddClass("select_target")
        registrationCanBeHitInTheEvent(true)
        // set_current_effect("particles/killstreak/killstreak_ti10_hud_lv1.vpcf")
    },[props.uuid])

    //注册unit面板可被拖入事件 比如被魔法击中
    const registrationCanBeHitInTheEvent = (open:boolean) => {
        open ? $.RegisterEventHandler( 'DragDrop', dummy.current!, OnDragDrop ) : $.RegisterEventHandler( 'DragDrop', dummy.current!, ()=>{} );
        open ? $.RegisterEventHandler( 'DragEnter', dummy.current!, OnDragEnter ) : $.RegisterEventHandler( 'DragEnter', dummy.current!, ()=>{});
        open ? $.RegisterEventHandler('DragLeave',dummy.current!,OnDragLeave) :  $.RegisterEventHandler( 'DragLeave', dummy.current!, ()=>{});
    }

    useGameEvent("S2C_SEND_UP_EQUIMENT_SHOW",(event)=>{
        if(props.uuid != event.uuid) return;
        set_current_effect("particles/units/heroes/hero_tusk/tusk_walruspunch_txt_ult.vpcf")
        $.Schedule(1.5,()=>{
            set_current_effect("")
        })
    },[props.uuid]) 

    //技能目标关闭高亮
    useGameEvent("S2C_SEATCH_TARGET_OFF",(event)=>{
        if(props.uuid != event.uuid) return
        ref.current?.RemoveClass("select_target")
        registrationCanBeHitInTheEvent(false)
    },[props.uuid])
    
    //技能释放主体提示
    useGameEvent("S2C_SKILL_OFF",(event)=>{
        if(props.uuid != event.uuid) return
        ref.current?.RemoveClass("skill_ready")
    },[props.uuid]) 

    // //被命中魔法伤害
    // useGameEvent("S2C_HURT_DAMAGE",(event)=>{
    //     if(props.uuid != event.uuid) return
    //     set_current_effect("particles/econ/items/mirana/mirana_starstorm_bow/mirana_starstorm_starfall_attack.vpcf")
    //     $.Msg(props.uuid,"被命中")
    // },[props.uuid])

    useEffect(()=>{
        if(state.Scene == "GOUP" || state.Scene == "MIDWAY" || state.Scene == "LAIDDOWN"){
            const id = GameEvents.Subscribe("S2C_HURT_DAMAGE",(event)=>{
                if(props.uuid != event.uuid) return
                $.Msg(props.uuid,"激活了一次事件")
                set_current_effect("particles/econ/items/centaur/centaur_ti6_gold/centaur_ti6_warstomp_gold.vpcf");
                ref.current?.AddClass("hurt")
                $.Schedule(1.5,()=>{
                    set_current_effect("")
                    ref.current?.RemoveClass("hurt")
                })
            })
            return ()=>GameEvents.Unsubscribe(id)
        }
    },[props.uuid,state])

    $.Msg("状态太太",state)

    //drag事件
    useEffect(()=>{
        if(state.type == "Solider") return;
        if(xstate.value == 'hand' && props.owner == Players.GetLocalPlayer()){
            dummy.current && $.RegisterEventHandler( 'DragStart', dummy.current!, OnDragStart );
            dummy.current && $.RegisterEventHandler( 'DragEnd',dummy.current!, OnDragEnd);
        }
        //暂时注释掉可以拖入的组件
        // if(xstate.value == 'midway' || xstate.value == 'goup' || xstate.value == 'laiddown'){
        //     $.RegisterEventHandler( 'DragDrop', ref.current!, OnDragDrop );
        //     $.RegisterEventHandler( 'DragEnter', ref.current!, OnDragEnter );
        // }
    },[props.owner,xstate.value])

    //改变index事件
    useGameEvent("S2C_SEND_INDEX",(event)=>{
        const keys = Object.keys(event)
        if(keys[0] == props.uuid && xstate.value == 'hand'){
            $.Msg("更新index",event[keys[0]])
            dummyoperate('remove',prefix + "Hand"+ preindex.current)
            preindex.current = event[keys[0]]
            dummyoperate('add',prefix + "Hand"+ event[keys[0]])
        }
    },[xstate])

    const OnDragStart = (panelId:any, dragCallbacks:any) =>{
        const displayPanel = $.CreatePanel( "Panel", $.GetContextPanel(), "cache" ) as HeroImage
        $.Msg("注册了data是",state.data)
        //**加入拖动的是装备卡片 */
        if(state.type == "EQUIP" && ref.current){
            parent.current = ref.current?.GetParent()
            ref.current.Data().data = state.data
            dragCallbacks.displayPanel = ref.current;
            dragCallbacks.offsetX = -30; 
            dragCallbacks.offsetY = -30;
            ref.current?.AddClass("dragEquip")
            return
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
    const C2S_SEATCH_TARGET = (bool:boolean) =>{
        GameEvents.SendCustomGameEventToServer(bool == true ?  "C2S_SEATCH_TARGET_OPEN" : "C2S_SEATCH_TARGET_OFF",{
            has_hero_ability:"18",
            magic_brach:Magic_brach.本路,
            magic_range:Magic_range.全体,
            magic_team:Magic_team.敌方,
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
        dragCallbacks.DeleteAsync( 0 );
        const container = ConpoentDataContainer.Instance.NameGetNode("arrow_tip").current
        container.close()
        state.type == 'Hero' && closeOptionalPrompt()
        C2S_SEATCH_TARGET(false) // 关闭技能提示器
    }

    /**打开分路可选提示器 */
    const splitOptionalPrompt = () =>{
        GameEvents.SendCustomGameEventToServer("C2S_GET_CANSPACE",{})
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

    const OnDragDrop = (panelId:any, dragCallbacks:any) => {
        const id = dragCallbacks.Data().id
        $.Msg("执行了一次客户端释放技能事件")
        GameEvents.SendCustomGameEventToServer("C2S_SPELL_SKILL",{SKILL_ID:id})
    }

    const OnDragLeave = () =>{
    }
    
    const OnDragEnter = () =>{
        $.Msg("鼠标进入了面板")
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
              <Panel ref={Panel=>frame.current = Panel} className={"card_frame"}/>
              <Panel style={{width:'90%',height:"90%",align:'center center'}}>
              <DOTAAbilityImage abilityname={"elder_titan_echo_stomp"} className={'abilityimage'}/>
        </Panel>
        </Panel>
        </>
    }

    const You_hand = () => {
        return <Panel className={prefix+'Card'} ref={Panel => ref.current = Panel}/>
    }

    const Solider = () => {
        if(state.Scene == 'GRAVE'){
            return <></>
        }
        return <>
         <Panel hittest={true} onmouseactivate={()=>{$.Msg("ggg");GameEvents.SendCustomGameEventToServer("TEST_C2S_DEATH",{uuid:props.uuid})}}   className={prefix+'Card'} ref={Panel => ref.current = Panel}>
                <Label text={"小兵"} style={{fontSize:'30px',color:'white',textShadow:'0px 0px 0px 5.0 black',align:'center center'}}/>
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
            {current_effect != "" &&<GenericPanel hittest={false} ref={panel=>{effect.current = panel;effect.current?.AddClass(effect_select_scenes())}} className={prefix + "effect"}  type={"DOTAParticleScenePanel"} particleName={current_effect} particleonly="true"  startActive="true" cameraOrigin="0 600 0" lookAt="0 0 0" fov="40" />}
            <Panel hittest={true} draggable={true} ref={Panel => dummy.current = Panel} onmouseover={()=>ref.current?.AddClass(prefix+"hover")} onmouseout={()=>ref.current?.RemoveClass(prefix+"hover")} className={prefix+"Carddummy"}/>
        </>
    }


    const card_type = useMemo(() =>{
        if(GLOABAL_EVENT.instance.GetDATA("isdrag") == false ){
            $.Msg("不对 要给板子加上隐藏")
            state.Scene != "HAND" && dummy.current?.AddClass("hide")
        }else{
            $.Msg("把马甲的皮删除")
            dummy.current?.RemoveClass("hide")
        }
        if(state.Scene == "HAND" && Players.GetLocalPlayer() != props.owner){
            return You_hand()
        }
        if(state.Scene == 'HEAPS'){
            return Heaps()
        }
        if(state.type == 'Hero'){
            return <>
            <Panel hittest={true} ref={Panel => ref.current = Panel} onmouseactivate={()=>{$.Msg("ggg");/**GameEvents.SendCustomGameEventToServer("TEST_C2S_DEATH",{uuid:props.uuid})**/}}  className={prefix+'Card'} >
                  <EquipmentManager uuid={props.uuid}/>
                  <Label text={"id:"+state.Id + "|" + props.uuid} className={"uuid"}/>
                  <DOTAHeroImage className={"heroimage"} heroimagestyle={'portrait'} heroid={id.current as HeroID} />
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
            {current_effect != "" &&<GenericPanel hittest={false} ref={panel=>{effect.current = panel;effect.current?.AddClass(effect_select_scenes())}} className={prefix + "effect"}  type={"DOTAParticleScenePanel"} particleName={current_effect} particleonly="true"  startActive="true" cameraOrigin="0 600 0" lookAt="0 0 300" fov="50" />}
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
              <DOTAItemImage itemname={"item_circlet"} style={{width:"100%",height:"100%"}}/>
            </Panel>
             </Panel>
            </>
        }
    },[props.index,props.owner,props.uuid,xstate,state,attribute,current_effect,update])

    return <>
            {card_type}
           </>
}

export const CardContext = (props:{owner:number}) => {
    const [allheaps,setallheaps] = useState<string[]>([])
    const [allsummon,setallsummon] = useState<string[]>([])

    useGameEvent('S2C_BRUSH_SOLIDER',()=>{
        const table = CustomNetTables.GetTableValue("Scenes","summon"+props.owner)
        setallsummon(JsonString2Array(table))
        $.Msg(table)
    },[])

    useEffect(()=>{                                                             
            $.Schedule(0.5,()=>{
                const all = CustomNetTables.GetTableValue('Scenes','ALL' + props.owner)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
                const all_array = JsonString2Array(all)
                const table = CustomNetTables.GetTableValue("Scenes","summon"+props.owner)
                setallsummon(JsonString2Array(table))
                setallheaps(all_array)
                $.Msg("列怪数量")    
                $.Msg(table)
            })
    },[])


    return <Panel hittest={false} className={"CardContext"}>
        {allheaps.map((uuid,index)=><Card owner={props.owner}  key={uuid} index={index} uuid={uuid}/>)}
        {allsummon.map((uuid,index)=><Card owner={props.owner}  key={uuid} index={index} uuid={uuid}/>)}
    </Panel>
}