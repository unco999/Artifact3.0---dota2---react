
import { GamaEvent_All_register } from "./Build/Gamevent_All_register";
import { energyBarManager } from "./feature/energyBar";
import { select_the_prompt } from "./feature/select_the_prompt";
import { spell_skill } from "./feature/spell_skill";
import { BattleArea, Cardheaps, GoUp, Hand, LaidDown, Midway, ScenesManager } from "./instance/Scenes";
import { TowerGeneralControl } from "./instance/Tower";
import { Timers } from "./lib/timers";
import { reloadable } from "./lib/tstl-utils";
import { BattleGameLoop } from "./Manager/BattleGameLoop";
import { ChooseHeroCardLoop, RedSelectstage } from "./System/ChooseHeroCard";
import { KV } from "./System/KV";
import './instance/Equip'
import { brash_solidier } from "./feature/brush_solidier";
import { add_cuurent_glod, BATTLE_BRACH_STATE } from "./Manager/nettablefuc";
import "./modifiler/modifiler"
import './equip/item'

const heroSelectionTime = 0;

declare global {
    interface CDOTAGamerules {
        Addon: GameMode;
        KV:KV
        ChooseHeroCardLoop:ChooseHeroCardLoop
        Red:CDOTAPlayer //红队
        Blue:CDOTAPlayer //蓝队
        gamemainloop:BattleGameLoop
        SceneManager:ScenesManager
        TowerGeneralControl:TowerGeneralControl
        select_the_prompt:select_the_prompt // 技能选择器
        spell_skill:spell_skill
        energyBarManager:energyBarManager
        brash_solidier:brash_solidier
        bot:number
    }
}
enum optionMask {
    蓝队有操作 = 0x000001,
    红队有操作 = 0x000002,
    蓝队点击跳过 = 0x000004,
    红队点击跳过 = 0x000008,
    默认状态 = 10
}

@reloadable
export class GameMode {
    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource("particle", "particles/units/heroes/hero_meepo/meepo_earthbind_projectile_fx.vpcf", context);
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts", context);
    }

    public static Activate(this: void) {
        print("option defualt  000010010为正确",(optionMask.默认状态 | optionMask.红队有操作) | optionMask.红队点击跳过)
        print("option defualt  1000为正确",optionMask.红队有操作 | optionMask.红队点击跳过 ^ optionMask.红队点击跳过)
        GameRules.Addon = new GameMode();
        GameRules.KV = new KV();
        GameRules.select_the_prompt = new select_the_prompt()
        GameRules.spell_skill = new spell_skill()
        GameRules.brash_solidier = new brash_solidier()
        GameRules.SceneManager = new ScenesManager()
    }

    constructor() {
        this.configure();
        ListenToGameEvent("game_rules_state_change", () => this.game_rules_state_change(), undefined);
    }

    private configure(): void {
        GameRules.SetCustomGameTeamMaxPlayers(DOTATeam_t.DOTA_TEAM_GOODGUYS, 1);
        GameRules.SetCustomGameTeamMaxPlayers(DOTATeam_t.DOTA_TEAM_BADGUYS, 1);
        GameRules.SetShowcaseTime(0);
        GameRules.SetHeroSelectionTime(heroSelectionTime);
        const gameEntity = GameRules.GetGameModeEntity()
        gameEntity.SetHudCombatEventsDisabled(false)
        gameEntity.SetFogOfWarDisabled(false);
        gameEntity.SetSelectionGoldPenaltyEnabled(false);
        gameEntity.SetLoseGoldOnDeath(false);
        GameRules.SetHeroRespawnEnabled(false);
        GameRules.SetPreGameTime(3);
        GameRules.SetCustomGameSetupTimeout(-1)
        GameRules.SetSameHeroSelectionEnabled(true);
        GamaEvent_All_register.register() // 所有的事件注册
        // if (IsInToolsMode()) {
        //     GameRules.SetPreGameTime(0);
        // }
    }


    private game_rules_state_change() {
        let newState = GameRules.State_Get();
        if( newState == DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME){
            for (let i: PlayerID = 0; i <= 24; ++i) {
                let player = PlayerResource.GetPlayer(i as PlayerID);
                if (player) {
                    if(!GameRules.Blue){
                        GameRules.Blue = player
                        if(GameRules.Blue.GetPlayerID() == GameRules.bot) print("蓝色是电脑")
                        continue 
                    }
                    if(!GameRules.Red){
                        GameRules.Red = player
                        if(GameRules.Red.GetPlayerID() == GameRules.bot) print("红色是电脑")
                        continue
                    }
                }
            }
            CustomNetTables.SetTableValue("Card_group_construction_phase","team",{red:GameRules.Red.GetPlayerID(),blue:GameRules.Blue.GetPlayerID()})
            add_cuurent_glod(0,GameRules.Red.GetPlayerID())
            add_cuurent_glod(0,GameRules.Blue.GetPlayerID())
            GameRules.energyBarManager = new energyBarManager()
            GameRules.ChooseHeroCardLoop = new ChooseHeroCardLoop() // 英雄轮询阶段
            GameRules.ChooseHeroCardLoop.SetcuurentsettingState = new RedSelectstage(1) // 暂时以红队开始选择  选牌次数为一次
        }
        if (newState == DOTA_GameState.DOTA_GAMERULES_STATE_GAME_IN_PROGRESS) {
        }
        if (newState == DOTA_GameState.DOTA_GAMERULES_STATE_CUSTOM_GAME_SETUP) {
            if(IsInToolsMode()){
                if(GameRules.Blue == undefined){
                    const bot = Tutorial.AddBot("","","",true)
                    let playerCount = PlayerResource.GetPlayerCount() - 1;
                    GameRules.bot = playerCount
                }
            }
        }
}


    public Reload() {
        print("Script reloaded!");
    }
}