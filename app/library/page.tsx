"use client"

import { useEffect, useRef, useState } from "react";
import LibNavButton from "../components/libNavButton"
import { io } from "socket.io-client";
import { GetVal, StoreVal } from "../components/LocalStorage";
import Image from "next/image";
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';



// Setup the websocket
var listenPort = Number(process.env.NEXT_PUBLIC_LISTEN_PORT) + 1;
var socket:any; 

interface fetchData {
    zone_id:string;
    options:{}; 
}

interface fetchList {
  zone_id:string;
  options:{}; 
  listoffset:number;
}

interface fetchPage {
  listoffset:number;
}

var g_zoneID = "";
var g_displayName = "";

export default function Library() {
    var listImage_url:string = "";
    const [ZoneSelShow, setZoneSelShow] = useState(false);
    const [payloadids, setPayloadids] = useState<any[]>([]);
    const [displayNames, setDisplayNames] = useState<any[]>([]);
    const [display_name, setdisplay_name] = useState("None");
    const [zone_id, setZone_id] = useState("");
    const [showData, setShowData] = useState({} as any);
    const [disableHomeBackBtn, setDisableHomeBackBtn] = useState(true);
    const [disableNextBtn, setDisableNextBtn] = useState(true);
    const [disablePrevBtn, setDisablePrevBtn] = useState(true);
    const [disableBottomLine, setDisableBottomLine] = useState(true);
    const itemListRef = useRef(null);
    const searchTermRef = useRef(null);
    const formRef = useRef(null);

    useEffect (() => {
        g_zoneID = GetVal("settings_NP_zoneID");
        g_displayName = GetVal("settings_NP_displayName");
    
        if ((g_zoneID === 'undefined') || (g_displayName === 'undefined')) {
            setZoneSelShow(true);
        }
        setdisplay_name(g_displayName);
        setZone_id(g_zoneID);
        socket = io(`http://localhost:${listenPort}`);
      }, []);


      useEffect (() => {
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
          }
          getData();
        });
    }, [ZoneSelShow, zone_id]);

    useEffect (() => {
        var disableNB:boolean = true;
        var disablePB:boolean = true;

        // This was neccessary because the item list sometimes did not start at the top and that was annoying
        if ((itemListRef.current !== null) && (showData.list !== undefined) && (showData.list.image_key !== null)) {
          (itemListRef.current as any).scrollTo(0, 0) as any;
        }

        if (showData.list === undefined) {
          setDisableBottomLine(true);
          return;
        }

        // determine which buttons are active
        if (showData.list.level !== undefined) {
          setDisableHomeBackBtn((showData.list.level === 0));
        }
        if (showData.list.display_offset !== undefined) {
          disablePB = ((showData.list.display_offset === 0));
          setDisablePrevBtn(disablePB);
        }
        else {
          setDisablePrevBtn(true);
        }
        if ((showData.list.display_offset !== undefined) && (showData.items.length !== undefined) && (showData.list.count !== undefined)) {
          disableNB = ((showData.list.display_offset + showData.items.length) >= showData.list.count);
          setDisableNextBtn(disableNB);
        }
        else {
          setDisableNextBtn(true);
        }
        if (disableNB && disablePB) {
          setDisableBottomLine(true);
        } else {
          setDisableBottomLine(false);
        } 
      }, [showData]);

    const ShowZoneSelector = ( props: { zoneIds:any[]; display_names:any[]; ZoneSelShow: boolean}) => {
        const { zoneIds, display_names, ZoneSelShow } = props;
        return(
          <>
            {ZoneSelShow && 
                <div className="absolute inset-0 h-full w-full bg-black font-bold text-3xl text-center p-4 z-[8]">
                  Select output:
                <div className="grid grid-cols-5 w-full ml-6 gap-8 mt-10 text-white z-[8] place-items-center">
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

      const DynButton = ( props: { zoneId: any; display_name:any }) => {
        const { zoneId, display_name } = props;
        return (
          <div className="z-[6]">
            <button type="button" className="z-[8] py-2 w-[200px] font-bold border-none text-4xl bg-[#eff0f1] text-[#232629] rounded-md" onClick={() => selectZone(zoneId, display_name)}>
              {display_name}
            </button>
          </div>
      )};
      
      function selectZone (zoneId:string, display_name:string) {
        g_zoneID = zoneId;
        g_displayName = display_name;
        setdisplay_name(display_name);
        setZone_id(zoneId);
        StoreVal("settings_NP_zoneID", zoneId);
        StoreVal("settings_NP_displayName", display_name);

        setZoneSelShow(false);
      }

      async function getData() {
        var tx_data = {} as fetchData;
        tx_data.zone_id = g_zoneID;
        tx_data.options = { pop_all: true };

        const res = await fetch('/roonapi/goRefreshBrowse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tx_data)
        });
       
        const rx_data = await res.json();
        setShowData(rx_data.data)
        
        return;
      }


    const ShowListImage = () => {
        if ((showData === undefined) || (showData.list === undefined)) return;

        if (showData.list.image_key !== null) {
            listImage_url = "/roonapi/getImage?image_key=" + showData.list.image_key;
        } else {
            return;
        }
        return (
          <div className="relative w-[130px] h-[130px] z-[6]">  
          <Image src={listImage_url} alt={""} fill={true} sizes="(max-width: 130px)" className="relative h-full w-full text-transparent rounded-xl" />
          </div>
    )};

    const goSearch = async (event:any) => {
      // Stop the form from submitting and refreshing the page.
      event.preventDefault()
      var tx_data = {} as fetchData;
      tx_data.zone_id = g_zoneID;

      // Get data from the form.
      tx_data.options = {
        item_key: event.target.searchItemKey.value,
        input: event.target.searchTerm.value
      }

      const res = await fetch('/roonapi/goRefreshBrowse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tx_data)
      });
     
      const rx_data = await res.json();
      setShowData(rx_data.data);

      return;
    }

    const ShowKeyBoard = (event:any) => {
      const [layout, setLayout] = useState("default");

      const readKeybInput = (input:string) => {
        if (searchTermRef.current === undefined) {
          console.log("searchTermRef.current is undefined");
          return;
        }
        (searchTermRef.current as any).value = input;

        return;
      }
    
      const checkKeybEnter = (button:string) => {
        if (button === '{enter}') {
          (formRef.current as any).requestSubmit();
        }
        if (button === "{shift}" || button === "{lock}") handleShift();
      }

      const handleShift = () => {
        setLayout(((layout === "default") ? "shift" : "default"));
      };

      return (
        <div className="relative z-[6] text-black text-xl font-bold ml-8 mb-4 w-[95%] ">
          <Keyboard
          layoutName={layout}
          onChange={readKeybInput}
          onKeyPress={checkKeybEnter}
          theme={"hg-theme-default myTheme1"}
          layout={{
            default: [
              "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
              "{tab} q w e r t y u i o p [ ] \\",
              "{lock} a s d f g h j k l ; ' {enter}",
              "{shift} z x c v b n m , . / {shift}",
              "{space}"
            ],
            shift: [
              "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
              "{tab} Q W E R T Y U I O P { } |",
              '{lock} A S D F G H J K L : " {enter}',
              "{shift} Z X C V B N M < > ? {shift}",
              "{space}"
            ]
          }}
          />
        </div>
    )};

    
    const ShowItems = () => {     
      const [enableKeyBoard, setEnableKeyBoard] = useState(false);

      if (showData.items === undefined) 
          return [];
          
      return showData.items.map((item:any, key:number) => (        
        <ul key={item.item_key} className="w-full">
        { (item.input_prompt !== undefined) ?
          <li>
            <form onSubmit={goSearch} ref={formRef} className="min-h-[48px] w-full drop-shadow-md mb-[10px] flex flex-row items-center align-middle justify-center" >
              <button title='Keyboard' type="button" onClick={() => setEnableKeyBoard((enableKeyBoard ? false : true))} className="zmdi zmdi-keyboard zmdi-hc-4x h-14 w-14 mr-4 mt-auto mb-auto text-[#eff0f1]"></button>
              <label htmlFor="searchTerm"></label>
              <input ref={searchTermRef} type="search" id="searchTerm" name="search" className="max-h-full w-4/5 border-0 p-0 text-2xl font-bold text-slate-800" placeholder={item.input_prompt.prompt} autoComplete='off'></input>
              <button title='Search' type="submit" className="zmdi zmdi-search zmdi-hc-4x h-14 w-14 ml-3 mt-auto mb-auto text-[#eff0f1]"></button>
              <label htmlFor="searchItemKey"></label>
              <input  type="text" title='searchItemKey' id="searchItemKey" className="hidden" value={item.item_key} readOnly></input>
            </form>
            {(enableKeyBoard) ? <ShowKeyBoard /> : ""}
          </li>
        :
          <li className="relative w-full text-center">
            <button type="button" className="relative bg-[#4d4d4d] text-[#eff0f1] min-h-[48px] text-xl w-[96%] drop-shadow-lg mb-3 font-bold text-center rounded-xl" onClick={() => getList(item.item_key, undefined)}>
              {item.title} 
              {((item.subtitle !== null) && (item.subtitle !== "")) && <span className="text-xl"><br/>( {item.subtitle} )</span>}
            </button>
          </li> 
        }
        </ul>
      ));
    }

    
    async function getList(item_key:string, listoffset:any) {
      var tx_data = {} as fetchList;
      tx_data.zone_id = g_zoneID;
      tx_data.options = { item_key: item_key };

      if (listoffset === undefined) {
        tx_data.listoffset = 0;
      } else {
        tx_data.listoffset = listoffset;
      }

      const res = await fetch('/roonapi/goRefreshBrowse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tx_data)
      });
     
      const rx_data = await res.json();
      setShowData(rx_data.data);

      return;
    }

    async function getPage(listoffset:any) {
      var tx_data = {} as fetchPage;

      if (listoffset === undefined) {
        tx_data.listoffset = 0;
      } else {
        tx_data.listoffset = listoffset;
      }

      const res = await fetch('/roonapi/goLoadBrowse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tx_data)
      });
     
      const rx_data = await res.json();
      setShowData(rx_data.data);

      return;
    }
    
    async function refresh() {
      var tx_data = {} as fetchData;
      tx_data.zone_id = g_zoneID;
      tx_data.options = { refresh_list: true };

      const res = await fetch('/roonapi/goRefreshBrowse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tx_data)
      });
     
      const rx_data = await res.json();
      setShowData(rx_data.data);

      return;
    }

    async function back() {
      var tx_data = {} as fetchData;
      tx_data.zone_id = g_zoneID;
      tx_data.options = { pop_levels: 1 };

      const res = await fetch('/roonapi/goRefreshBrowse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tx_data)
      });
     
      const rx_data = await res.json();
      setShowData(rx_data.data);

      return;
    }


 
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-black text-white">
            <div className="absolute inset-0 w-[1280px] h-[400px] border-2 border-white bg-black z-[2]"></div>

            <div id="navLineTop" className="absolute top-0 left-0 right-0 h-10 flex flex-row flex-wrap justify-between items-center align-middle text-white z-[6]">
                <div className="h-full w-full flex flex-row flex-wrap items-center align-middle justify-start text-2xl ">
                    <LibNavButton btn="back" onClick={() => back()} cname={`h-10 w-10 ml-4  mr-8 mt-auto mb-auto ${disableHomeBackBtn ? "text-gray-600" : "text-[#eff0f1]"}`} disabled={disableHomeBackBtn} />
                    <LibNavButton btn="home" onClick={() => getData()} cname={`h-10 w-10 mr-8 mt-auto mb-auto ${disableHomeBackBtn ? "text-gray-600" : "text-[#eff0f1]"}`} disabled={disableHomeBackBtn} />
                    <LibNavButton btn="refresh" onClick={() => refresh()} cname="h-10 w-10 mr-8 mt-auto mb-auto text-[#eff0f1]" />
                    <LibNavButton btn={display_name} onClick={() => setZoneSelShow(true)} cname="h-10 w-10 mr-8 mt-auto mb-auto text-[#eff0f1]" />
               </div>
            </div>

            <div id="content" ref={itemListRef} className={`absolute top-12 left-0 right-0  overflow-auto z-[6] ${disableBottomLine ? "bottom-0" : "bottom-12"}`}>
                <div id="listContainer" className="flex flex-row justify-around max-h-[130px]">
                    <div id="padding" className="flex w-1/5 max-h-full"></div>
                    <div id="listInfo" className="flex flex-col max-h-full justify-center items-center w-3/5 scroll-auto">
                        <div id="listTitle" className=" text-2xl font-bold">{(showData.list !== undefined) && showData.list.title}</div>
                        <div id="listSubtitle" className="text-xl">{(showData.list !== undefined) && showData.list.subtitle}</div>
                    </div>
                    <div id="listImage" className="flex ml-10 w-[16%] max-h-full">
                      <ShowListImage />
                    </div>
                </div>
                <div id="items" className="mt-3">
                  <ShowItems />
                </div>
            </div>
            
            {
            !disableBottomLine &&
            <div id="navLineBottom" className="absolute left-0 right-0 bottom-[2px] h-[40px] z-[6]">
                <div className="h-full flex flex-row flex-wrap items-center align-middle justify-center">
                    <LibNavButton btn="prev" onClick={() => getPage(showData.list.display_offset - 100)} cname={`h-10 w-10 mt-auto mb-auto ${disablePrevBtn ? "text-gray-600" : "text-[#eff0f1]"}`} disabled={disablePrevBtn}/>
                    <span id="pageNumber">{showData.list.display_offset + 1}-{(showData.list.display_offset + showData.items.length)} of {showData.list.count}</span>
                    <LibNavButton btn="next" onClick={() => getPage(showData.list.display_offset + 100)} cname={`h-10 w-10 mt-auto mb-auto ${disableNextBtn ? "text-gray-600" : "text-[#eff0f1]"}`} disabled={disableNextBtn}/>
                </div>
            </div>
            }

            <ShowZoneSelector zoneIds={payloadids} display_names={displayNames} ZoneSelShow={ZoneSelShow} />

        </main>
    )
}