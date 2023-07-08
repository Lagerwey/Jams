"use client"
import ClockGetTime, { ClockGetDate } from './clock'
import { Weather } from './weather'
 

export default function Clock() {

    return (
        <main>
            <div className='text-white font-light shadow-xl'>
                <Weather />
                
                <div className='absolute flex w-full top-10 justify-center'>
                    <ClockGetTime />
                </div>
                <div className='font-light'>
                    <ClockGetDate />
                </div>
            </div>
        </main>
    )
}