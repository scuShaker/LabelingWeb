import {Button, Checkbox, Form, Icon, Input, message, Row, Col} from 'antd';
import {HistoryContext, serverUrl} from './config';
import React from 'react';
import {postData} from "./utils";
import './Login.css';
import 'antd/dist/antd.css';

function getCookie(cname:string)
{
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) 
  {
    var c = ca[i].trim();
    if (c.indexOf(name)===0) return c.substring(name.length,c.length);
  }
  return "";
}

class NormalLoginForm extends React.Component {
    static contextType = HistoryContext;
    props: any;
    handleSubmit = (e: Event) => {
        e.preventDefault();
        this.props.form.validateFields((err: Error, values: any) => {
            if (err) {
                throw err
            }

            const {username, password} = values;
            postData(
                serverUrl + 'authenticate/login',
                {username, password}
            ).then(res=>{
                if (res.status === 500) {
                    message.error("[服务器错误]" + res.error);
                } else if (res.status === 200) {
                    window.localStorage.setItem('token', res.token);
                    window.localStorage.setItem('username', res.username);
                    const func = () => {
                        if (localStorage.getItem('token') !== res.token) {
                            setTimeout(func, 500);
                            return;
                        }

                        this.context.push('/main');
                        message.success("登录成功");
                    };

                    func();
                } else if (res.status === 400) {
                    message.error(res.error);
                }

            });
        });
    };
    checkCaptcha = (rule: any, value: any, callback: any)=>{
        let captcha = getCookie('captcha');
        if(value.toLowerCase() !== captcha)
            callback(value.toLowerCase());
        else
            callback();
    };
    render() {
        const { getFieldDecorator } = this.props.form;
        // @ts-ignore
        return ( <Form onSubmit={this.handleSubmit} className="login-form">
                <Form.Item>
                    {getFieldDecorator('username', {
                        rules: [{ required: true, message: '请输入用户名' }],
                    })(
                        <Input
                            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="用户名"
                        />,
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: '请输入密码' }],
                    })(
                        <Input
                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            type="password"
                            placeholder="密码"
                        />,
                    )}
                </Form.Item>
                <Form.Item>
                    <Row gutter={30}>
                        <Col span={10}>
                            {getFieldDecorator('captcha', {
                                rules: [{ required: true, message: '请输入验证码' },
                                {validator: this.checkCaptcha}
                            ],})(
                                <Input
                                    prefix={<Icon type="code" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="验证码"
                                />
                            )}
                        </Col>
                        <Col span = {10}>
                            <button><img src={serverUrl + "captcha/getCaptcha"} alt="" ref="captchaImg"
                                onClick={()=>{
                                    (this.refs.captchaImg as any).src = serverUrl + "captcha/getCaptcha?d="+Math.random();

                            }} /></button>
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('remember', {
                        valuePropName: 'checked',
                        initialValue: true,
                    })(<Checkbox>记住我</Checkbox>)}
                    <a className="login-form-forgot" >
                        {/*TODO: how to solve this? */}
                        忘记密码
                    </a>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        登录
                    </Button>
                    <a href="/register">现在注册</a>
                </Form.Item>
            </Form>
        );
    }
}


class NormalRegisterForm extends React.Component {
    static contextType = HistoryContext;
    props: any;
    handleSubmit = (e: Event) => {
        e.preventDefault();
        this.props.form.validateFields((err: Error, values: any) => {
            if (err) {
                throw err
            }

            const {username, password} = values;
            var state = false;
            if (username === "admin")
                state = true;
            postData(
                serverUrl + 'authenticate/register',
                {username, password, state}
            ).then(res=>{
                if (res.status === 500) {
                    message.error("[服务器错误]" + res.error);
                } else if (res.status === 200) {
                    this.context.push('/login');
                    message.success("注册成功")
                } else if (res.status === 400) {
                    message.error(res.error);
                }

            });
        });
    };

    compareToFirstPassword = (rule: any, value: any, callback: any) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            callback('两次输入密码不同！');
        } else {
            callback();
        }
    };

    checkWhetherUsernameExists = (rule: any, value: any, callback: any) => {
        postData(
            serverUrl + 'authenticate/username-check',
            {username: value}
        ).then(res=>{
            if (res.status === 200) {
                if (res.valid){
                    callback();
                } else {
                    callback('用户名已存在');
                }
            }

            callback();
        });
    };

    checkCaptcha = (rule: any, value: any, callback: any)=>{
        let captcha = getCookie('captcha');
        if(value.toLowerCase() !== captcha)
            callback(value.toLowerCase());
        else
            callback();
    };
    
    render() {
        const { getFieldDecorator } = this.props.form;
        // @ts-ignore
        return ( <Form onSubmit={this.handleSubmit} className="login-form">
                <Form.Item>
                    {getFieldDecorator('username', {
                        rules: [
                            { required: true, message: '请输入用户名' },
                            {
                                validator: this.checkWhetherUsernameExists
                            }
                        ],
                    })(
                        <Input
                            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="用户名"
                        />,
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: '请输入密码' }],
                    })(
                        <Input
                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            type="password"
                            placeholder="密码"
                        />,
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('passwordConfirm', {
                        rules: [
                            { required: true, message: '请输入确认密码' },
                            {
                                validator: this.compareToFirstPassword
                            }
                        ],
                    })(
                        <Input
                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            type="password"
                            placeholder="确认密码"
                        />,
                    )}
                </Form.Item>
                <Form.Item>
                    <Row gutter={30}>
                        <Col span={10}>
                            {getFieldDecorator('captcha', {
                                rules: [{ required: true, message: '请输入验证码' },
                                {validator: this.checkCaptcha}
                            ],})(
                                <Input
                                    prefix={<Icon type="code" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="验证码"
                                />
                            )}
                        </Col>
                        <Col span = {10}>
                            <button><img src={serverUrl + "captcha/getCaptcha"} alt="" ref="captchaImg"
                                onClick={()=>{
                                    (this.refs.captchaImg as any).src = serverUrl + "captcha/getCaptcha?d="+Math.random();

                            }} /></button>
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        注册
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}


export const LoginForm = Form.create({ name: 'normal_login' })(NormalLoginForm);
export const RegisterForm = Form.create({ name: 'normal_login' })(NormalRegisterForm);
