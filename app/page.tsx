"use client"
import { useEffect, useState } from "react";
import { GetVal, StoreVal } from "./components/LocalStorage";
import { io } from "socket.io-client";
import Image from "next/image";

// Setup the websocket
var listenPort = Number(process.env.NEXT_PUBLIC_LISTEN_PORT) + 1;
const socket = io(`http://localhost:${listenPort}`); 

type StateType = {
  title: string;
  line1: string; 
  line2: string; 
  line3: string;
  image_key: string;
  image_url: string;
  Prev: any;
  Next: any;
  PlayMode: string;
  PlayModeLast: string;
  Loop: string;
  shuffle: string;
  Radio: string;
  Theme: string;
}

type SettingsType = {
  zoneID: string;
  displayName: string; 
  theme: string; 
}
var g_curZone = {};

export default function Home() {
  var g_state:StateType = {};
  var g_settings:SettingsType = {};
  const [pairState, setPairState] = useState(false);
  const [localStore, setlocalStore] = useState('UNSET');
  const [ZoneSelShow, setZoneSelShow] = useState(false);
  const [display_name, setdisplay_name] = useState("");
  const [zone_id, setzone_id] = useState("");
  const [payloadids, setPayloadids] = useState<any[]>([]);
  const [displayNames, setDisplayNames] = useState<any[]>([]);
  const [curZone, setCurZone] = useState({});
  const inVolumeSlider = false;
  const [state, setState] = useState<StateType>({});
  
  //setState(previousState => {return{ ...previousState, line1: x}});

  useEffect (() => {
    const global_settinsZoneID = GetVal("settings_NP_zoneID");
    g_settings.zoneID = global_settinsZoneID;
    g_settings.displayName = GetVal("settings_NP_displayName");
    g_settings.theme = "black";
  

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

        if (zone_array.includes(global_settinsZoneID) === false) {
          setZoneSelShow(true);
        }
      }
    });
  
    socket.on("zoneStatus", function(payload) {
      if (global_settinsZoneID !== 'undefined') {
        for (var x in payload) {
          if (payload[x].zone_id == global_settinsZoneID) {
            setCurZone(payload[x]);
            g_curZone = payload[x];
            
            if (g_state.title != payload[x].now_playing.one_line.line1) {
              g_state.title = payload[x].now_playing.one_line.line1;
              setState(g_state);
            }

            if (g_state.image_key != payload[x].now_playing.image_key || g_state.image_key === undefined) {
              g_state.image_key = payload[x].now_playing.image_key;
              setState(g_state);
            }

            if (g_state.line1 != payload[x].now_playing.three_line.line1) {
              g_state.line1 = payload[x].now_playing.three_line.line1;
              setState(g_state);
            }
            if (g_state.line2 != payload[x].now_playing.three_line.line2) {
              g_state.line2 = payload[x].now_playing.three_line.line2;
              setState(g_state);
            }
            if (g_state.line3 != payload[x].now_playing.three_line.line3) {
              g_state.line3 = payload[x].now_playing.three_line.line3;
              setState(g_state);
            }
            // Set zone button to active
      //       $(".buttonZoneId").removeClass("buttonSettingActive");
      //       $("#button-" + settings.zoneID).addClass("buttonSettingActive");
  
      //       updateZone(curZone);
          } else {
            setCurZone({});
            g_curZone = {};
          }
        }
      }
    });
  }, []);


  const ShowPairedMsg = ( props: { state: boolean; }) => {
    const { state } = props;
    return(
      <>
      {!state && 
        <div className="absolute z-[4] h-full bg-black">
          <div className="w-[90%] text-5xl text-white text-center justify-center">
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
            // <div className="inset-0 text-3xl text-white justify-center"> Select output: </div>
            <div className="absolute inset-0 z-[5] h-full w-full bg-black text-4xl text-center p-4">
              Select output:
            <div className="flex grid-cols-5 justify-center w-full h-full text-white mt-16">
            {
            zoneIds.map((zid, idx) => ( 
              <ul key={idx} className="mr-16">
                <DynButton zoneId={zid} display_name={display_names[idx]}/>
              </ul>
            ))
            }
            </div> 
          </div>
        }
      </>
  )};

  const DynButton = ( props: { zoneId: any; display_name:any }) => {
    const { zoneId, display_name } = props;
    return (
      <div className="z-[5]">
      <button type="button" className="h-14 py-2 px-4 font-bold border-none text-4xl bg-[#eff0f1] text-[#232629] inline-flex items-center justify-center rounded-md transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none data-[state=open]:bg-slate-100" onClick={() => selectZone(zoneId, display_name)}>
        {display_name}
      </button>
      </div>
  )};
  
  function selectZone (zoneId:string, display_name:string) {
    g_settings.zoneID = zoneId;
    StoreVal("settings_NP_zoneID", zoneId);
  
    g_settings.displayName = display_name;
    StoreVal("settings_NP_displayName", display_name);
  
    // Reset state on zone switch
    //setState((prev) => []);
    setZoneSelShow(false);
    socket.emit("getZone", zoneId);  
  }

  const ShowCoverImage = () => {
    console.log(g_curZone);
    if (g_curZone.now_playing !== undefined &&
      // state.image_key != curZone.now_playing.image_key ||
      g_curZone.now_playing.image_key !== undefined) {
      // state.image_key = curZone.now_playing.image_key;
  
      // if (curZone.now_playing.image_key === undefined) {
      //   state.image_url = "/img/transparent.png";
      // } else {
        g_state.image_url =
            "/roonapi/getImage?image_key=" + g_curZone.now_playing.image_key;
      }
    return (
      <>  
      <Image src={g_state.image_url} alt={`Cover art for ${state.title}`} fill={true} sizes="(max-width: 400px)"/>
      </>
  )};
  


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-black text-white">
    <div className="absolute inset-0 w-[1280px] h-[400px] border-2 border-white"></div>
      <ShowPairedMsg state={pairState}/>
      <ShowZoneSelector zoneIds={payloadids} display_names={displayNames} ZoneSelShow={ZoneSelShow}/>
      <div id="isPlaying">
     
      <div id="containerCoverImage" className="absolute left-3 inset-0 w-[400px] h-[400px]">
      <ShowCoverImage />
      </div>
      <div id="containerMusicInfo" className="absolute right-0 inset-0 ml-[420px] w-[780px] h-full">
        <div id="line1" className="text-white font-bold h-[10%] mb-[1%]">{state.line1}</div>
        <div id="line2" className="text-white h-[10%] mb-[1%]">{state.line2}</div>
        <div id="line3" className="text-white h-[10%] mb-[1%]">{state.line3}</div>
        <div id="controlsPlayer">
          <button
            type="button"
            id="controlPrev"
            className="bg-white h-10 w-1/3"
            name="Previous"
            aria-label="Previous"
            onClick={() => StoreVal("settings_test_click", "false")}
          ></button>
          <button
            type="button"
            id="controlPlayPauseStop"
            className="bg-green-500 h-10 w-1/3"
            name="Play Pause"
            aria-label="Play Pause"
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


