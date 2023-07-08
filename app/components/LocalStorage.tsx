"use client"

export function StoreVal(key: string, value: any) {
    window.localStorage.setItem(key, JSON.stringify(value));
    return;
}

export function GetVal(key: string) {
    const stored = window.localStorage.getItem(key);
    return String(stored ? JSON.parse(stored) : '-1');
}
