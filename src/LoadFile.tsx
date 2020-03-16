import React, { useState, useEffect } from 'react';
import { Button, message, Row, Col} from 'antd';
import {serverUrl} from './config';
import { getData } from './utils';
import {postData} from "./utils";
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
        // @ts-ignore
        const [fileList, setFileList] = useState<[ImageFile]>([]);

        useEffect(()=>{
            getData(serverUrl + 'file/getUsedFileId').then(res=>{
                if(res.status === 200)
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
        


    const onClick = (id: number,name:string)=>{
        const username = localStorage.getItem('username');
        postData(serverUrl + 'file/setUserFile',{filename: name}).then(res=>{
          if(res.status === 400){
              message.error("出现错误");
          }
          else if(res.status === 200){
              postData(serverUrl + 'file/setFileUser',{fileid: id, username: username, ifused: true}).then(res=>{
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
          <Row style={{
            position: 'relative',
            display: 'flex',
            flexWrap: 'wrap'
          }} gutter={[80,32]}>
          <Col >文件夹</Col>
          <Col >操作按钮</Col>
          <Col >占用者</Col>
          </Row>

          {fileList.map(function(row: ImageFile){
            return (
              <Row style={{
                position: 'relative',
                display: 'flex',
                flexWrap: 'wrap'
            }} gutter={[128,16]}>
                <Col span={5}>
                {row.fileName}
                </Col>
                <Col span={5}>
                <Button type="primary" onClick={()=>{onClick(row.fileId,row.fileName)}} disabled={row.ifUsed}>选择</Button>
                </Col>
                <Col span={5}>
                {row.userName}
                </Col>
              </Row>
            )
          })}
        </div>
      )    
};
