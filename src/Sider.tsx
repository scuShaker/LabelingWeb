import React from 'react';
import {withRouter} from 'react-router-dom';
import { Layout, Menu, Icon } from 'antd';
import { _history} from "./config";
const { Sider } = Layout;


interface Props {
    location: any
}

var varUrl = "/fileLoader";
export const changeUrl = (url:string)=>{
    varUrl = url;
};
export const MainSider: React.FC<Props> = function (props: Props) {
    const onSelect = (v: any) => {
        if(v.key === "/fileLoader" || v.key === "/")
             _history.push(varUrl);
        else 
             _history.push(v.key);
    };

    return(
        <Sider
            breakpoint="lg"
            collapsedWidth="0"
            style={{
                height: '100vh',
                position: 'sticky',
                top: 0
            }}
        >
            <div style={{margin: 70}}/>
            <div className="logo"/>
            <Menu theme="dark" mode="inline"
                  selectedKeys={[props.location.pathname]}
                  onSelect={onSelect}
            >
                <Menu.Item key="/main">
                    <Icon type="user" />
                    <span className="nav-text">用户页面</span>
                </Menu.Item>
                <Menu.Item  key={varUrl}>
                    <Icon type="edit" />
                    <span className="nav-text">标记页面</span>
                </Menu.Item>
            </Menu>
        </Sider>
    );
};

export const WithRouterMainSider =
    withRouter(props => <MainSider location={props.location}/>);