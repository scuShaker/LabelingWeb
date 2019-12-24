import React from 'react';
import styled from 'styled-components'
import { message } from 'antd';


const MainPage = styled.div`
    border-radius: 12px;
    position: relative;
    background-color: white;
    margin: 10px;
    z-index: 10;
`;


interface BBox {
    x: number;
    y: number;
    h: number;
    w: number;
    annotation: string;
}


interface Props {
    url: string;
    bboxes: Array<BBox>;
    size: number;
    style?: object;
    onClick: (url:string)=>void;
}


export class LabeledImage extends React.Component {
    private imageElement: HTMLImageElement;
    private canvas: React.RefObject<HTMLCanvasElement>;
    props: Props;
    state: {canvasWidth: number, annotation: string, hover: boolean};
    reloadTimes: number;
    constructor(props: Props) {
        super(props);
        this.props = props;
        this.imageElement = document.createElement('img');
        this.canvas = React.createRef<HTMLCanvasElement>();
        this.state = {canvasWidth: 0, annotation: '', hover: false};
        this.reloadTimes = 0;
    }


    imgLoadListener = ()=>{

        const canvas = this.canvas.current;
        if (!canvas) {
            if (this.reloadTimes > 10){
                console.error('Canvas not ready')
                return;
            }

            this.reloadTimes += 1;
            setTimeout(this.imgLoadListener, 1000);
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error("Cannot get context 2d");
        }

        const box = this.getBBoxWrapper();
        ctx.drawImage(
            this.imageElement,
            box.x, box.y,
            box.w, box.h,
        );

        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.fillRect(0, 0, this.props.size, this.props.size);
        this.setState({annotation: box.annotations.join(', ')});
    };

    componentDidMount(): void {
        this.imageElement.addEventListener('load', this.imgLoadListener);
        this.initCanvas(this.props.url);
        if (!this.canvas.current) {
            throw new Error("no canvas");
        }

        this.canvas.current.addEventListener('resize', ()=>{
            if (!this.canvas.current){
                throw new Error("????");
            }

            this.setState({canvasWidth: this.canvas.current.clientWidth});
        });

        this.canvas.current.addEventListener('mouseenter', ()=>{
            this.setState({hover: true});
        });

        this.canvas.current.addEventListener('mouseout', ()=>{
            this.setState({hover: false});
        });
    }

    componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
        if (nextProps.url !== this.props.url) {
            this.initCanvas(nextProps.url);
        }
    }

    getBBoxWrapper = () => {
        let minX = Number.MAX_VALUE,
            minY = Number.MAX_VALUE,
            maxX = 0,
            maxY = 0,
            annotations: any = {};

        for (let bbox of this.props.bboxes) {
            /*
            minX = Math.min(bbox.x, minX);
            minY = Math.min(bbox.y, minY);
            maxX = Math.max(bbox.x + bbox.w, maxX);
            maxY = Math.max(bbox.y + bbox.h, maxY);
            */
            if (!(bbox.annotation in annotations)) {
                annotations[bbox.annotation] = 1;
            }
        }

        let annotationArr = [];
        for (let a in annotations) {
            annotationArr.push(a);
        }

        if (minX > maxX) {
            minX = 0;
            minY = 0;
            maxX = this.imageElement.naturalWidth;
            maxY = this.imageElement.naturalHeight;
            //annotationArr.push('正常');
        }

        //const size = Math.max(this.props.size, Math.max(maxX - minX, maxY - minY));

        return {
            x: minX,
            y: minY,
            w: this.props.size,
            h: this.props.size,
            annotations: annotationArr
        }
    };

    initCanvas = (url: string) => {
        this.imageElement.src = url;
    };

    render() {
        // TODO: Add onHover
        const {style={}} = this.props;
        const {hover} = this.state;
        let mStyle = Object.assign({}, style, {
            width: this.props.size,
            height: this.props.size,
            transform: hover? 'scale(1.2)': '',
            cursor: 'pointer',
            transition: 'transform 0.1s'
        });
        return (
            <MainPage style={mStyle} onClick={()=>{this.props.onClick(this.props.url)}}>
                <canvas ref={this.canvas}
                        width={this.props.size}
                        height={this.props.size}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            borderRadius: 12

                        }}/>
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    zIndex: 15,
                    color: '#eee',
                    fontSize: 20,
                    fontWeight: 800,
                    display: hover? 'none' : 'block'
                }}>
                    {this.state.annotation}
                </div>
            </MainPage>
        )
    }
}
