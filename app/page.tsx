"use client"
import { FormEvent, useEffect, useRef, useState } from "react";
import { GetVal, StoreVal } from "./components/LocalStorage";
import { io } from "socket.io-client";
import Image from "next/image";
import ControlButton from "./components/controlButton";
import { IfcRoonZoneApi, initZone } from "./components/IfcRoonZoneAPI";
import { DefaultSettings } from './components/defaultSettings'

// Setup the websocket
var listenPort = Number(process.env.NEXT_PUBLIC_LISTEN_PORT) + 1;
var socket:any; 

type SettingsType = {
  zoneID: string;
  displayName: string; 
  theme: string; 
}

interface ZoneSettings {
  zone_id: string;
  setting: string;
  value: string;
}

interface ChangeVolume {
  output_id: string;
  volume: string;
}

var g_settings:SettingsType = {} as SettingsType;

export default function Home() {
  var coverimage_url:string = "";
  var g_curZone:IfcRoonZoneApi = {} as IfcRoonZoneApi;
  const [pairState, setPairState] = useState(false);
  const [ZoneSelShow, setZoneSelShow] = useState(false);
  const [display_name, setdisplay_name] = useState("None");
  const [playBtn, setPlayBtn] = useState("play");
  const [payloadids, setPayloadids] = useState<any[]>([]);
  const [displayNames, setDisplayNames] = useState<any[]>([]);
  const [curZone, setCurZone] = useState<IfcRoonZoneApi>(initZone);
  const [textScrollingLine1, setTextSrollingLine1] = useState(false);
  const [textScrollingLine2, setTextSrollingLine2] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showVolune , setShowVolune] = useState(false);
  const textLine1Ref = useRef<HTMLLIElement>(null);
  const textLine2Ref = useRef<HTMLLIElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const volSliderRef = useRef(null);
  const [volume, setVolume] = useState('0');

  useEffect (() => {
    socket = io(`http://localhost:${listenPort}`);
  }, []);

  useEffect (() => {
    DefaultSettings();
    g_settings.zoneID = GetVal("settings_NP_zoneID");
    g_settings.displayName = GetVal("settings_NP_displayName");
    g_settings.theme = "black";
    setdisplay_name(g_settings.displayName);

    socket.on("pairStatus", function(payload:any) {
      setPairState(payload.pairEnabled);
    });

    socket.on("zoneList", function(payload:any) {
      var zone_array:any[] = [];
      var name_array:any[] = [];
      if (payload !== undefined) {
        for (var x in payload) {
          zone_array.push(payload[x].zone_id);
          name_array.push(payload[x].display_name);
        }
        setPayloadids(zone_array);
        setDisplayNames(name_array);

        if (zone_array.includes(g_settings.zoneID) === false) {
          setZoneSelShow(true);
        }
      }
    });
  
    socket.on("zoneStatus", function(payload:any) {
      if (g_settings.zoneID !== 'undefined') {
        var zoneFound = false;
        for (var x in payload) {
          if (payload[x].zone_id === g_settings.zoneID) {
            g_curZone = payload[x];
            setCurZone({...payload[x]});
            if (g_curZone.outputs[0].volume === undefined) {
              setVolume("fixed");
            } else {
              setVolume(String(g_curZone.outputs[0].volume.value));
            }
            zoneFound = true;
          }
        }
        if (!zoneFound) {
          setZoneSelShow(true);
        }
      } else {
        setCurZone(initZone);
        g_curZone = initZone;
        setZoneSelShow(true);
      }
      determinePlayBtnState();
    });

    setShowPlayer((pairState) && (!ZoneSelShow));
  }, [pairState, ZoneSelShow, curZone.now_playing]);

  useEffect(() => {
    if (textLine1Ref.current) {
      if (isOverflowActive(textLine1Ref.current)) {
        setTextSrollingLine1(true);
      } else {
        setTextSrollingLine1(false);
      }
    }
    if (textLine2Ref.current) {
      if (isOverflowActive(textLine2Ref.current)) {
        setTextSrollingLine2(true);
      } else {
        setTextSrollingLine2(false);
      }
    }
    
    if (!showVolune) return;
    const handleOutSideClick = (event:any) => {
      if (!volumeRef.current?.contains(event.target)) {
        setShowVolune(false);
        console.log("Outside Clicked. ");
      }
    };

    window.addEventListener("mousedown", handleOutSideClick);
    // clean up
    return () => {
      window.removeEventListener("mousedown", handleOutSideClick);
    };

  }, [isOverflowActive, showVolune]);

  function isOverflowActive(event:any) {
    return event.clientWidth > (740); 
  }


  const ShowPairedMsg = ( props: { state: boolean; }) => {
    const { state } = props;
    return(
      <>
      {!state && 
        <div className="absolute inset-0 min-h-full min-w-full bg-black z-[7]">
          <div className="flex w-full h-full p-20 text-5xl text-white text-center z-[7]">
            This extension is not enabled. Please use a Roon client to enable it.
          </div>
        </div>
      }
      </>
  )};
  
  const ShowZoneSelector = ( props: { zoneIds:any[]; display_names:any[]; ZoneSelShow: boolean}) => {
    const { zoneIds, display_names, ZoneSelShow } = props;
    return(
      <>
        {ZoneSelShow && 
            <div className="absolute inset-0 h-full w-full bg-black font-bold text-3xl text-center p-4 z-[6]">
              Select output:
            <div className="grid grid-cols-5 w-full ml-6 gap-8 mt-10 text-white z-[6] place-items-center">
            {
              zoneIds.map((zid, idx) => ( 
                <ul key={idx} className="justify-self-center self-center">
                  <DynButton zoneId={zid} display_name={display_names[idx]}/>
                </ul>
              ))
            }
            </div> 
          </div>
        }
      </>
  )};

  const ShowNoActivity = () => {
    return(
      <>
      {(curZone.now_playing === undefined) &&
          <div className="absolute inset-0 min-h-full min-w-full bg-black z-[5]">
            <div className="flex w-full h-[80%] p-28 text-5xl text-white text-center z-[5]">
              Nothing happening on "{display_name}" start some music or select another output.
            </div>
            <div className="flex w-full h-full justify-center z-[5]">
              <ControlButton btn="output" onClick={() => setZoneSelShow(true)} cname="z-[5] h-16 w-16" />
            </div>
          </div>
      }
      </>
  )};


  const DynButton = ( props: { zoneId: any; display_name:any }) => {
    const { zoneId, display_name } = props;
    return (
      <div className="z-[6]">
        <button type="button" className="z-[6] py-2 w-[200px] font-bold border-none text-4xl bg-[#eff0f1] text-[#232629] rounded-md" onClick={() => selectZone(zoneId, display_name)}>
          {display_name}
        </button>
      </div>
  )};
  
  function selectZone (zoneId:string, display_name:string) {
    g_settings.zoneID = zoneId;
    StoreVal("settings_NP_zoneID", zoneId);

    g_settings.displayName = display_name;
    StoreVal("settings_NP_displayName", display_name);
    setdisplay_name(display_name);

    setZoneSelShow(false);
    socket.emit("getZone");  
  }


  const ShowVolumeControl = () => {
    const [volChange, setVolChange] = useState(volume);
    const [sliderMove, setSliderMove] = useState(false);

    useEffect(() => {
      const slider = document.querySelector("input[type=range]") as HTMLInputElement;
      const tooltip = document.getElementById("slider-value");
      if ((tooltip) && (slider)) {
        let thumbSize = 40;
        let sRange = Math.abs(Number(slider.max) - Number(slider.min));
        const ratio = (slider.offsetWidth) / sRange
        let thumbComp = (thumbSize * 1.5) * (Number(slider.value) - Number(slider.min)) / sRange
        let amountToMove = (thumbSize / 2) + (ratio * (Number(slider.value) - Number(slider.min))) - thumbComp
        tooltip.style.left = amountToMove+"px"
      }
    }, [volChange]);

    function sendVolumeValue(e: FormEvent<HTMLInputElement>) {
      let _target = e.target as HTMLInputElement;
      setVolume(volChange);
      setSliderMove(false)
      var volMsg:ChangeVolume = { output_id: curZone.outputs[0].output_id,
                                  volume: _target.value};
      socket.emit("changeVolume", volMsg);
    }

    return(
      <>
      {showVolune && 
        <div className="absolute inset-0 h-full w-full z-10">
          <div className="h-full w-full backdrop-blur-sm"></div>
          <div className="absolute inset-0 grid top-0 place-items-center h-screen">
            <div ref={volumeRef} className="grid w-[700px] h-[150px] text-4xl bg-slate-700 text-white place-items-center">
            {(volume === "fixed") ?
            <p className="text-3xl"> Output '{display_name}' has fixed Volume!</p> :
            <>
            <p className="w-full text-center text-3xl">'{display_name}' volume = {curZone.outputs[0].volume.value}{(curZone.outputs[0].volume?.type !== 'number') ? curZone.outputs[0].volume?.type : ""}</p>
            <div id="slider-value" className={`relative w-4/5 text-2xl -mt-6 ${sliderMove ? "text-white" : "text-slate-700"}`}>
              {volChange}
            </div>
            <div className="w-full text-center ">
              <input
                aria-label="Volume-slider"
                type="range"
                min={curZone.outputs[0].volume.min}
                max={curZone.outputs[0].volume.max}
                step={curZone.outputs[0].volume.step}
                value={volChange}
                onMouseUp={sendVolumeValue}
                onMouseDown={() => setSliderMove(true)} 
                onChange={({ target: { value: vol } }) => {setVolChange(vol);}}
                className="w-4/5 -mt-6 cursor-pointer 
                           appearance-none bg-transparent 
                           [&::-webkit-slider-runnable-track]:rounded-full 
                           [&::-webkit-slider-runnable-track]:col
                           [&::-webkit-slider-runnable-track]:h-4 
                         [&::-webkit-slider-runnable-track]:bg-black/50 
                           [&::-webkit-slider-thumb]:appearance-none 
                           [&::-webkit-slider-thumb]:h-[50px] 
                           [&::-webkit-slider-thumb]:w-[50px] 
                           [&::-webkit-slider-thumb]:border-none
                         [&::-webkit-slider-thumb]:bg-blue-500
                           [&::-moz-range-track]:rounded-full 
                           [&::-moz-range-track]:h-4 
                         [&::-moz-range-track]:bg-black/50 
                         [&::-moz-range-progress]:bg-green-600
                           [&::-moz-range-progress]:h-4
                           [&::-moz-range-progress]:rounded-full
                           [&::-moz-range-thumb]:appearance-none 
                           [&::-moz-range-thumb]:h-[50px] 
                           [&::-moz-range-thumb]:w-[50px] 
                           [&::-moz-range-thumb]:border-none
                         [&::-moz-range-thumb]:bg-blue-500"
              />
            </div>
            </>
            }
            </div>
          </div>
        </div>
      }
      </>
  )};


  const ShowCoverImage = () => {
    if (pairState === false) { return (<></>)};

    if (curZone.now_playing !== undefined &&
        curZone.now_playing.image_key !== undefined) {
      // state.image_key = curZone.now_playing.image_key;
  
      if (curZone.now_playing.image_key === undefined) {
        coverimage_url = "/no_image.webp";
      } else {
        coverimage_url =
            "/roonapi/getImage?image_key=" + curZone.now_playing.image_key;
      }
    }
    return (
      <>  
      <Image src={coverimage_url} alt={`Cover art for ${curZone.now_playing.one_line.line1}`} fill={true} sizes="(max-width: 400px)"/>
      </>
  )};
  
  function SendCmd(cmd:string, zone_id:string) {
      if (cmd == "prev") {
        socket.emit("goPrev", zone_id);
      } else if (cmd == "next") {
        socket.emit("goNext", zone_id);
      } else if (cmd == "play") {
        socket.emit("goPlay", zone_id);
      } else if (cmd == "pause") {
        socket.emit("goPause", zone_id);
      } else if (cmd == "stop") {
        socket.emit("goStop", zone_id);
      }
  }

  function determinePlayBtnState () {
    if (g_curZone.is_play_allowed) {
      setPlayBtn("play");
    }
    else if (g_curZone.is_pause_allowed) {
      setPlayBtn("pause");
    } else {
      setPlayBtn("stop");
    }
  }

  function changePlayMode() {
    if (curZone.is_play_allowed) {
      SendCmd("play", curZone.zone_id);
    } else if (curZone.is_pause_allowed) {
      SendCmd("pause", curZone.zone_id);
    } else {
      SendCmd("stop", curZone.zone_id);
    }
  }

  function sendNextCommand () {
    if (curZone.is_next_allowed) {
      SendCmd("next", curZone.zone_id);
    }
  }
  function sendPrevCommand () {
    if (curZone.is_previous_allowed) {
      SendCmd("prev", curZone.zone_id);
    }
  }

  function changeZoneSetting(zoneSetting:string, zoneSettingValue:string) {
    var msg = {} as ZoneSettings;
    msg.zone_id = curZone.zone_id;
    msg.setting = zoneSetting;
    msg.value = zoneSettingValue;
    socket.emit("changeSetting", msg);
  }

  function auto_radio_change() {
    if (curZone.settings.auto_radio === true) {
      changeZoneSetting("auto_radio", "false");
    } else {
      changeZoneSetting("auto_radio", "true");
    }
  }
  function shuffle_change() {
    if (curZone.settings.shuffle === true) {
      changeZoneSetting("shuffle", "false");
    } else {
      changeZoneSetting("shuffle", "true");
    }
  }
  function loop_change() {
    if (curZone.settings.loop === 'loop') {
      changeZoneSetting("loop", "loop_one");
    } else if (curZone.settings.loop === 'loop_one') {
      changeZoneSetting("loop", "disabled");
    } else {
      changeZoneSetting("loop", "loop");
    }
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-black text-white">
      <ShowPairedMsg state={pairState} />
      <ShowZoneSelector zoneIds={payloadids} display_names={displayNames} ZoneSelShow={ZoneSelShow} />
      <ShowNoActivity />
      <ShowVolumeControl />

      <div id="MusicPlayerControl" className={`${showPlayer ? "z-[8]" : "z[0]"}`}>
      {showPlayer && (curZone.now_playing !== undefined) &&
      <>
        {/* Cover image on the left side of the screen */}
        <div id="CoverImage" className="absolute left-3 inset-0 w-[400px] h-[400px]">
          <ShowCoverImage />
        </div>
        
        {/* Music info on the top right side of the screen */}
        <div id="MusicInfo" className="absolute right-0 inset-0 ml-[460px] w-[740px] h-full overflow-x-hidden">
          <div id="line1" className="min-w-full overflow-x-hidden whitespace-nowrap">
            <div className={`relative flex ${(textScrollingLine1) ? "" : "justify-center"}`}>
              <ul className={`text-white font-bold text-4xl mt-12 mb-6 ${(textScrollingLine1) ? "animate-marquee" : ""}`}>
                <li ref={textLine1Ref} value="" className={`${(textScrollingLine1) ? "mr-16" : ""}`}>
                  {curZone.now_playing.two_line.line1}
                </li>
              </ul>
              {textScrollingLine1 && 
              <ul className={`absolute top-0 text-white font-bold text-4xl mt-12 mb-6 ${(textScrollingLine1) ? "animate-marquee2" : ""}`}>
                <li className="mr-16">
                  {curZone.now_playing.two_line.line1}
                </li>
              </ul>
              }
            </div> 
          </div> 
          <div id="line2" className="min-w-full overflow-x-hidden whitespace-nowrap">
             <div className={`relative flex ${(textScrollingLine2) ? "" : "justify-center"}`}>
              <ul className={`text-white text-3xl mb-4 ${(textScrollingLine2) ? "animate-marquee" : ""}`}>
                <li ref={textLine2Ref} value="" className={`${(textScrollingLine2) ? "mr-16" : ""}`}>
                  {curZone.now_playing.two_line.line2}
                </li>
              </ul>
              {textScrollingLine2 && 
              <ul className={`absolute top-0 text-white text-3xl mb-4 ${(textScrollingLine2) ? "animate-marquee2" : ""}`}>
                <li className="mr-16">
                  {curZone.now_playing.two_line.line2}
                </li>
              </ul>
              }
            </div> 
          </div> 
          
          {/* Music player controls on the bottom right side of the screen */}
          <div id="PlayerControls" className="flex w-full justify-between mt-4">
            <ControlButton btn="prev" onClick={() => sendPrevCommand()} cname={`h-14 w-14 mt-auto mb-auto ${(curZone.is_previous_allowed) ? "" : "text-neutral-500"}`} />
            <ControlButton btn={playBtn} onClick={() => changePlayMode()} cname="h-20 w-20 mt-auto mb-auto" />
            <ControlButton btn="next" onClick={() => sendNextCommand()} cname={`h-14 w-14 mt-auto mb-auto ${(curZone.is_next_allowed) ? "" : "text-neutral-500"}`} />
          </div>
          <div id="TrackSeek" className="">
            <span id="TrackSeekContainer">
              <progress id="TrackProgress" value={(curZone.now_playing.length === 0) ? 0 : (curZone.now_playing.seek_position / curZone.now_playing.length)} max="1" className="w-full rounded-full bg-neutral-600" />
            </span>
          </div>
          <div id="controlsSettings" className="flex w-full justify-between mt-3">
            <ControlButton btn={(curZone.settings.loop === 'disabled') ? "loop" : curZone.settings.loop} onClick={() => loop_change()} cname={`h-10 w-10 mt-auto mb-auto ${(curZone.settings.loop !== 'disabled') ? "text-green-500" : ""}`} />
            <ControlButton btn="shuffle" onClick={() => shuffle_change()} cname={`h-10 w-10 mt-auto mb-auto ${(curZone.settings.shuffle) ? "text-green-500" : ""}`} />
            <ControlButton btn="radio" onClick={() => auto_radio_change()} cname={`h-10 w-10 mt-auto mb-auto ${(curZone.settings.auto_radio) ? "text-green-500" : ""}`} /> 
            <ControlButton btn="volume" onClick={() => setShowVolune(true)} cname="h-10 w-10 mt-auto mb-auto" />
            <ControlButton btn="output" onClick={() => setZoneSelShow(true)} cname="h-10 w-10 mt-auto mb-auto" />
          </div>

        </div>
      </>
      }
      </div>

      <div id="ZoneSelect" className="absolute flex inset-0 w-full h-full justify-end z-[1]"> 
          <div className="relative mt-64 -mr-3 z-0">
            <span className="flex -rotate-90 text-xl text-neutral-400">
              {display_name}
            </span>
          </div>
          
      </div>
    </main>
  );
}


