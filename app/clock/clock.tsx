"use client"
import Image from "next/image";
import { useEffect, useState } from "react";
import { GetVal } from '../components/LocalStorage';

interface imageType {  // typing for the "image" object
  [key: string]: string;
}


export default function ClockGetTime() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [clockType, setClockType] = useState('');
  
  useEffect (() => {
      setClockType(GetVal('settings_clock_ClockType'));
  }, []);
  // Set timer to repeat this function every second, use the useEffect hook to
  // make sure this is not called everytime the screen renders
  useEffect (() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString(undefined,
        { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
      //this converts string to a set of HTML img tags containing images
      stringToImage(time, clockType)
  )
}

export function ClockGetDate() {
  const [date, setDate] = useState('');
  const [showDate, setShowDate] = useState('');
  
  useEffect (() => {
    setShowDate(GetVal('settings_clock_ClockShowDate'));
  }, []);

  // Set timer to repeat this function every second, use the useEffect hook to
  // make sure this is not called everytime the screen renders
  useEffect (() => {
    const timer = setInterval(() => {
      setDate(new Date().toLocaleDateString('nl-NL', 
      { weekday: "long", year: "numeric", month: "long", day: "numeric",}));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
      <>
      {(showDate === 'true') && <p className="absolute z-[3] inset-0 h-full text-8xl text-center mt-[65vh] text-white-100" >
        {date}
      </p>}
      </>
  )
}

 
//This afunction takes each letter of an array and pairs it to an image of the img array 
function stringToImage(s: string, clockType: string) {
    const textClock = (clockType == '3') ? true : false;
    return (
      <>
      {textClock && <p className="absolute z-[3] font-mono text-9xl text-white" >
                      {s}
                    </p>
      }
      {!textClock &&
        <div className="flex z-[3]">
        <div className="relative w-24 h-40 mr-2">
          <Image alt='not found' src={img[clockType + s[0]]} fill={true} sizes="(max-width: 50px) 100vw, (max-width: 96px) 100vh, 100vw" />
        </div>
        <div className="relative w-24 h-40 mr-2">
          <Image alt='not found' src={img[clockType + s[1]]} fill={true} sizes="(max-width: 50px) 100vw, (max-width: 96px) 100vh, 100vw" />
        </div>
        <div className="relative w-24 h-40 ml-4 mr-2">
          <Image alt='not found' src={img[clockType + s[3]]} fill={true} sizes="(max-width: 50px) 100vw, (max-width: 96px) 100vh, 100vw" />
        </div>
        <div className="relative w-24 h-40 mr-2">
          <Image alt='not found' src={img[clockType + s[4]]} fill={true} sizes="(max-width: 50px) 100vw, (max-width: 96px) 100vh, 100vw" />
        </div>
        <div className="relative w-24 h-40 ml-4 mr-2">
          <Image alt='not found' src={img[clockType + s[6]]} fill={true} sizes="(max-width: 50px) 100vw, (max-width: 96px) 100vh, 100vw" />
        </div>
        <div className="relative w-24 h-40 mr-2">
          <Image alt='not found' src={img[clockType + s[7]]} fill={true} sizes="(max-width: 50px) 100vw, (max-width: 96px) 100vh, 100vw" />
        </div>
      </div>
      }
      </>
    )
}
  
 
//all image URLs are put into this array. feel free to change URLs
var img : imageType = {
  "01": "/1.bmp",
  "02": "/2.bmp",
  "03": "/3.bmp",
  "04": "/4.bmp",
  "05": "/5.bmp",
  "06": "/6.bmp",
  "07": "/7.bmp",
  "08": "/8.bmp",
  "09": "/9.bmp",
  "00": "/0.bmp",
  
  "11": "/lw_1.png",
  "12": "/lw_2.png",
  "13": "/lw_3.png",
  "14": "/lw_4.png",
  "15": "/lw_5.png",
  "16": "/lw_6.png",
  "17": "/lw_7.png",
  "18": "/lw_8.png",
  "19": "/lw_9.png",
  "10": "/lw_0.png",

  "21": "/10.png",
  "22": "/20.png",
  "23": "/30.png",
  "24": "/40.png",
  "25": "/50.png",
  "26": "/60.png",
  "27": "/70.png",
  "28": "/80.png",
  "29": "/90.png",
  "20": "/00.png",

  }
  
  
