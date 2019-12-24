import { getData, postData } from './utils'



describe("postData", ()=>{
    // @ts-ignore
    fetch = jest.fn();
    // @ts-ignore
    fetch.mockResolvedValue( {
        status: 200,
        message: "Happy new year!",
        headers: {
            get: ()=>undefined
        },
        json: async ()=>{return {status: 200}}
    });
    it ("set x-access-token when localStorage.token is not empty", done=>{
        localStorage.setItem('token', '123');
        postData('lala', {hello:''}).then(()=>{
            // @ts-ignore
            expect(fetch.mock.calls[0][0]).toBe('lala');
            // @ts-ignore
            expect(fetch.mock.calls[0][1]['headers']['x-access-token']).toBe('123');
            done();
        })
    })
});

describe("getData", ()=>{
    // @ts-ignore
    fetch = jest.fn();
    // @ts-ignore
    fetch.mockResolvedValue( {
        status: 200,
        message: "Happy new year!",
        headers: {
            get: ()=>undefined
        },
        json: async ()=>{return {status: 200}}
    });
    it ("set x-access-token when localStorage.token is not empty", done=>{
        localStorage.setItem('token', '123');
        getData('lala').then(()=>{
            // @ts-ignore
            expect(fetch.mock.calls[0][0]).toBe('lala');
            // @ts-ignore
            expect(fetch.mock.calls[0][1]['headers']['x-access-token']).toBe('123');
            done();
        })
    })
});
