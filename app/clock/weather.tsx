import axios from 'axios';
import Image from "next/image";
import { useEffect, useState } from 'react'
import { GetVal } from '../components/LocalStorage';

interface imageType {  // typing for the "image" object
  [key: string]: string;
}


export const Weather = () => {
    const [city, setCity] = useState("Deventer");
    const [weather, setWeather] = useState({});
    const [weatherType, setWeatherType] = useState("Clear");
    const [temperature, setTemperature] = useState("0.0");
    const [clockBgSel, setClockBgSel] = useState('color');
    const [clockBgColor, setClockBgColor] = useState("#000000");

    //In celsius -(&units=metric) in fahrenheit -(&units=imperial)
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`;
    
    const FetchWeather = () => {
        const instance = axios.create();        
        instance.get(url).then((response) => {
            setWeather(response.data);
            setWeatherType(response.data.weather[0].main);
            setTemperature(response.data.main.temp);
        });
        setCity("Deventer");
    }; 

    useEffect (() => {
        setClockBgSel(GetVal('settings_clock_ClockBgSel'));
        setClockBgColor(GetVal('settings_clock_ClockBgColor'));
    }, []);

    useEffect (() => {
        FetchWeather();
        const timer = setInterval(() => {}, 1800000);
    },  []);

  return (
    <>
    { (clockBgSel === 'weather') &&
      <div className="absolute z-[1] inset-0">
        <Image
            suppressHydrationWarning={true}
            src={(weatherType === "") ? img["Alt"] : img[weatherType]}
            alt={img['Alt']}
            fill
          />
          <div className='absolute opacity-30 z-[2] inset-0 bg-black'/>
      </div>
      
    }
    { (clockBgSel === 'color') &&
      <div className='absolute z-[1] inset-0'  style={{backgroundColor: `${clockBgColor}` }} />
      // <div className='absolute z-[1] inset-0' />
    }
      <p className="absolute z-[3] inset-0 h-[100vh] text-7xl ml-5 mt-9 text-white" >
      {Math.round(parseFloat(temperature))}&deg;C
      </p>
    </>
)
}


var img : imageType = {
  "Thunderstorm" : "/thunder1.jpg",
  "Drizzle" : "/drizzle.jpg",
  "Rain" :  "/rain3.jpg",  
  "Snow" : "/snow.jpg",   
  "Mist" : "/mist.jpg",   
  "Smoke" :  "/mist.jpg", 
  "Haze" : "/mist2.jpg",    
  "Dust" : "/thunder2.jpg",   
  "Fog" : "/mist3.jpg",  
  "Sand" : "/thunder2.jpg",    
  "Ash" : "/thunder2.jpg",   
  "Squall" : "/thunder2.jpg",   
  "Tornado" : "/thunder2.jpg",  
  "Clear" : "/sun1.jpg",  
  "Clouds" : "/clouds3.jpg",
  "Alt" : "/no_image.jpg"   
}
