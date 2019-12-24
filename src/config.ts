import React from 'react';
import {createBrowserHistory} from "history";

let serverUrl = 'http://121.43.192.193:3001/';
if (process.env.NODE_ENV === 'development'){
    serverUrl = 'http://localhost:3001/';
}

const types = [
    "其他", "断经","断纬","横档","粗(经)纬","破洞","异纱","勾纱","结头","污渍","色条",
    "擦伤","折痕","接匹","脱针","塞版","脱版","修痕","鸡爪痕","激光印","筘路",
    "死棉","色档","色花","花衣毛","滑移","松板印","松紧经","破边", "未知", "异常", "折痕(正常)"
];

const fabricTypes = [
    '染色梭织',
    '染色针织',
    '印花梭织',
    '印花针织',
    '异常',
];

const LetterToTypes: {[key:string]:string} = {'A':'稀痕', 'B':'挡痕', 'C':'扣痕', 'D':'破洞', 'E':'油污', 
'F':'沟纱', 'G':'断纬', 'H':'断经', 'I':'色段', 'J':'鸡爪痕', 'K':'色污', 
'L':'直条/染条','M':'折痕', 'N':'异纤', 'O':'粗纱', 'P':'擦伤', 'Q':'接疋', 
'R':'脏污', 'S':'结头/绵梨', 'T':'机缸印', 'U':'修痕', 'V':'塞版', 'W':'脱版'}
const _history = createBrowserHistory();
const HistoryContext = React.createContext(_history);
export {serverUrl, HistoryContext, _history, types, fabricTypes,LetterToTypes};

