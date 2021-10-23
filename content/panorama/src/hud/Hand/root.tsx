import React from 'react';
import { render } from 'react-panorama';
import { Main } from './component/main';

render(<Main/>, $.GetContextPanel()); // 默认在中间渲染的红色REACT-PANORAMA标志，从这里开始修改为你自己喜欢的

(() => {
    $.Msg("1111asdasda111")
    $.Msg("asda1111232121213131231231sd")
    // GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_TOP_HEROES, false); // 你也可以按你之前喜欢的方式写代码
    // GameUI.SetDefaultUIEnabled(DotaDefaultUIElement_t.DOTA_DEFAULT_UI_TOP_TIMEOFDAY, false);
})();
