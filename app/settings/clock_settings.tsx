import React, { useEffect, useState } from 'react'
import { Color, ColorPicker, toColor, useColor } from "react-color-palette";
import { GetVal, StoreVal } from '../components/LocalStorage';
import { Tooltip } from "@nextui-org/react";
import "react-color-palette/lib/css/styles.css";

export const ClockSettings = () => {
  const [clockType, setClockType] = useState('0');
  const [clockBgColor, setClockBgColor] = useState("#000000");
  const [clockBgSel, setClockBgSel] = useState('color');
  const [clockShowDate, setShowDate] = useState('false');
  const [bgColorState, setBGColorState] = useColor('hex','#000000');
  
  useEffect (() => {
      setClockType(GetVal('ClockType'));
      setClockBgSel(GetVal('ClockBgSel'));
      setShowDate(GetVal('ClockShowDate'));
      setClockBgColor(GetVal('ClockBgColor'));
      setBGColorState(toColor('hex', clockBgColor));
  }, []);

  const handleClockType = (event: { target: { value: string; }; }) => {
    StoreVal('ClockType', event.target.value);
    setClockType(event.target.value);
  };

  const handleBgColor = (color: Color) => {
    StoreVal('ClockBgColor', color.hex);
    setClockBgColor(color.hex);
    setBGColorState(color);
  };

  const handleBgSel = (event: { target: { value: string; }; }) => {
    StoreVal('ClockBgSel', event.target.value);
    setClockBgSel(event.target.value);
  };

  const handleShowDate = (event: { target: { checked: boolean; }; }) => {
    StoreVal('ClockShowDate', event.target.checked.toString());
    setShowDate(event.target.checked.toString());
  };

  return (
    <>
    <div>
      <div className='flex justify-center'>
        <Tooltip content={"Select the clock face to use"} color="invert">
          <div className='mr-4 text-2xl text-white'>Clock type:</div>
          <select title='clockSelector' id="clockType" name="clocktypelist" value={clockType} defaultValue={clockType} 
                  onChange={handleClockType} className='text-white bg-slate-700 w-28 mr-14 text-2xl'>
            <option value="0">Clock 1</option>
            <option value="1">Clock 2</option>
            <option value="2">Clock 3</option>
            <option value="3">Clock 4</option>
          </select>
        </Tooltip>
        <div className='flex ml-14'>
        <Tooltip content={"Show Date on the clock"} color="invert">
          <div className='mr-4 text-2xl text-white'>Show date:</div>
          <input title='ShowDate' type="checkbox" name="showdate" checked={(clockShowDate === 'true')}
                 onChange={handleShowDate} className="mr-14 text-white h-8 w-8 checked:bg-green-600 checked:ring-green-600" />
        </Tooltip>
        </div>
        <Tooltip content={"Select the background to use wheater or a fixed color"} color="invert">
          <div className='mr-4 text-2xl text-white'>Background:</div>
          <select title='bgSelector' id="backgroundSel" name="bgSelList" value={clockBgSel} defaultValue={clockBgSel} 
                  onChange={handleBgSel} className='text-white bg-slate-700 w-28 mr-14 text-2xl'>
            <option value="color">Color</option>
            <option value="weather">Weather</option>
          </select>
        </Tooltip>
      </div>
      {(clockBgSel === "color") &&
        <div className='flex justify-center mt-10'>
        <Tooltip content={"Select the background color to use"} color="invert">
          <div className='mr-4 text-2xl text-white'>Background color:</div>
          {/* <input type="color" onChange={handleBgColor}/> */}
          <ColorPicker width={500} height={80} color={bgColorState}
                   onChange={handleBgColor} hideHSV hideHEX hideRGB dark />
        </Tooltip>
      </div>
      }
    </div>
    </>
  )
}

