"use client"
import { useEffect, useRef, useState } from "react";
import { GetVal, StoreVal } from "./components/LocalStorage";
import { io } from "socket.io-client";
import Image from "next/image";
import ControlButton from "./components/controlButton";
import { IfcRoonZoneApi, initZone } from "./components/IfcRoonZoneAPI";


// Setup the websocket
var listenPort = Number(process.env.NEXT_PUBLIC_LISTEN_PORT) + 1;
const socket = io(`http://localhost:${listenPort}`); 

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
  const inVolumeSlider = false;
  const [textScrollingLine1, setTextSrollingLine1] = useState(false);
  const [textScrollingLine2, setTextSrollingLine2] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const textLine1Ref = useRef<HTMLLIElement>(null);
  const textLine2Ref = useRef<HTMLLIElement>(null);

  useEffect (() => {
    g_settings.zoneID = GetVal("settings_NP_zoneID");
    g_settings.displayName = GetVal("settings_NP_displayName");
    g_settings.theme = "black";
    setdisplay_name(g_settings.displayName);

    socket.on("pairStatus", function(payload) {
      setPairState(payload.pairEnabled);
    });

    socket.on("zoneList", function(payload) {
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
  
    socket.on("zoneStatus", function(payload) {
      if (g_settings.zoneID !== 'undefined') {
        var found = false;
        for (var x in payload) {
          if (payload[x].zone_id === g_settings.zoneID) {
            g_curZone = payload[x];
            setCurZone({...payload[x]});
            found = true;
          }
        }
        if (!found) {
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
  }, [isOverflowActive]);

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
            <div className="grid grid-cols-5 ml-6 gap-8 mt-10 text-white z-[6]">
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
      <div className="absolute inset-0 w-[1280px] h-[400px] border-2 border-white bg-black z-2"></div>
      <ShowPairedMsg state={pairState} />
      <ShowZoneSelector zoneIds={payloadids} display_names={displayNames} ZoneSelShow={ZoneSelShow} />
      <ShowNoActivity />

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
            <ControlButton btn="volume" onClick={undefined} cname="h-10 w-10 mt-auto mb-auto" />
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


