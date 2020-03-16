import React from 'react';
import {createBrowserHistory} from "history";

let serverUrl = 'http://139.224.193.13:3001/';
if (process.env.NODE_ENV === 'development'){
    serverUrl = 'http://localhost:3001/';
}

// const types = [
//     "其他", "横档","断经","断纬","松紧经","油污","异纤","结头","接匹","破洞","筘痕",
//     "粗纱","脱针","塞版", '接版', '抽纱', '擦伤', '接色污', 
//     '锈渍', '色条', '油砂', '修痕', '塞折痕', '渗色',
//     '断纱', '跳花',  '紧边', '松边', '破边',
//     '错花', '搭色', '跑花', '经起毛'];

const fabricTypes = [
    '染色梭织',
    '染色针织',
    '印花梭织',
    '印花针织',
    '异常',
];

const LetterToTypes: {[key:string]:string} = {'A':'横档', 'B':'断经', 'C':'断纬', 'D':'松紧经', 'E':'油污', 
'F':'异纤', 'G':'结头', 'H':'接匹', 'I':'破洞', 'J':'筘痕', 'K':'粗纱', 
'L':'脱针','M':'塞版', 'N':'接版', 'O':'抽纱', 'P':'擦伤', 'Q':'接色污', 
'R':'锈渍', 'S':'色条', 'T':'油砂', 'U':'修痕', 'V':'塞折痕', 'W':'渗色',
'X':'断纱', 'Y':'跳花', 'Z':'其他', '2A':'紧边', '2B':'松边', '2C':'破边',
'2D':'错花', '2E':'搭色', '2F':'跑花', '2H':'经起毛'}
var flawTypes : Array<string>= [];
var item;
for (item in LetterToTypes){
    flawTypes.push(item+"-"+LetterToTypes[item])
}
const _history = createBrowserHistory();
const HistoryContext = React.createContext(_history);
interface D2 {
    x: number,
    y: number
}

interface BoxInteface {
    type:string;
    annotation: string;
}

export interface BoundingBox extends BoxInteface{
    x: number,
    y: number,
    w: number,
    h: number,
}

export interface labelBox extends BoxInteface{
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    dist: number,
}

export interface PolygonBox extends BoxInteface{
    points:Array<D2>,
}
export {serverUrl, HistoryContext, _history, fabricTypes,LetterToTypes,flawTypes};

