import React from 'react';
import {WithRouterMainSider} from './Sider';
import ReactDOM from 'react-dom';
import App from './App';
import {LoginForm, RegisterForm} from './Login';
import * as serviceWorker from './serviceWorker';
import {Route, Router, Switch} from 'react-router';
import {_history, HistoryContext} from './config';
import {ImageNumCount} from "./ImgNumCount";
import {UserMainPage} from './UserMainPage'
import {Layout} from 'antd';
import {FileRadio} from './LoadFile'
import {ImageMainPage} from './ImagMainPage'

ReactDOM.render(

    <HistoryContext.Provider value={_history}>
        <Router history={_history}>
            <Layout>
                <WithRouterMainSider/>
                <Layout style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative'
                }}>
                    <Switch>
                        <Route exact path="/" component={ImageMainPage}/>
                        <Route exact path="/fileLoader" component={FileRadio}/>
                        <Route exact path="/login" component={LoginForm}/>
                        <Route exact path="/register" component={RegisterForm}/>
                        <Route exact path="/main" component={UserMainPage}/>
                    </Switch>
                </Layout>
            </Layout>
        </Router>
    </HistoryContext.Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
