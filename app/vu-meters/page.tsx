"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });
import { io } from "socket.io-client";


interface imageType {  // typing for the "image" object
    [key: string]: string;
  }

interface vuMeterConfig {
    readonly minAngle: number;
    readonly maxAngle: number;
    readonly pointerLen: number;
    readonly pointerColor: string;
    readonly pointerWidth: number;
    readonly windowsHeigt: number;    
}

var img : imageType = {
    "1" : "/vu_meter1.jpg",
    "2" : "/vu_meter2.jpg",
    "3" : "/vu_meter3.jpg",
    "4" : "/vu_meter6.png",
    "5" : "/vu_meter5.png",
  }

var vu_config : vuMeterConfig[] = [
    {minAngle: -44, maxAngle: 44, pointerLen: 180, pointerColor: "blue", pointerWidth: 8, windowsHeigt: 200},
    {minAngle: -37, maxAngle: 37, pointerLen: 170, pointerColor: "red", pointerWidth: 8, windowsHeigt: 250},
    {minAngle: -41, maxAngle: 41, pointerLen: 200, pointerColor: "purple", pointerWidth: 8, windowsHeigt: 250},
    {minAngle: -30, maxAngle: 33, pointerLen: 180, pointerColor: "white", pointerWidth: 8, windowsHeigt: 245},
    {minAngle: -33, maxAngle: 33, pointerLen: 230, pointerColor: "white", pointerWidth: 6, windowsHeigt: 230}
]
  
const MAX_NOF_IMAGES = 5;
const MIN_VU_INTPUT =  0;
const MAX_VU_INPUT =  100;
const POINTER_Y_ORIGIN = 280;
const POINTER_X_CENTER = 200;
const VU_DECAY_SPEED = 8;

var sIndex:number = 1;
var listenPort = Number(process.env.NEXT_PUBLIC_LISTEN_PORT) + 2; // Setup the websocket
var socket:any; 
var prev_vu_l_val = vu_config[sIndex-1].minAngle;
var prev_vu_r_val = vu_config[sIndex-1].minAngle;


export default function Vu_meters() {
    const [imgIndex, setImgIndex] = useState(1);
    const [vuLeftAngle, setvuLeftAngle] = useState(vu_config[sIndex-1].minAngle);
    const [vuRightAngle, setvuRightAngle] = useState(vu_config[sIndex-1].minAngle);
    
    useEffect (() => {
        socket = io(`http://localhost:${listenPort}`);
      }, []);

    useEffect (() => {
        const timer = setInterval(() => {
            setvuLeftAngle(prev_vu_l_val);
            setvuRightAngle(prev_vu_r_val);
            if (prev_vu_l_val > vu_config[sIndex-1].minAngle) {prev_vu_l_val -= VU_DECAY_SPEED};
            if (prev_vu_r_val > vu_config[sIndex-1].minAngle) {prev_vu_r_val -= VU_DECAY_SPEED};
        }, 50);

        socket.on("vu_data", function(payload:any) {
            animate_vu("left", payload[0]);
            animate_vu("right", payload[1]);
        });
    
        return () => clearInterval(timer);
      }, [sIndex, vu_config, prev_vu_l_val, prev_vu_r_val]);
      

    function previousMeter() {
        if (sIndex == 1) {
            sIndex = MAX_NOF_IMAGES;
        } else {
            sIndex -= 1;
        }
        setImgIndex(sIndex);
        animate_vu("left", 50);
        animate_vu("right", 50);
    }
    
    function nextMeter() {
        if (sIndex == MAX_NOF_IMAGES) {
            sIndex = 1;
        } else {
            sIndex += 1;
        }
        setImgIndex(sIndex);
        animate_vu("left", 50);
        animate_vu("right", 50);
      }

      function animate_vu(side:string, val:number) {
        if ((val < MIN_VU_INTPUT) || (val > MAX_VU_INPUT)){
            console.log("ERROR: val for VU meter is incorrect (" + val + ")!!!");
            return;
        }
        var scaled = scale(val, MIN_VU_INTPUT, MAX_VU_INPUT, vu_config[sIndex-1].minAngle, vu_config[sIndex-1].maxAngle);

        if (side === "left") {
            if (scaled > prev_vu_l_val)
                prev_vu_l_val = scaled;
        }
        else if (side === "right") {
            if (scaled > prev_vu_r_val)
                prev_vu_r_val = scaled;
        }
        else {
            console.log("ERROR: animate_vu with wrong side (R/L) argument (" + side + ")!!!");
        }
      }

      function scale(input:number, inputMin:number, inputMax:number, outputMin:number, outputMax:number) {
        //The actual translation function
        function translationResult(inputMinA:number, inputMaxA:number) {
            var myResult = outputMin + (outputMax - outputMin) * (input - inputMinA) / (inputMaxA - inputMinA);
            return Math.round(myResult);
        }
    
        if (input > inputMax || input < inputMin) {
            console.log("Scale(): input not in given range!");
        }

        return translationResult(inputMin, inputMax);
    }


    return (
        <main className="bg-black min-h-screen z-0">
            <div className="grid min-w-screen min-h-screen">
                <ul className="w-full flex flex-row text-slate-400 place-content-center">
                    <li className="w-20 h-full mr-16 place-content-center z-10" onClick={previousMeter}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="fill-slate-800" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 512"><path fillRule="nonzero" d="M512 256c0 70.68-28.66 134.7-74.98 181.02C390.7 483.34 326.68 512 256 512c-70.69 0-134.7-28.66-181.02-74.98C28.66 390.7 0 326.69 0 256c0-70.69 28.66-134.7 74.98-181.02C121.3 28.66 185.31 0 256 0c70.68 0 134.7 28.66 181.02 74.98C483.34 121.3 512 185.31 512 256zM280.33 146.96 171.3 256l109.03 109.04 40.52-40.51-68.51-68.52 68.52-68.52-40.53-40.53zm130.66 264.03c39.66-39.66 64.2-94.47 64.2-154.99 0-60.53-24.54-115.33-64.2-154.99-39.66-39.66-94.47-64.2-154.99-64.2-60.53 0-115.33 24.54-154.99 64.2-39.66 39.66-64.2 94.46-64.2 154.99 0 60.53 24.54 115.33 64.2 154.99 39.66 39.66 94.46 64.2 154.99 64.2 60.52 0 115.33-24.54 154.99-64.2z"/></svg>    
                    </li>
                    <li className="grid h-full mr-12">
                        <span className="col-[1] row-[1] mt-10">
                            <Image src={img[imgIndex.toString()]} alt="VU-L" width={400} height={300}/>
                        </span>
                        <span className="col-[1] row-[1] mt-10 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="400" height={`${vu_config[imgIndex-1].windowsHeigt.toString()}`}>
                                <defs>
                                    <filter id="f1">
                                    <feDropShadow dx="5" dy="-5" stdDeviation="1" floodOpacity="0.7" floodColor="lightgrey"/>
                                    </filter>
                                </defs>
                                <rect width={`${vu_config[imgIndex-1].pointerWidth.toString()}`} 
                                      height={`${vu_config[imgIndex-1].pointerLen.toString()}`} 
                                      x={`${POINTER_X_CENTER - (vu_config[imgIndex-1].pointerWidth / 2)}`.toString()}
                                      y={`${POINTER_Y_ORIGIN - vu_config[imgIndex-1].pointerLen}`.toString()} 
                                      rx="5" ry="5" 
                                      fill={`${vu_config[imgIndex-1].pointerColor}`} 
                                      filter="url(#f1)"
                                      transform={`rotate(${vuLeftAngle.toString()}, ${POINTER_X_CENTER}, ${POINTER_Y_ORIGIN})`}
                                    />
                            </svg>
                        </span>
                    </li>
                    <li className="grid h-full ml-12">
                        <span className="col-[1] row-[1] mt-10">
                            <Image src={img[imgIndex.toString()]} alt="VU-R" width={400} height={300}/>
                        </span>
                        <span className="col-[1] row-[1] mt-10 z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="400" height={`${vu_config[imgIndex-1].windowsHeigt.toString()}`}>
                                <defs>
                                    <filter id="f2">
                                    <feDropShadow dx="5" dy="-5" stdDeviation="1" floodOpacity="0.7" floodColor="lightgrey"/>
                                    </filter>
                                </defs>
                                <rect width={`${vu_config[imgIndex-1].pointerWidth.toString()}`} 
                                      height={`${vu_config[imgIndex-1].pointerLen.toString()}`} 
                                      x={`${POINTER_X_CENTER - (vu_config[imgIndex-1].pointerWidth / 2)}`.toString()}
                                      y={`${POINTER_Y_ORIGIN - vu_config[imgIndex-1].pointerLen}`.toString()} 
                                      rx="5" ry="5" 
                                      fill={`${vu_config[imgIndex-1].pointerColor}`} 
                                      filter="url(#f2)" 
                                      transform={`rotate(${vuRightAngle.toString()}, ${POINTER_X_CENTER}, ${POINTER_Y_ORIGIN})`}
                                    />
                            </svg>
                        </span>
                    </li>
                    <li className="w-20 h-full ml-16 place-content-center z-10" onClick={nextMeter}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="fill-slate-800" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 512"><path fillRule="nonzero" d="M0 256c0 70.68 28.66 134.7 74.98 181.02C121.3 483.34 185.32 512 256 512c70.69 0 134.7-28.66 181.02-74.98C483.34 390.7 512 326.69 512 256c0-70.69-28.66-134.7-74.98-181.02C390.7 28.66 326.69 0 256 0 185.32 0 121.3 28.66 74.98 74.98 28.66 121.3 0 185.31 0 256zm231.67-109.04L340.7 256 231.67 365.04l-40.52-40.51 68.51-68.52-68.52-68.52 40.53-40.53zM101.01 410.99c-39.66-39.66-64.2-94.47-64.2-154.99 0-60.53 24.54-115.33 64.2-154.99 39.66-39.66 94.47-64.2 154.99-64.2 60.53 0 115.33 24.54 154.99 64.2 39.66 39.66 64.2 94.46 64.2 154.99 0 60.53-24.54 115.33-64.2 154.99-39.66 39.66-94.46 64.2-154.99 64.2-60.52 0-115.33-24.54-154.99-64.2z"/></svg>
                    </li>
                </ul>
            </div>
        </main>
    )
}


