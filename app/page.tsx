"use client"
import { useState } from "react";
import { GetVal, StoreVal } from "./components/LocalStorage";


export default function Home() {
  const [cookie, setcookie] = useState('UNSET');
  

  const handleClick = (MouseEvent: {button: number;}) => {
    setcookie(GetVal("settings['use4kImages']"));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-black text-white">
      <div id="isPlaying">
     <div id="isPlaying"> IS PLAYING '{cookie}' </div>
     
      <div id="containerCoverImage"></div>
      <div id="containerMusicInfo">
        <div id="line1" className="text-white font-bold h-[10%] mb-[1%]">&nbsp;</div>
        <div id="line2" className="text-white h-[10%] mb-[1%]">&nbsp;</div>
        <div id="line3" className="text-white h-[10%] mb-[1%]">&nbsp;</div>
        <div id="controlsPlayer">
          <button
            type="button"
            id="controlPrev"
            className="bg-white h-10 w-1/3"
            name="Previous"
            aria-label="Previous"
            onClick={() => StoreVal("settings['use4kImages']", "false")}
          ></button>
          <button
            type="button"
            id="controlPlayPauseStop"
            className="bg-green-500 h-10 w-1/3"
            name="Play Pause"
            aria-label="Play Pause"
            onClick={handleClick}
          ></button>
          <button
            type="button"
            id="controlNext"
            className="bg-red-600 h-10 w-1/3"
            name="Next"
            aria-label="Next"
          ></button>
        </div>
        <div id="containerTrackSeek">
          <div id="trackSeek">
            <div id="trackSeekValue">
              <span id="seekPosition" className="left">&nbsp;</span>
              <span id="seekLength" className="right">&nbsp;</span>
            </div>
          </div>
        </div>
        <div id="containerZoneList">
          <button
            type="button"
            className="buttonZoneName textBold buttonAvailable colorChange"
            id="nowplayingZoneList"
            // onClick={('#overlayZoneList').show()}
            name="Zone List"
            aria-label="Zone List"
          >
            zoneList
          </button>
        </div>
         <div id="controlsSettings">
        {/*  <button
            type="button"
            className="buttonFillHeight settingsButton"
            id="buttonLoop"
          ></button>
          <button
            type="button"
            className="buttonFillHeight settingsButton"
            id="buttonShuffle"
          ></button>
          <button
            type="button"
            className="buttonFillHeight settingsButton"
            id="buttonRadio"
          ></button>
          <button
            type="button"
            className="buttonFillHeight settingsButton buttonAvailable"
            id="buttonVolume"
            onclick="$('#overlayVolume').show()"
            name="Show Volume Controls"
            aria-label="Show Volume Controls"
          ></button>
          <button
            type="button"
            className="buttonFillHeight settingsButton buttonAvailable"
            id="buttonSettings"
            onclick="$('#overlaySettings').show()"
            name="Show Settings"
            aria-label="Show Settings"
          ></button> */}
        </div>
      </div>
    </div>
    </main>
  )
}
