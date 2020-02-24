import {LabeledImage} from './LabeledImage';
import React, {useEffect, useState} from 'react';
import { userInfo } from 'os';
import {Row, Col,Icon, Button, Input, message,Select, InputNumber} from 'antd';
import { getData } from './utils';
import { serverUrl, types, fabricTypes, LetterToTypes} from './config';
import { async, reject } from 'q';
import App from './App';
import {changeUrl} from './Sider';
import {_history} from "./config";
import {postData} from "./utils";
import { number } from 'prop-types';
import { SSL_OP_EPHEMERAL_RSA } from 'constants';


const {Option} = Select;

interface D2 {
    x: number,
    y: number
}

interface PBox{
    points:Array<D2>,
    annotation: string,
}

interface BBox{
    x: number;
    y: number;
    h: number;
    w: number;
    annotation: string;   
}

interface FileId{
    fileId:number
}
 

interface jsonProps{
    url: string,
    labeledUser: string,
    labeledDate: string,
    defaultBoxes: Array<BBox | PBox>,
    defaultSceneType: string|undefined;
}
interface Label{
    type: string;
    distance: number;
    naturalX: number;
    y: number;
}


const rightStart = [0, 42.4, 86.1, 129.6]

const rightEnd = [50.4, 93.0, 135.1, 179.4]

const leftStart = [179.4-rightEnd[0],179.4-rightEnd[1],179.4-rightEnd[2],179.4-rightEnd[3]]
const leftEnd = [179.4-rightStart[0],179.4-rightStart[1],179.4-rightStart[2],179.4-rightStart[3]]

const {Search} = Input;

var loadState = false;

export const ImageMainPage:React.FC = function(){
    const [fileId, setFileId] = useState(0);
    const [fileName, setFileName] = useState("");
    const [location, setLocation] = useState(0);
    const [showIndex, setShowIndex] = useState(-1);
    const [style_1, setStyle_1] = useState<boolean>(true);
    const [style_2, setStyle_2] = useState<boolean>(true);
    const [style_3, setStyle_3] = useState<boolean>(true);
    const [style_4, setStyle_4] = useState<boolean>(true);
    const [isLabelLeft, setIsLabelLeft] = useState<boolean>(true);
    const [label, setLabel] = useState<Label>({    
        type: "A",
        distance: 0,
        naturalX: 0,
        y: 0});
   // const [loadState, setLoadState] = useState<boolean>(false);
    const [priorX, setPriorX] = useState([]);
    // @ts-ignore
    const [predictList, setPredictList] = useState<[string]>([]);
    // @ts-ignore
    const [imageUrls, setImageUrls] = useState<[String]>([]);
    // @ts-ignore
    const [jsonDataList, setJsonDataList] = useState<[jsonProps]>([
    {
        url: "",
        labeledUser: "",
        labeledDate: "",
        defaultBoxes: [],
        defaultSceneType: undefined,
    },
    {
        url: "",
        labeledUser: "",
        labeledDate: "",
        defaultBoxes: [],
        defaultSceneType: undefined,
    },
    {
        url: "",
        labeledUser: "",
        labeledDate: "",
        defaultBoxes: [],
        defaultSceneType: undefined,
    },
    {
        url: "",
        labeledUser: "",
        labeledDate: "",
        defaultBoxes: [],
        defaultSceneType: undefined,
    },
    {
        url: "",
        labeledUser: "",
        labeledDate: "",
        defaultBoxes: [],
        defaultSceneType: undefined,
    },
    {
        url: "",
        labeledUser: "",
        labeledDate: "",
        defaultBoxes: [],
        defaultSceneType: undefined,
    },
    {
        url: "",
        labeledUser: "",
        labeledDate: "",
        defaultBoxes: [],
        defaultSceneType: undefined,
    },
    {
        url: "",
        labeledUser: "",
        labeledDate: "",
        defaultBoxes: [],
        defaultSceneType: undefined,
    },
    {
        url: "",
        labeledUser: "",
        labeledDate: "",
        defaultBoxes: [],
        defaultSceneType: undefined,
    },
    {
        url: "",
        labeledUser: "",
        labeledDate: "",
        defaultBoxes: [],
        defaultSceneType: undefined,
    },
    {
        url: "",
        labeledUser: "",
        labeledDate: "",
        defaultBoxes: [],
        defaultSceneType: undefined,
    },
    {
        url: "",
        labeledUser: "",
        labeledDate: "",
        defaultBoxes: [],
        defaultSceneType: undefined,
    }]);
    
    
    const [imageIndex, setImageIndex] = useState(-10000);


    const getJsonData  = async function (){
        getData(serverUrl+'getJsonData/'+ fileName + '/' + imageIndex).then(res=>{
            if(res.status!==200){
                message.error("获取失败")
                throw 'fail';
            }
            else{
                return res.json();
            }
        }).then(async (data:Array<jsonProps>)=>{
            //message.success(JSON.stringify(data));
            if(data === undefined)
            {
                throw 'fail';
            }
            else{
                let jsonData = data.map(function(item:jsonProps){
                    let _labeledUser:string = item.labeledUser;
                    let _labeledDate:string = item.labeledDate;
                    let _defaultBoxes = item.defaultBoxes;
                    let _defaultSceneType: string|undefined = item.defaultSceneType;
                    if (typeof  _defaultSceneType == 'string'&& fabricTypes.indexOf(_defaultSceneType) == -1){
                        _defaultSceneType = undefined;
                    }
                    for (let box of _defaultBoxes) {
                        if (types.indexOf(box.annotation) === -1 && box.annotation!='label') {
                            box.annotation = '未知';
                        }
                    }
                    return {
                        url: serverUrl + item.url,
                        labeledUser: _labeledUser,
                        labeledDate: _labeledDate,
                        defaultBoxes: _defaultBoxes,
                        defaultSceneType: _defaultSceneType,
                    }   
                })
                setJsonDataList(jsonData);
                message.success("更新成功");
            }
        });
    };

    const getImageData = (fileid:number)=>{
        getData(serverUrl + "file/getFileDataById/" +fileid).then(res=>{
            return res.json();
        }).then(res=>{
            setFileName(res.imageFile.fileName);
            setLocation(res.imageFile.locationTag);
        })
    };

    const getPredicts = ()=>{
        getData(serverUrl + "file/getPredicts/" +fileName).then(res=>{
            if(res.status === 200)
                return res.json();
            else {
                throw 'fail';
            }
        }).then(data=>{
            setPredictList(data.predicts);
        })
    };

    useEffect(()=>{
        if(predictList.length > location){
            let predictStr = predictList[location];
            let arr = predictStr.split("/");
            let index = arr[1].split(".");
            setImageIndex(parseInt(index[0]));
        }
    },[location,predictList]);

    useEffect(()=>{
        if(imageIndex != -10000){
            const dataChange = async()=>{
                loadState = true;
                getJsonData().then(res=>{
                    loadState = false;
                });
            }
            dataChange();
            styleInit();
        }
    },[imageIndex]);


    useEffect(()=>{
        if(fileName!= "")
        getPredicts();
    },[fileName]);

    useEffect(()=>{
        getData(serverUrl + 'file/getUsedFileId').then(res=>{
            if(res.status === 200)
                return res.json();
            else
                throw 'fail';
        }).then((data:FileId)=>{
            if(data.fileId !== undefined)
                setFileId(data.fileId);
            if(data.fileId == -1){
                setTimeout(()=>{
                    _history.push('/fileLoader');
                    changeUrl("/fileLoader");
                }, 200);
                return;
            }
            else{
                getImageData(data.fileId);
            }
        });
    }, []);

    const onClickShow = (index:number)=>{
        setShowIndex(index);
        //setPriorX(0.0);
    }

    const onClickLocation = (value: number)=>{
        if(value < 0)
            message.error("已经到顶部了");
        else if(value >= predictList.length)
            message.error("已经到底部了");
        else{
            setLocation(value);
            loadState = true;
            postData(serverUrl + 'file/writeLocation', {fileName, location: value}).then(res=>{
                loadState = false;
            }).catch(err=>{
                if(err) throw err;
            });
        }
    }

    const onClickIndex = (value: number)=>{
        setImageIndex(value);

    }



    const returnBack = async ()=>{
        // TODO
        setShowIndex(-1);
    }

    const app = (showIndex!==-1)?(
        <App url={jsonDataList[showIndex].url}
        labeledUser={jsonDataList[showIndex].labeledUser}
        labeledDate={jsonDataList[showIndex].labeledDate}
        defaultType={LetterToTypes[label.type]}
        defaultBoxes={jsonDataList[showIndex].defaultBoxes}
        defaultSceneType={jsonDataList[showIndex].defaultSceneType}
        returnBack = {returnBack}
        setLabelBack = {(label:Label)=>{setLabel(label)}}
        priorNaturalX = {showIndex>=4&&showIndex<=7?priorX[7-showIndex]:0}
       //priorNaturalX={priorX[0]}
        priorY = {label.y}
        isLabelLeft = {isLabelLeft}
        />) : undefined;
    

    const exit = ()=>{
        postData(serverUrl + 'file/setUserFile',{filename: ""}).then(res=>{
            if(res.status === 400){
                message.error("出现错误");
            }
            else if(res.status === 200){
                postData(serverUrl + 'file/setFileUser',{fileid: fileId, username: "", ifused: false}).then(res=>{
                    if(res.status === 400){
                        message.error("出现错误");
                    }
                    else if(res.status === 200){
                        setTimeout(()=>{
                            _history.push('/fileLoader');
                            changeUrl("/fileLoader");
                        }, 200);
                    }
                });
            }
        });
    };
    const styleInit = function(){
        setStyle_1(true);
        setStyle_2(true);
        setStyle_3(true);
        setStyle_4(true);
    }

    const onSet = function (){
        styleInit();
        let naturalX = label.naturalX
        let XList = [0,0,0,0]
        if(isLabelLeft){
            if(naturalX>leftStart[0] && naturalX<leftEnd[0]){
                setStyle_1(false);
                XList[0]=naturalX-leftStart[0];
            }
            if(naturalX>leftStart[1] && naturalX<leftEnd[1]){
                setStyle_2(false);
                XList[1] = naturalX-leftStart[1];
            }
            if(naturalX>leftStart[2] && naturalX<leftEnd[2]){
                setStyle_3(false);
                XList[2]=naturalX-leftStart[2];
            }
            if(naturalX>leftStart[3] && naturalX<leftEnd[3]){
                setStyle_4(false);
                XList[3]=naturalX-leftStart[3];
            }
        }
        else{
            if(naturalX>rightStart[0] && naturalX<rightEnd[0]){
                setStyle_1(false);
                XList[0]=rightEnd[0] - naturalX;
            }
            if(naturalX>rightStart[1] && naturalX<rightEnd[1]){
                setStyle_2(false);
                XList[1]=rightEnd[1] - naturalX;
            }
            if(naturalX>rightStart[2] && naturalX<rightEnd[2]){
                setStyle_3(false);
                XList[2]=rightEnd[2] - naturalX;
            }
            if(naturalX>rightStart[3] && naturalX<rightEnd[3]){
                setStyle_4(false);
                XList[3]=rightEnd[3] - naturalX;
            }     
        }
            // @ts-ignore
        setPriorX(XList)
    }

    const style_normal = {boxShadow: '3px 3px 10px 10px rgba(0, 0, 0, 0.2)'};
    const style_selected = {boxShadow: '3px 3px 10px 10px rgba(255, 0, 0, 1)'};


    return(
        <div>
            <div>
                <Row>
                    <Col span={4}>
                        {"文件名： " + fileName}
                    </Col>
                    <Col span={5}>
                        {"当前图像编号：  " + imageIndex}
                    </Col>
                    <Col span={5}>
                        <Button type="danger" onClick= {exit}>退出文件夹</Button>
                    </Col>
                </Row>
                <Row style={{margin:10}}>
                    <Col  span={4}>
                        {"瑕疵类型： " + LetterToTypes[label.type]}
                    </Col>
                    <Col span={4}>
                        {"贴标所在边: " + isLabelLeft?"左":"右"}
                    </Col>
                    <Col span={4}>
                        {"瑕疵距离: " + label.distance}
                    </Col>
                    <Col span={4}>
                        贴标所在高度： {label.y}
                    </Col>
                    <Col span={4}>
                    <Button type="primary" disabled={loadState} onClick={onSet}>设置</Button>
                    </Col>
                </ Row>
                <Row style={{margin: '0 15px 0 15px'}}>         
                    <Col span={3}/>                
                    <Col span={3}>
                            <Button style={{margin: '0px'}} type="primary" disabled={loadState} onClick={()=>{onClickLocation(location-1)}}> 上一个标记点</Button>
                    </Col>
                    <Col span={3}/>
                    <Col span={4}>
                        <Button shape="circle" size="large"  style={{margin: '0 15px 0 15px'}} 
                        disabled={loadState}
                        onClick={()=>{onClickIndex(imageIndex-1)}}>
                        <Icon type="up-circle" theme="filled" style={{fontSize:'40px'}}/>  
                        </Button> 
                    </Col>
                    <Col span={3}>
                            <Button style={{margin: '0px'}} type="primary" disabled={loadState} onClick={()=>{onClickLocation(location+1)}}>下一个标记点</Button>
                    </Col> 
                </Row>  
            </div>
            <div style={{
                width: 800,
                margin: 'auto',
                borderRadius: 8,
                padding: 0,
            }}>
                <Row style={{margin: 10}}>
                    <Col span={5}>
                        <LabeledImage
                        style ={style_normal} 
                        url = {jsonDataList[0].url}
                        bboxes = {jsonDataList[0].defaultBoxes}
                        size = {150}
                        onClick = {()=>{onClickShow(0)}}
                        />
                    </Col>
                    <Col span={5}>
                        <LabeledImage 
                        style ={style_normal} 
                        url = {jsonDataList[1].url}
                        bboxes = {jsonDataList[1].defaultBoxes}
                        size = {150}
                        onClick = {()=>{onClickShow(1)}}
                        />
                    </Col>
                    <Col span={5}>
                        <LabeledImage 
                        style ={style_normal} 
                        url = {jsonDataList[2].url}
                        bboxes = {jsonDataList[2].defaultBoxes}
                        size = {150}
                        onClick = {()=>{onClickShow(2)}}
                        />
                    </Col>
                    <Col span={5}>
                        <LabeledImage 
                        style ={style_normal} 
                        url = {jsonDataList[3].url}
                        bboxes = {jsonDataList[3].defaultBoxes}
                        size = {150}
                        onClick = {()=>{onClickShow(3)}}
                        />
                    </Col>
                </Row>        
                <Row style={{margin:10}}>
                    <Col span={5}>
                        <LabeledImage 
                        style ={style_4?style_normal:style_selected} 
                        url = {jsonDataList[4].url}
                        bboxes = {jsonDataList[4].defaultBoxes}
                        size = {150}
                        onClick = {()=>{onClickShow(4);
                        setIsLabelLeft(true)}}
                        />
                    </Col>
                    <Col span={5}>
                        <LabeledImage 
                        style ={style_3?style_normal:style_selected} 
                        url = {jsonDataList[5].url}
                        bboxes = {jsonDataList[5].defaultBoxes}
                        size = {150}
                        onClick = {()=>{onClickShow(5)}}
                        />
                    </Col>
                    <Col span={5}>
                        <LabeledImage 
                        style ={style_2?style_normal:style_selected}
                        url = {jsonDataList[6].url}
                        bboxes = {jsonDataList[6].defaultBoxes}
                        size = {150}
                        onClick = {()=>{onClickShow(6)}}
                        />
                    </Col>
                    <Col span={5}>
                        <LabeledImage 
                        style ={style_1?style_normal:style_selected} 
                        url = {jsonDataList[7].url}
                        bboxes = {jsonDataList[7].defaultBoxes}
                        size = {150}
                        onClick = {()=>{onClickShow(7)
                        setIsLabelLeft(false)}}
                        />
                    </Col>
                </Row> 
                <Row style={{margin: 10}}>
                    <Col span={5}>
                        <LabeledImage 
                        style ={style_normal} 
                        url = {jsonDataList[8].url}
                        bboxes = {jsonDataList[8].defaultBoxes}
                        size = {150}
                        onClick = {()=>{onClickShow(8)}}
                        />
                    </Col>
                    <Col span={5}>
                        <LabeledImage 
                        style ={style_normal} 
                        url = {jsonDataList[9].url}
                        bboxes = {jsonDataList[9].defaultBoxes}
                        size = {150}
                        onClick = {()=>{onClickShow(9)}}
                        />
                    </Col>
                    <Col span={5}>
                        <LabeledImage 
                        style ={style_normal} 
                        url = {jsonDataList[10].url}
                        bboxes = {jsonDataList[10].defaultBoxes}
                        size = {150}
                        onClick = {()=>{onClickShow(10)}}
                        />
                    </Col>
                    <Col span={5}>
                        <LabeledImage 
                        style ={style_normal} 
                        url = {jsonDataList[11].url}
                        bboxes = {jsonDataList[11].defaultBoxes}
                        size = {150}
                        onClick = {()=>{onClickShow(11)}}
                        />
                    </Col>
                </Row> 
            </div>
            <div>
                <Button shape="circle" size="large"  style={{margin: '0 320px'}}
                disabled={loadState}
                onClick={()=>{onClickIndex(imageIndex+1)}}>
                <Icon type="down-circle" theme="filled" style={{fontSize:'40px'}}/>  
                </Button>  
            </div>
            <div       style={{
                       display: (showIndex !== -1)? 'block':'none',
                       position: 'fixed',
                       left: '50%',
                       top: '50%',
                       transform: 'translate(-40%, -50%)' ,
                       zIndex: 20
                   }}>
                {app}
            </div>
        </div>
    );
}