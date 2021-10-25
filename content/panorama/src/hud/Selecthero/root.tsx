import React from 'react';
import { render } from 'react-panorama';
import { Main } from './component/main';

render(<Main/>, $.GetContextPanel()); // 默认在中间渲染的红色REACT-PANORAMA标志，从这里开始修改为你自己喜欢的

(function hide_system_panel(){
    const hudRoot = $.GetContextPanel()
    .GetParent()!
    .GetParent()!
    .GetParent()!
    function HideHudElements(name: string) {
        var element = hudRoot.FindChildTraverse(name);
        if (element != null){
            element.style.visibility = "collapse";
        }
    }
    HideHudElements("BottomPanels");
    HideHudElements("AvailableItemsContainer");
    HideHudElements("BottmPanelContainer");
    HideHudElements("BacktoHeroGrid");
    HideHudElements("Header");
    HideHudElements("MainContents");
    HideHudElements("HeaderCenter");
    HideHudElements("RadiantTeamPlayers");
    HideHudElements("DireTeamPlayers");
    HideHudElements("PreMinimapContainer");
    HideHudElements("ToggleScoreboardButton");
    HideHudElements("GlyphScanContainer");
    HideHudElements("inventory_tpscroll_container");
    HideHudElements("inventory_neutral_slot_container");
    HideHudElements("quickstats");
    HideHudElements("KillCam");
    HideHudElements("stash");
    HideHudElements("stackable_side_panels");
    HideHudElements("SpectatorItemsButton");
    HideHudElements("GoldGraphButton");
    HideHudElements("XPGraphButton");
    HideHudElements("WinGraphButton");
    HideHudElements("SpectatorOptionsButton");
    HideHudElements("SpectatorGraph");
    HideHudElements("RoshanTimerContainer");
    HideHudElements("DisconnectButton");
    HideHudElements("spectator_game_stats");
    HideHudElements("spectator_quickstats");
    HideHudElements("minimap_container");
    HideHudElements("lower_hud");
    HideHudElements("topbar")
 })()

