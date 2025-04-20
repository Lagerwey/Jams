"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });

var sIndex:number = 1;


interface imageType {  // typing for the "image" object
    [key: string]: string;
  }

interface vuMeterConfig {
    readonly minAngle: number;
    readonly maxAngle: number;
    readonly pointerLen: number;
    readonly pointerColor: string;
    readonly pointerWidth: number;
    readonly pointerBase: boolean;
}

var img : imageType = {
    "1" : "/vu_meter1.jpg",
    "2" : "/vu_meter2.jpg",
    "3" : "/vu_meter3.jpg",
    "4" : "/vu_meter6.png",
    "5" : "/vu_meter5.png",
  }

var vu_config : vuMeterConfig[] = [
    {minAngle: -45, maxAngle: 45, pointerLen: 200, pointerColor: "white", pointerWidth: 8, pointerBase: true},
    {minAngle: -35, maxAngle: 35, pointerLen: 200, pointerColor: "white", pointerWidth: 8, pointerBase: true},
    {minAngle: -40, maxAngle: 40, pointerLen: 200, pointerColor: "white", pointerWidth: 8, pointerBase: true},
    {minAngle: -25, maxAngle: 30, pointerLen: 200, pointerColor: "white", pointerWidth: 8, pointerBase: true},
    {minAngle: -40, maxAngle: 40, pointerLen: 200, pointerColor: "white", pointerWidth: 8, pointerBase: true}
]
  
const MAX_NOF_IMAGES = 5
const MIN_VU_INTPUT =  0
const MAX_VU_INPUT =  32767
var VU_DECAY_SPEED = 8;



export default function Vu_meters() {
    const [imgIndex, setImgIndex] = useState(1);
    const [vuLeftAngle, setvuLeftAngle] = useState(vu_config[sIndex-1].minAngle);
    const [vuRightAngle, setvuRightAngle] = useState(vu_config[sIndex-1].minAngle);
    
    useEffect (() => {
        const timer = setInterval(() => {
            if (vuLeftAngle > vu_config[sIndex-1].minAngle) {setvuLeftAngle(vuLeftAngle - VU_DECAY_SPEED)};
            if (vuRightAngle > vu_config[sIndex-1].minAngle) {setvuRightAngle(vuRightAngle - VU_DECAY_SPEED)};
        }, 50);
        return () => clearInterval(timer);
      }, [vuLeftAngle, vuRightAngle, sIndex, VU_DECAY_SPEED]);
      
    function maxMeter() {
        animate_vu("left", 32766);
        animate_vu("right", 32766);
        VU_DECAY_SPEED = 0;
    }
    function minMeter() {
        VU_DECAY_SPEED = 8;
    }

    function previousMeter() {
        sIndex -= 1;
        if (sIndex < 1) {
            sIndex = MAX_NOF_IMAGES;
        }
        setImgIndex(sIndex);
        animate_vu("left", 15350);
        animate_vu("right", 15350);
    }
    
    function nextMeter() {
        sIndex += 1;
        if (sIndex > MAX_NOF_IMAGES) {
            sIndex = 1;
        }
        setImgIndex(sIndex);
        animate_vu("left", 15000);
        animate_vu("right", 15000);
      }

      function animate_vu(side:string, val:number) {
        if ((val < MIN_VU_INTPUT) || (val > MAX_VU_INPUT)){
            console.log("ERROR: val for VU meter is incorrect (" + val + ")!!!");
            return;
        }
        var scaled = scale(val, MIN_VU_INTPUT, MAX_VU_INPUT, vu_config[sIndex-1].minAngle, vu_config[sIndex-1].maxAngle);

        if (side === "left") {
            setvuLeftAngle(scaled);
        }
        else if (side === "right") {
            setvuRightAngle(scaled);
        }
        else {
            console.log("ERROR: animate_vu with wrong side argument (" + side + ")!!!");
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
                        <div >
                        <svg xmlns="http://www.w3.org/2000/svg" className="fill-slate-800" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 512"><path fillRule="nonzero" d="M512 256c0 70.68-28.66 134.7-74.98 181.02C390.7 483.34 326.68 512 256 512c-70.69 0-134.7-28.66-181.02-74.98C28.66 390.7 0 326.69 0 256c0-70.69 28.66-134.7 74.98-181.02C121.3 28.66 185.31 0 256 0c70.68 0 134.7 28.66 181.02 74.98C483.34 121.3 512 185.31 512 256zM280.33 146.96 171.3 256l109.03 109.04 40.52-40.51-68.51-68.52 68.52-68.52-40.53-40.53zm130.66 264.03c39.66-39.66 64.2-94.47 64.2-154.99 0-60.53-24.54-115.33-64.2-154.99-39.66-39.66-94.47-64.2-154.99-64.2-60.53 0-115.33 24.54-154.99 64.2-39.66 39.66-64.2 94.46-64.2 154.99 0 60.53 24.54 115.33 64.2 154.99 39.66 39.66 94.46 64.2 154.99 64.2 60.52 0 115.33-24.54 154.99-64.2z"/></svg>    
                        </div>
                    </li>
                    <li className="grid h-full mr-12">
                        <span className="col-[1] row-[1] mt-10">
                            <Image src={img[imgIndex.toString()]} alt="VU-L" width={400} height={300}/>
                        </span>
                        <span className="col-[1] row-[1] mt-10 z-10" onClick={minMeter}>
                        <svg height="300" width="400" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <filter id="f1">
                                    <feDropShadow dx="3" dy="10" stdDeviation="1" floodOpacity="0.7"/>
                                    </filter>
                                </defs>
                                <rect width={`${vu_config[imgIndex-1].pointerWidth.toString()}`} height={`${vu_config[imgIndex-1].pointerLen.toString()}`} 
                                      x="196" y="80" rx="5" ry="5" fill={`${vu_config[imgIndex-1].pointerColor}`} filter="url(#f1)" 
                                      transform={`rotate(${vuLeftAngle.toString()}, 200, 280)`}/>
                                <circle r="15" cx="200" cy="280" fill="#000000" stroke="#F00F0F" strokeWidth="3" filter="url(#f1)"/>
                            </svg>
                        </span>
                    </li>
                    <li className="grid h-full ml-12">
                        <span className="col-[1] row-[1] mt-10">
                            <Image src={img[imgIndex.toString()]} alt="VU-R" width={400} height={300}/>
                        </span>
                        <span className="col-[1] row-[1] mt-10 z-10" onClick={maxMeter}>
                            <svg height="300" width="400" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <filter id="f1">
                                    <feDropShadow dx="3" dy="8" stdDeviation="1" floodOpacity="0.7"/>
                                    </filter>
                                </defs>
                                <rect width={`${vu_config[imgIndex-1].pointerWidth.toString()}`} height={`${vu_config[imgIndex-1].pointerLen.toString()}`} 
                                      x="196" y="80" rx="3" ry="3" fill={`${vu_config[imgIndex-1].pointerColor}`} filter="url(#f1)" 
                                      transform={`rotate(${vuRightAngle.toString()}, 200, 280)`}/>
                                <circle r="15" cx="200" cy="280" fill="#000000" stroke="#F00F0F" strokeWidth="3" filter="url(#f1)"/>
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


