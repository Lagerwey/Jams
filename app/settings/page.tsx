"use client"
import { useEffect, useRef, useState } from "react"
import { StoreVal } from "../components/LocalStorage";
import { basename } from "node:path/posix";
import { ClockSettings } from "./clock_settings";
import { WebRadioSettings } from "./webradio_settings";
import { PlayNowSettings } from "./playnow_settings";
import { VuMeterSettings } from "./vumeter_settings";



export default function Settings() {
    const [selectedTab, setSelectedTab] = useState(0);

    return (
        <main className="absolute h-full w-full z-[1] bg-black text-white">
        <h1 className="text-2xl text-center w-full">Settings</h1>
        <div >
            <div className="py-2 w-full">
                <div className="flex justify-between items-center h-14 p-8 font-bold">
                    <button className={selectedTab === 0 ? "bg-white text-slate-700 outline-none w-full p-4 text-center" : "bg-slate-700 outline-none w-full p-4 text-center"}
                            onClick ={() => setSelectedTab(0)}>
                        Play now
                    </button>
                    <button className={selectedTab === 1 ? "bg-white text-slate-700 outline-none w-full p-4 text-center" : "bg-slate-700 outline-none w-full p-4 text-center"}
                            onClick ={() => setSelectedTab(1)}>
                        Web radio
                    </button>
                    <button className={selectedTab === 2 ? "bg-white text-slate-700 outline-none w-full p-4 text-center" : "bg-slate-700 outline-none w-full p-4 text-center"}
                            onClick ={() => setSelectedTab(2)}>
                        Clock
                    </button>
                    <button className={selectedTab === 3 ? "bg-white text-slate-700 outline-none w-full p-4 text-center" : "bg-slate-700 outline-none w-full p-4 text-center"}
                            onClick ={() => setSelectedTab(3)}>
                        VU meter
                    </button>
                </div>
            </div>
        </div>
        <div className="w-full h-full p-8">
            <div className={selectedTab === 0 ? "" : "hidden"}><PlayNowSettings /></div>
            <div className={selectedTab === 1 ? "" : "hidden"}><WebRadioSettings /></div>
            <div className={selectedTab === 2 ? "" : "hidden"}><ClockSettings /></div>
            <div className={selectedTab === 3 ? "" : "hidden"}><VuMeterSettings /></div>
        </div>
        </main>
    )
}