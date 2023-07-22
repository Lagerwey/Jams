import { GetVal, StoreVal } from "./LocalStorage";


export const DefaultSettings = () => {
 
    if (GetVal('settings_clock_ClockType') === '-1') {
        StoreVal('settings_clock_ClockType', '0');
        StoreVal('settings_clock_ClockBgSel', 'color');
        StoreVal('settings_clock_ClockShowDate', 'false');
        StoreVal('settings_clock_ClockBgColor', "#000000");
        StoreVal('settings_NP_zoneID', "");
        StoreVal('settings_NP_displayName', "");
        StoreVal('settings_NP_theme', "");
    }

}