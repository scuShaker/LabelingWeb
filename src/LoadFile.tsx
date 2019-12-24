import React, { useState, useEffect } from 'react';
import { Radio, Button, message } from 'antd';
import {serverUrl} from './config';
import { getData } from './utils';
import { relative } from 'path';
import {postData} from "./utils";
import { any } from 'prop-types';
import {_history} from "./config";
import {changeUrl} from "./Sider";
import { reject } from 'q';

interface ImageFile{
  fileId: number;
  fileName: string;
  ifUsed: boolean;
  userName: string;
  locationTag: number;
}


  export const FileRadio: React.FC = function() {
        const [IdValue, setIdValue] = useState(0);
        // @ts-ignore
        const [fileList, setFileList] = useState<[ImageFile]>([]);

        useEffect(()=>{
            getData(serverUrl + 'file/getUsedFileId').then(res=>{
                if(res.status == 200)
                  return res.json(); 
                else
                  throw 'fail';
            }).then(data=>{
                if(data.fileId !== -1)
                {
                  setTimeout(()=>{
                    _history.push('/');
                    changeUrl("/");
                    }, 200);  
                }
            });
            const getFileDataUrl = serverUrl + 'file/getFileData';
            getData(getFileDataUrl).then(res=>{
                return res.json();
            }).then((data: Array<ImageFile>)=>{
                setFileList(data)
            })
        }, []);
        
      const radioStyle = {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
      };

      const onChange = (e: any)=>{
        setIdValue(e.target.value)
      };

    const onClick = (e: any)=>{
        const username = localStorage.getItem('username');
        postData(serverUrl + 'file/setUserFile',{filename: fileList[IdValue].fileName}).then(res=>{
          if(res.status === 400){
              message.error("出现错误");
          }
          else if(res.status === 200){
              postData(serverUrl + 'file/setFileUser',{fileid: IdValue, username: username, ifused: true}).then(res=>{
                  if(res.status === 400){
                      message.error("出现错误");
                  }
                  else if(res.status === 200){
                      setTimeout(()=>{
                          _history.push('/');
                          changeUrl("/");
                      }, 200);
                  }
              });
          }
      });
    };

      return (
        <div>
          <Radio.Group defaultValue={0}>
            {fileList.map(function(row: ImageFile){
              return (
                <Radio style={radioStyle} onChange={onChange} value={row.fileId} disabled={row.ifUsed}>
                {row.fileName}
                </Radio>
              )
            })}
          </Radio.Group>
          <br />
          <Button type="primary" onClick={onClick}>选择</Button>
        </div>
      )    
};
