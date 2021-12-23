import React from 'react';
import { render } from 'react-panorama';
import {Main} from './component/main'


render(<Main/>, $.GetContextPanel()); // 默认在中间渲染的红色REACT-PANORAMA标志，从这里开始修改为你自己喜欢的

