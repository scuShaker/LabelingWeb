import React from 'react';
import {Button, message} from 'antd';
import {_history} from './config';


export const LogoutButton: React.FC = function() {
    const logOut = () => {
        localStorage.clear();
        message.success("退出成功");
        setTimeout(()=>{
            _history.push('/login');
        }, 500);
    };

    return <Button onClick={logOut} style={{marginLeft: 10}}>退出登录</Button>;
};
