"use client"
import Link from "next/link"
import "./zmdi/css/material-design-iconic-font.css"
import { useState } from "react"


export function NavMenu() {
    const [navmenu, setNavMenu] = useState(false);

    return (
        <header className="bg-black">
            <section className="inline-block w-full text-right z-[8] text-white text-6xl ">
                <button title="menu button" className="h-full" onClick={() => setNavMenu(!navmenu)}>
                    {navmenu && <i className="relative z-[1] mr-4 zmdi zmdi-apps"/>}
                    {!navmenu && <i className="relative z-10 mr-4 zmdi zmdi-apps"/>}
                </button>
            </section>
            
            <section className={navmenu ? "absolute top-0 origin-top z-[9] bg-gray-900 h-full w-full animate-open-menu" : 
                                          "absolute top-0 origin-top z-[9] bg-gray-900 h-full w-full animate-close-menu"}>
                <button title="close button" className="w-full text-right z-[9] text-white text-6xl" onClick={() => setNavMenu(!navmenu)}>
                    <i className="relative z-[9] mr-4 zmdi zmdi-close"></i>
                </button>
                <nav className="navbar gap-5 mt-20 grid grid-cols-3 text-2xl text-white h-full w-full">
                    <ul>
                        <li>
                            <Link href="/" onClick={() => setNavMenu(!navmenu)}>
                            <div className="inline-block h-[100px] w-[100px] ml-8 mr-20 bg-amber-600 rounded-full shadow-gray-500 text-base text-center text-white leading-[45px] align-bottom">
                                <i className="zmdi zmdi-play block text-6xl text-center leading-[100px] text-white"/>
                                Now Playing
                            </div>
                            </Link>
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <Link href="/library"onClick={() => setNavMenu(!navmenu)}>
                            <div className="inline-block h-[100px] w-[100px] ml-8 mr-20 bg-amber-600 rounded-full shadow-gray-500 text-base text-center text-white leading-[45px] align-bottom">
                                <i className="zmdi zmdi-playlist-audio block text-6xl text-center leading-[100px] text-white"/>
                                Library
                            </div>
                            </Link>
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <Link href="/clock" onClick={() => setNavMenu(!navmenu)}>
                            <div className="inline-block h-[100px] w-[100px] ml-8 mr-20 bg-amber-600 rounded-full shadow-gray-500 text-base text-center text-white leading-[45px] align-bottom">
                                <i className="zmdi zmdi-time block text-6xl text-center leading-[100px] text-white"/>
                                Clock
                            </div>
                            </Link>
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <Link href="/web_radio"onClick={() => setNavMenu(!navmenu)}>
                                <div className="inline-block h-[100px] w-[100px] ml-8 mr-20 bg-amber-600 rounded-full shadow-gray-500 text-base text-center text-white leading-[45px] align-bottom">
                                    <i className="zmdi zmdi-radio block text-6xl text-center leading-[100px] text-white"/>
                                    Web Radio
                                </div>
                            </Link>
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <Link href="/vu-meters"onClick={() => setNavMenu(!navmenu)}>
                                <div className="inline-block h-[100px] w-[100px] ml-8 mr-20 bg-amber-600 rounded-full shadow-gray-500 text-base text-center text-white leading-[45px] align-bottom">
                                    <i className="zmdi zmdi-equalizer block text-6xl text-center leading-[100px] text-white"/>
                                    VU-Meters
                                </div>
                            </Link>
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <Link href="/settings"onClick={() => setNavMenu(!navmenu)}>
                                <div className="inline-block h-[100px] w-[100px] ml-8 mr-20 bg-amber-600 rounded-full shadow-gray-500 text-base text-center text-white leading-[45px] align-bottom">
                                    <i className="zmdi zmdi-settings block text-6xl text-center leading-[100px] text-white"/>
                                    Settings
                                </div>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </section>
        </header>
    )
}
