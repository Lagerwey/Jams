"use client"
import Link from "next/link"
import "./zmdi/css/material-design-iconic-font.css"
import { useState } from "react"


export function NavMenu() {
    const [navmenu, setNavMenu] = useState(false);

    return (
        <header className="bg-black">
            <div className={`absolute inset-0 w-[1280px] h-[400px] ${navmenu ? "z-20" : "z[0]"}`}>
            <section className="inline-block w-full text-right z-20 text-white text-6xl ">
                <button type="button" title="menu button" className="h-full" onClick={() => setNavMenu(!navmenu)}>
                    {navmenu && <i className="relative z-[1] mr-4 zmdi zmdi-apps"/>}
                    {!navmenu && <i className="relative z-20 mr-4 zmdi zmdi-apps"/>}
                </button>
            </section>
            
            <section className={navmenu ? "absolute top-0 origin-top z-20 bg-gray-900 h-full w-full animate-openmenu" : 
                                          "absolute top-0 origin-top z-20 bg-gray-900 h-full w-full animate-closemenu"}>
                <button type="button" title="close button" className="w-full text-right z-20 text-white text-6xl" onClick={() => setNavMenu(!navmenu)}>
                    <i className="relative z-20 mr-4 zmdi zmdi-close"></i>
                </button>
                <nav className="navbar absolute inset-0 gap-5 mt-10 grid grid-cols-3 text-3xl text-white h-full w-full">
                    <ul className="flex relative justify-center">
                        <li className="">
                            <Link href="/" onClick={() => setNavMenu(!navmenu)}>
                            <div className="inline-block h-[100px] w-[100px] ml-8 mr-10 bg-amber-600 rounded-full shadow-gray-500 text-base text-center text-white leading-[45px] align-bottom">
                                <i className="zmdi zmdi-play zmdi-hc-5x block w-full h-1/2 mt-2 text-center leading-[100px] text-white"/>
                                Now Playing
                            </div>
                            </Link>
                        </li>
                    </ul>
                    <ul className="flex relative justify-center">
                        <li>
                            <Link href="/library"onClick={() => setNavMenu(!navmenu)}>
                            <div className="inline-block h-[100px] w-[100px] ml-8 mr-10 bg-amber-600 rounded-full shadow-gray-500 text-base text-center text-white leading-[45px] align-bottom">
                                <i className="zmdi zmdi-playlist-audio zmdi-hc-5x block text-2xl w-full h-1/2 mt-2 text-center leading-[100px] text-white"/>
                                Library
                            </div>
                            </Link>
                        </li>
                    </ul>
                    <ul className="flex relative justify-center">
                        <li>
                            <Link href="/clock" onClick={() => setNavMenu(!navmenu)}>
                            <div className="inline-block h-[100px] w-[100px] ml-8 mr-10 bg-amber-600 rounded-full shadow-gray-500 text-base text-center text-white leading-[45px] align-bottom">
                                <i className="zmdi zmdi-time zmdi-hc-5x block text-6xl w-full h-1/2 mt-2 text-center leading-[100px] text-white"/>
                                Clock
                            </div>
                            </Link>
                        </li>
                    </ul>
                    <ul className="flex relative justify-center">
                        <li>
                            <Link href="/web_radio"onClick={() => setNavMenu(!navmenu)}>
                                <div className="inline-block h-[100px] w-[100px] ml-8 mr-10 bg-amber-600 rounded-full shadow-gray-500 text-base text-center text-white leading-[45px] align-bottom">
                                    <i className="zmdi zmdi-radio zmdi-hc-5x block text-6xl w-full h-1/2 mt-2 text-center leading-[100px] text-white"/>
                                    Web Radio
                                </div>
                            </Link>
                        </li>
                    </ul>
                    <ul className="flex relative justify-center">
                        <li>
                            <Link href="/vu-meters"onClick={() => setNavMenu(!navmenu)}>
                                <div className="inline-block h-[100px] w-[100px] ml-8 mr-10 bg-amber-600 rounded-full shadow-gray-500 text-base text-center text-white leading-[45px] align-bottom">
                                    <i className="zmdi zmdi-equalizer zmdi-hc-5x block text-6xl w-full h-1/2 mt-2 text-center leading-[100px] text-white"/>
                                    VU-Meters
                                </div>
                            </Link>
                        </li>
                    </ul>
                    <ul className="flex relative justify-center">
                        <li>
                            <Link href="/settings"onClick={() => setNavMenu(!navmenu)}>
                                <div className="inline-block h-[100px] w-[100px] ml-8 mr-10 bg-amber-600 rounded-full shadow-gray-500 text-base text-center text-white leading-[45px] align-bottom">
                                    <i className="zmdi zmdi-settings zmdi-hc-5x block text-6xl w-full h-1/2 mt-2 text-center leading-[100px] text-white"/>
                                    Settings
                                </div>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </section>
            </div>
        </header>
    )
}
