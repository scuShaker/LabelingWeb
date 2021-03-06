import {Col, Row, Table, Button, Switch, message} from 'antd';
import {serverUrl,BoundingBox,labelBox,PolygonBox} from './config';
import React, {useEffect, useState} from 'react';
import {LogoutButton} from './LogoutButton'
import {getData, postData,getTinyPath} from "./utils";
import {LabeledImage} from './LabeledImage';
import {Annotator} from 'web-labeler-react';
import './Login.css';
import 'antd/dist/antd.css';


interface LabeledNumRow {
    username: String;
    labeledNum: number;
}


interface RawLabelRow {
    imagePath: string;
    labelPath: string;
    labelDate: string;
}

interface LabelRow {
    url: string;
    bboxes: Array<BoundingBox| labelBox|PolygonBox>;
    labelDate: string;
}





export const UserMainPage: React.FC = function() {
    const [usersLabeledNum, setUsersLabeledNum] = useState([]);
    // @ts-ignore
    const [userLabels, setUserLabels] = useState<[LabelRow]>([]);
    const [showUrl, setShowUrl] = useState('');
    // @ts-ignore
    const [showBBoxes, setShowBBoxes] = useState<[LabelRow]>([]);

    const getImageData = (username:string|null)=>{
        const checkLabeledImagesUrl = serverUrl + 'statistic/labeled-images/' + username;
        getData(checkLabeledImagesUrl).then(res=>{
            if(res.status===200){
                return res.json();
            }
            else{
                message.error("非管理员用户只能查看自己的数据");
                throw 'fail';
            }
        }).then((data: Array<RawLabelRow>)=>{
            return Promise.all(data.map(function(item){
                var promiseItem = async (row: any)=>{
                const res = await getData(serverUrl + row.labelPath.slice(1));
                const label = await res.json();
                return {
                    bboxes: label.flaws,
                    url: row.imagePath,
                    labelDate: row.labelDate
                }};
            return promiseItem(item).catch(function(err: any){
                return err;
            })
        }));
        }).then((data: Array<LabelRow>) => {
            //message.info(data.length)
            setUserLabels(data);
            //message.info(userLabels.length)
        });
    };
    const exitFile = (objectname:string, filename:string)=>{
        postData(serverUrl + 'file/exitFileInMainPage',
        {username:localStorage.getItem('username'), objectname, filename}).then(res=>{
            if(res.status!==200){
                message.error("权限不足")
            }
            window.location.reload(true);
        });       
    }

    const columns: any = [
        {
            title: '姓名',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '已标记数据量',
            dataIndex: 'labeledNum',
            key: 'labeledNum',
            sorter: (a: LabeledNumRow, b: LabeledNumRow) => a.labeledNum - b.labeledNum,
            sortDirections: ['descend', 'ascend']
        },
        {
            title:'已标记数据',
            key: 'action',
            render:(record: any)=>(
                <Button type="primary" onClick={()=>{
                   getImageData(record.username);
                }}>查看</Button>
            )
        },
        {
            title: '允许登录',
            render:(record: any)=>(
                <Switch defaultChecked = {record.state} onChange={(checked)=>{
                    let newState = checked;
                    postData(serverUrl + 'authenticate/setState',
                    {username:localStorage.getItem('username'), objectname: record.username, state:newState}).then(res=>{
                        if(res.status===412){
                            message.error("你不是管理员用户或者你不能修改管理员的登录权限")
                        }
                    });
                }}/>
            )

        },
        {
            title: '当前标记文件',
            key: 'file',
            render:(record: any)=>(
                <div>
                    {record.filename}
                </div>
            )              
        },
        {
            title: '退出文件',
            key: 'checkOut',
            render:(record: any)=>(
                <Button type="primary" onClick={()=>{
                    exitFile(record.username, record.filename);
                 }}>退出文件</Button>
            )
        }
    ];

    useEffect(()=>{
        getData(serverUrl + 'statistic/labeled-image-num').then((res)=>{
            return res.json();
        }).then(data=>{
            setUsersLabeledNum(data.usersLabeledNum);
        });
        getImageData(localStorage.getItem('username'));
    }, []);

    const UsersLabeledNumTable = (usersLabeledNum && usersLabeledNum.length !== 0)? (
        <Table columns={columns} dataSource={usersLabeledNum} rowKey={'username'}/>
    ):undefined;

    const annotator = (!!showUrl)?(
        <Annotator imageUrl={showUrl} height={800} width={800}
                   asyncUpload={async ()=>{}} typeMap={{}} defaultBoxes={showBBoxes}
                   disableAnnotation={true}
                   style={{
                       display: (!!showUrl)? 'block':'none',
                       position: 'fixed',
                       left: '50%',
                       top: '50%',
                       transform: 'translate(-50%, -50%)',
                       zIndex: 20
                   }}
        />) : undefined;

    return (
        <div style={{
            width: 800,
            margin: '50px auto',
            borderRadius: 8,
            padding: 30,
        }}>

            <Row style={{margin: 22}}>
                <Col span={12}>
                    <label>用户名： {localStorage.getItem('username') }</label>
                </Col>
                <Col span={12}>
                    <LogoutButton/>
                </Col>
            </Row>


            {UsersLabeledNumTable}

            <div style={{
                position: 'relative',
                display: 'flex',
                flexWrap: 'wrap'
            }}>
                {userLabels.map(function(row: LabelRow){
                    if(row.url !== undefined)
                        return(
                    <div>
                    <LabeledImage
                        url={getTinyPath(serverUrl + row.url)}
                        bboxes={row.bboxes}
                        size={100}
                        key={row.url}
                        onClick={()=>{
                            setShowBBoxes(row.bboxes);
                            setShowUrl(serverUrl + row.url);
                        }}
                    />
                    {row.url}
                    </div>)
                    else 
                        return <div/>;
                })}
            </div>
            {annotator}
            <div
                style={{
                    display: (!!showUrl)? 'block':'none',
                    height: '100vh',
                    width: '100vw',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 19,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)'
                }}

                onClick={()=>{
                    setShowUrl('');
                }}
            />

        </div>
    )
};
