import {message} from 'antd';
import {_history} from "./config";

let timeout: any = undefined;
export function redirectToLogin(){
    if (timeout){
        clearTimeout(timeout);
    }

    timeout = setTimeout(()=>{
        _history.push('/login');
    }, 200);
}
export function getTinyPath(url:string){
    return url.replace(/.jpeg/, '_tiny.jpg');
}
export async function postData(url = ``, data: any = {}) {
    data = {
        method: "POST",
        mode: "cors",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrer: "no-referrer",
        body: JSON.stringify(data),
    };

    let token = window.localStorage.getItem('token');
    if (token) {
        data.headers['Cookie'] = `token=${token};`;
        data.headers['x-access-token'] = token;
    }
    return fetch(url, data).then(async response => {
        if (response.status === 401) {
            message.error("登录失败");
            redirectToLogin();
            window.localStorage.removeItem('token');
            return {status: 401};
        }

        const ans = await response.json();
        if (!('status' in ans)) {
            ans.status = response.status;
        }

        const setCookie = response.headers.get('Set-Cookie');
        if (setCookie) {
            const reg = /\btoken=(.*?);/;
            const ans = reg.exec(setCookie);
            if (ans && ans.length === 2 && ans[1]) {
                window.localStorage.setItem('token', ans[1]);
            }
        }

        return ans;
    }); // parses response to JSON
}


export async function getData(url = ``) {
    const data: any = {
        method: "GET",
        mode: "cors",
        credentials: "same-origin",
        redirect: "follow",
        referrer: "no-referrer",
        headers: {}
    };

    let token = window.localStorage.getItem('token');
    if (token) {
        data.headers['Cookie'] = `token=${token};`;
        data.headers['x-access-token'] = token;
    }

    return fetch(url, data).then(async response => {
        if (response.status === 401) {
            message.error("登录失败");
            redirectToLogin();
            window.localStorage.removeItem('token');
            console.error(new Error().stack);
            return response;
        }

        const setCookie = response.headers.get('Set-Cookie');
        if (setCookie) {
            const reg = /\btoken=(.*?);/;
            const ans = reg.exec(setCookie);
            if (ans && ans.length === 2 && ans[1]) {
                window.localStorage.setItem('token', ans[1]);
            }
        }

        return response;
    }); // parses response to JSON

}
