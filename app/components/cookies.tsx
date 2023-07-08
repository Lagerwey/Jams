import { getCookie, setCookie } from 'cookies-next'

export function readCookie(name: string) {
    return String(getCookie(name));
}
  
export function writeCookie(name: string, value: string) {
    setCookie(name, value);
}