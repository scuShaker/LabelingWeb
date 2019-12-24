import {Col, Row, Statistic, Table} from 'antd';
import React, {useEffect, useState} from 'react';
import {getData} from "./utils";
import {serverUrl} from "./config";


interface DateNum {
    date: string;
    num: number;
}


interface UserSlot {
    key?: string;
    username: string;
    todayNum: number;
    thisWeekNum: number;
    totalNum: number;
    dateNum: Array<DateNum>;
}



const columns = [
    {
        title: '用户名',
        dataIndex: 'username',
        key: 'username',
        // @ts-ignore
        sorter: (a: UserSlot, b: UserSlot) => (a.username > b.username) * 2 - 1,
        sortDirections: ['descend', 'ascend']
    },
    {
        title: '今日数据量',
        dataIndex: 'todayNum',
        key: 'todayNum',
        sorter: (a: UserSlot, b: UserSlot) => a.todayNum - b.todayNum,
        sortDirections: ['descend', 'ascend']
    },
    {
        title: '本周数据量',
        dataIndex: 'thisWeekNum',
        key: 'thisWeekNum',
        sorter: (a: UserSlot, b: UserSlot) => a.thisWeekNum - b.thisWeekNum,
        sortDirections: ['descend', 'ascend']
    },
    {
        title: '汇总数据量',
        dataIndex: 'totalNum',
        key: 'totalNum',
        sorter: (a: UserSlot, b: UserSlot) => a.totalNum - b.totalNum,
        sortDirections: ['descend', 'ascend']
    }
];


export const ImageNumCount: React.FC = () => {
    const [userSlots, setUserSlots] = useState([] as any as UserSlot[]);
    const [totalNum, setTotalNum] = useState(0);
    const [leftNum, setLeftNum] = useState(0);
    const [permission, setPermission] = useState(false);

    useEffect(()=>{
        getData(serverUrl + 'statistic/user-permission/' + localStorage.getItem('username')).then((res)=>{
            return res.json();
        }).then(data=>{
            setPermission(data);
        });
        getData(serverUrl + 'statistic/image-num').then(async data=>{
            if (data.status === 401) {
                return;
            }

            const slots: Array<UserSlot> = (await data.json()) as any as UserSlot[];
            slots.forEach(v=>{
                v.key = v.username;
            });

            let totalNum = 0;
            slots.forEach(v=>{
                totalNum += v.totalNum;
            });
            setTotalNum(totalNum);
            setUserSlots(slots);
        });

        getData(serverUrl + 'statistic/labeled-image-num').then(async data=>{
            if (data.status === 401 ){
                return;
            }

            const jsonData: any = await data.json();
            if ('leftNum' in jsonData){
                setLeftNum(jsonData.leftNum);
            } else {
                throw new Error("Response json data does not contain `leftNum` field"
                    + JSON.stringify(jsonData));
            }
        })
    }, []);

    // @ts-ignore
    const myTable = <Table columns={columns} dataSource={userSlots}
                           rowKey={'username'} style={{padding: 8}}/>;
    if(permission){
        return (
            <div style={{
                margin: '10px auto',
                maxWidth: 800,
                padding: 30,
                backgroundColor: 'white',
                borderRadius: 8,
                boxShadow: '0px 0px 10px 10px #ccc'
            }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Statistic title="总数量" value={totalNum} style={{padding: 8}}/>
                    </Col>
                    <Col span={12}>
                        <Statistic title="待精标数量" value={leftNum} style={{padding: 8}}/>
                    </Col>
                </Row>
                <Row gutter={16}>
                    {myTable}
                </Row>
            </div>
        );}
    else{
        return (
            <div style={{
                margin: '10px auto',
                maxWidth: 800,
                padding: 30,
                backgroundColor: 'white',
                borderRadius: 8,
                boxShadow: '0px 0px 10px 10px #ccc'
            }}>
                <Row gutter={16}>
                        权限不足
                </Row>
            </div>
        );
    }
};



