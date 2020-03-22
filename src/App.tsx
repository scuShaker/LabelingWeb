import React, {useEffect, useRef, useState} from 'react';
import {Icon, message, Button} from 'antd';
import {Annotator} from 'web-labeler-react';
import {_history, serverUrl, fabricTypes,LetterToTypes,BoundingBox,labelBox,PolygonBox} from './config';
import {postData} from "./utils";



const uploadData = async (labeledData: any) => {
    if (labeledData.flaws == null){
        if (labeledData.boxes !== null){
            labeledData.flaws = labeledData.boxes;
            labeledData.fabricType = labeledData.sceneType;
            delete labeledData.boxes;
            delete labeledData.sceneType;
        } else {
            throw new Error("No bbox data. Was API updated?");
        }
    }

    return labeledData;
}

interface Label{
    type: string;
    distance: number;
    naturalX: number;
    y: number;
}

interface AppProps{
    url: string,
    labeledUser: string,
    labeledDate: string,
    defaultBoxes: Array<BoundingBox|labelBox|PolygonBox>,
    defaultType: string;
    defaultSceneType: string|undefined;
    returnBack:()=>void;
    setHasLabel:(has:boolean)=>void;
    sideLeft: boolean,
    setLabelBack:(label:Label)=>void;
    priorNaturalX:number;
    priorY:number;
    isLabelLeft:boolean;
}


const App:React.FC<AppProps> = function(props:AppProps){
    const [imageUrl, setImageUrl] = useState('');
    const [labeledUser, setLabeledUser] = useState('asd');
    const [labeledDate, setLabeledDate] = useState('');
    // @ts-ignore
    const [defaultBoxes, setDefaultBoxes] = useState<[BBox|PBox]>([]);
    const [defaultSceneType, setDefaultSceneType] = useState<string|undefined>(undefined);
    const [[width, height], setWidthHeight] = useState([600, 600]);
    const mainRef = useRef(null);
  
    const onResize = () => {
        if (mainRef.current == null) {
            return;
        }

        // @ts-ignore
        const w = mainRef.current.clientWidth;
        // @ts-ignore
        const h = mainRef.current.clientHeight;
        setWidthHeight([w - 36, h - 120]);
    };

    useEffect(() => {
        setImageUrl(props.url);
        setLabeledUser(props.labeledUser);
        setLabeledDate(props.labeledDate);
        setDefaultBoxes(props.defaultBoxes);
        onResize();
        window.addEventListener('resize', onResize);
        return window.removeEventListener('resize', onResize);
    }, []);


    return (
        <div className="App" ref={mainRef} style={{
            width: '100vw',
            height: '100vh',
            minWidth: 300,
            minHeight: 500,
            maxWidth: 1200,
            maxHeight: 2000,
            padding: 24,
            position: 'relative',
            margin: '10px auto',
            backgroundColor: 'white',
            borderRadius: 8,
            boxShadow: '0px 0px 10px 10px #aaa',

            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignContent: 'center',
        }}>
            <div>
                <label style={{ margin: '0 8px' }}><Icon type="user" /> 当前用户: {localStorage.getItem('username')}</label>
                <label style={{ margin: '0 8px' }}>默认类型: {props.defaultType}</label>
                <label style={{ margin: '0 8px' }}>之前标记者: {labeledUser}</label>
                <label style={{ margin: '0 8px' }}>之前标记时间: {labeledDate}</label>
                <Button type="danger" size="large" style={{left:"40%"}} 
                onClick={()=>{
                    if(window.confirm("没有提交确定要离开吗")==false)
                        return;
                    props.returnBack()}}
                >返回上一层</Button>
            </div>

            <Annotator
                height={height}
                width={width}
                imageUrl={imageUrl}
                asyncUpload={async data=>{
                    await uploadData(data).then(labeledData=>{
                        postData(serverUrl + "postLabeledData", labeledData).then(res => {
                            message.success("上传成功"); 
                            props.returnBack();                         
                        });
                    })
                }}
                setHasLabel ={props.setHasLabel}
                typeMap={LetterToTypes}
                defaultType={props.defaultType}
                defaultBoxes={defaultBoxes}
                sceneTypes={fabricTypes}
                sideLeft = {props.sideLeft}
                defaultSceneType={defaultSceneType}
                style={{
                    margin: '0px auto',
                    borderRadius: 5
                }} 
                returnLabel={(label:Label)=>{props.setLabelBack(label)}}
                isLabelLeft={props.isLabelLeft}
                priorNaturalX={props.priorNaturalX}
                priorY={props.priorY}
                />
        </div>
    );
};

export default App;
