"use client"

import { useEffect, useRef, useState } from "react";
import ReactHowler from 'react-howler';

const proxy = 'http://localhost:8010/proxy/';
const rpApiBaseUrl = 'api/get_block?bitrate=4&info=true';
const slideshowUrl = 'https://img.radioparadise.com/slideshow/720/{}.jpg';

var nofSongs:number = 0;
var sIndex:number = 0;
var playModePlay:boolean = false;
var rx_data = {} as any;
var nextBufferDownloaded:boolean = false;
const PRELOAD_TIME = 10; //seconds

export const dynamic = 'force-dynamic';
export default function WebRadio() {
  const [showData, setShowData] = useState({} as any);
//  const [bufferData, setBufferData] = useState({});
  const [playMode, setPlayMode] = useState("pause");
  const [songIndex, setSongIndex] = useState(0);
  const [songTime, setSongTime] = useState("0:00");
  const [disableNextBtn, setDisableNextBtn] = useState(false);
  const [disablePrevBtn, setDisablePrevBtn] = useState(false);
  const [getNextData, setGetNextData] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [showPlayList, setShowPlayList] = useState(false);
  const [playList, setPlayList] = useState([] as any[]);
  const howlerRef = useRef(null);


  useEffect (() => {
    get_RP_Data(rpApiBaseUrl);
    setSongTime(formatTime(0));
    setGetNextData(false);
  }, []);

  useEffect (() => {
    if ((showData.song !== undefined) && (sIndex < nofSongs-1)) {
      setDisableNextBtn(false);
    } else {
      setDisableNextBtn(true);
    }
    if ((showData.song !== undefined) && (sIndex > 0)) {
      setDisablePrevBtn(false);
    } else {
      setDisablePrevBtn(true);
    }
  }, [showData, songIndex]);

  useEffect (() => {
    if (howlerRef.current !== null) {
      (howlerRef.current as any).howler.on('end', function() {
        (howlerRef.current as any).howler.stop();
        sIndex = 0;
        setSongIndex(sIndex);
        changeNextBuffer();
        nextBufferDownloaded = false;
      });
    }
  }, [howlerRef.current, rx_data]);

  useEffect (() => {
    if ((getNextData) && (!nextBufferDownloaded)){
      get_RP_Data(rpApiBaseUrl + '&event=' + showData.end_event);
      console.log("Get Next Data!!!");
      nextBufferDownloaded = true;
    }
    setGetNextData(false);
  }, [getNextData]);

  useEffect (() => {
    if (!firstTimeLoad) {
      changeNextBuffer();
    }
  }, [firstTimeLoad]);

  useEffect (() => {
    const timer = setInterval(() => {
      trackTime();
      if ((playModePlay) && (playMode !== 'play')) {
        setPlayMode('play');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [songIndex, playMode]);


  async function get_RP_Data(RpUrl:any) {
    rx_data = {};
    const res = await fetch(proxy + RpUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    rx_data = await res.json();
    setFirstTimeLoad(false);
    return;
  }

  function changeNextBuffer () {
    nofSongs = 0;
    setShowData(rx_data);
    for(let ele in rx_data.song){
      nofSongs++;
    }
  }

  function playTrack() {
    playModePlay = true;
    setPlayMode('play');
  }

  function pauseTrack() {
    playModePlay = false;
    setPlayMode('pause');
  }

  function gotoTrack(idx:number) {
    (howlerRef.current as any).howler.seek(showData.song[idx].elapsed/1000);
    detTrackIndex(showData.song[idx].elapsed/1000);
  }

  function nextTrack() {
    if (sIndex < nofSongs-1) {
      setDisableNextBtn(false);
      gotoTrack(sIndex+1);
    }
    else {
      setDisableNextBtn(true);
    }
  }

  function PreviousTrack() {
    if (sIndex > 0) {
      setDisablePrevBtn(false);
      gotoTrack(sIndex-1);
    }
    else {
      setDisablePrevBtn(true);
    }
  }

  function trackTime() {
    if ((howlerRef === null) || (playMode !== 'play')) {
      return;
    }
    var curAbsTime = (howlerRef.current as any).howler.seek();
    detTrackIndex(curAbsTime);
    var currentTrackTime = curAbsTime - (showData.song[sIndex].elapsed/1000);
    setSongTime(formatTime(currentTrackTime));

    if ((showData.length <= PRELOAD_TIME) || (new Date().getTime() > (showData.sched_time_millis + ((showData.length - PRELOAD_TIME) * 1000)))) {
      console.log("GetNextData requested showData.length = " + showData.length + " showData.sched_time_millis = " + showData.sched_time_millis + " now = " + new Date().getTime());
      setGetNextData(true);
    }

    return;
  }

  function formatTime(secs:any) {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = Math.floor(secs - minutes * 60) || 0;

    return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }

  function detTrackIndex (time:any) {
    for (var i = 0; i < nofSongs; i++) {
      if (Math.floor(time) < Math.floor((showData.song[i].elapsed + showData.song[i].duration)/1000)) {
        if (i !== sIndex) {
          sIndex = i;
          setSongIndex(i);
        }
        break;
      }
    }  
  }

  function createTrackList () {
    const result:any[] = [];
    for (var x in showData.song) {
      result[Number(x)] = showData.song[Number(x)].artist + ' - ' + showData.song[Number(x)].title;
    }
    setPlayList(result);
    setShowPlayList(true);
  }
  
  

    return (
        <main className="flex flex-col items-center justify-between bg-black min-h-screen text-white w-full h-full z-0">
          <div className="absolute inset-0 w-[1280px] h-[400px] border-2 border-white z-[2]"></div>

          {/* <!-- Cover --> */}
          <div id="cover" className="absolute left-3 inset-0 w-[400px] h-[400px] z-[3]">
            {(showData.image_base !== undefined) &&
              <img src={`${showData.image_base + showData.song[songIndex].cover}`} width="400px" alt="No Image" className="relative min-h-full min-w-full" />
              //<img src={`${showData.image_base + showData.song[0].slideshow[0]}`} width="400px" alt="No Image" className="relative min-h-full min-w-full" />
            }
          </div>
          {/* <div id="loader"></div> */}
          {/* <div className="display:none; animate-bottom" id="mainPage"> */}
          <div className="absolute right-0 inset-0 ml-[460px] w-[740px] h-full overflow-hidden p-0 m-0 outline-0 z-[6]" id="mainPage">
          {/* <button id='getData' name="getData" title='getData' type="button" className="relative z-[6] h-14 w-20" onClick={refresh}>retrieve data</button> */}
            

            {/* <!-- Top Info --> */}
            <div id="title" className="relative w-full h-[70%] leading-8  text-center text-4xl opacity-90 font-light text-white z-[6]">
              <div id="track" className="relative w-full mt-10 leading-8 h-[48px] text-center text-4xl opacity-90 font-bold text-white">{(showData.song !== undefined) ? showData.song[songIndex].artist + " - " + showData.song[songIndex].title : "Track"}</div>
              <div id="album" className="relative w-full mt-4 leading-9 h-[34px] text-center text-3xl opacity-90 font-bold text-white">{(showData.song !== undefined) ? showData.song[songIndex].album + ' (' + showData.song[songIndex].year + ')' : "---"}</div>
              <div id="timer" className="relative w-full mt-4 text-3xl opacity-60 font-light text-white">{songTime + ' (' + ((showData.song !== undefined) ? formatTime(showData.song[songIndex].duration/1000) : "--:--") + ')'}</div>
              {/* <!-- <div id="duration">0:00</div> --> */}
            </div>

            {/* <!-- Controls --> */}
            <div className="relative w-[95%] h-[30%] z-[6]">
              <div className="flex flex-row w-full h-full justify-between -mt-4">
                {/* <div id="loading"></div>
                <div id="nextLoading"></div>
                <div id="prevLoading"></div> */}
                <div className={`zmdi zmdi-skip-previous zmdi-hc-3x flex h-[48px] w-[48px] mr-auto mt-9 ml-5  ${disablePrevBtn ? "text-gray-600" : "text-[#eff0f1]"}`} id="prevBtn" onClick={PreviousTrack}></div>
                {(playMode === "play") ?
                <div className="zmdi zmdi-pause zmdi-hc-4x flex h-[48px] w-[48px] mr-auto mt-7 ml-5" id="pauseBtn" onClick={pauseTrack}></div>
                :
                <div className="zmdi zmdi-play zmdi-hc-4x flex h-[48px] w-[48px] mr-auto mt-7 ml-5" id="playBtn" onClick={playTrack}></div>
                }
                <div className={`zmdi zmdi-skip-next zmdi-hc-3x flex h-[48px] w-[48px] mr-auto mt-9 ml-5 ${disableNextBtn ? "text-gray-600" : "text-[#eff0f1]"}`} id="nextBtn" onClick={nextTrack}></div>
                <div className="zmdi zmdi-playlist-plus zmdi-hc-3x flex h-[48px] w-[48px] mr-auto mt-9 ml-5" id="playlistBtn" onClick={() => createTrackList()}></div>
                <div className="zmdi zmdi-volume-up zmdi-hc-3x flex h-[48px] w-[48px] mr-auto mt-9 ml-5" id="volumeBtn" onClick={() => console.log(showData)}></div>
              </div>

            </div>
            
            {(showData.song !== undefined) && (showData.song[songIndex].gapless_url !== undefined) &&
            <ReactHowler
              src={[showData.url]}
              playing={(playMode === "play")}
              ref={howlerRef}
              volume={1.0} // Max volume
              html5={true}
            />
            }
            
            {/* <!-- Playlist --> */}
            {showPlayList &&
            <div id="playlist" className="absolute w-full h-full inset-0 top-0 left-0 overflow-auto bg-black  text-[#eff0f1] z-[7]">
              <button id="close" type="button" className="zmdi zmdi-close zmdi-hc-3x absolute h-[48px] w-[48px] top-0 left-0 " onClick={() => setShowPlayList(false)}></button>
              <div id="list" className="relative w-full top-1/2 -translate-y-1/2 text-3xl">
                {playList.map((item, idx:number) => (
                  <ul key={idx} className="w-full text-center mb-4">
                    <li key={idx + ":1"} className="bg-[#4d4d4d] min-h-[48px] w-[96%] rounded-xl">
                    <button type="button" className="w-full min-h-[48px]" onClick={() => {gotoTrack(idx); setShowPlayList(false)}}>{item}</button>
                    </li>
                  </ul>
                ))}
              </div>
            </div>
            }

            {/* <!-- Progress --> */}
            <div id="progress"></div>

            {/* <!-- Volume --> */}
            <div id="volume" className="fadeout">
              <div id="barFull" className="bar"></div>
              <div id="barEmpty" className="bar"></div>
              <div id="sliderBtn"></div>
            </div>
          </div>

            {/* <!-- Logos --> */}
            <div className="absolute inset-0 h-full w-full z-[4]">
              <div id="logo" className="absolute h-full w-full">
                <a target="_blank" href="https://www.radioparadise.com" className="absolute bottom-[1%] right-[1%]">
                  <img src="./rp-logo.png" height="100" width="100" alt="No Image" className="relative w-[100px] h-[100px]" />
                </a>
              </div>
              <div id="logo" className="absolute h-full w-full">
                <a target="_blank" href="https://www.radioparadise.com/rp2s-content.php?name=Support&file=support" className="absolute bottom-[26%] right-[1%]">
                  <img src="./button_donate.png" width="90" alt="No Image" className="relative w-[90px]" />
                </a>
              </div>
              <div id="flac" className="absolute h-full w-full ">
                <a target="_blank" href="https://www.radioparadise.com/" className="absolute bottom-[1%] left-[1%] bg-slate-950 opacity-50">
                  <img src="./flac_logo_transparent.png" alt="No Image" className="relative h-[80px] w-[100px] " />
                </a>
              </div>
            </div>

        </main>
    )
}