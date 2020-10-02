import { version } from 'react';

interface PropretyDb {
    name: string;
    version?: number;
}
interface Coordinate {
    Lat: number;
    Lng: number;
}
interface EachPoint {
    time: string;
    position: Coordinate;
    pressure: string;
    currentSpeed: string;
    windCircle: any;
}
interface EachTyphoon {
    tfbh: number;
    tfdl: number;
    maxstrong: string;
    maxp: number;
    maxfspeed: number;
    maxmovespeed: number;
    isornotty: number;
    listInfo: Array<EachPoint>;
}
const createDb: PropretyDb = {
    name: 'typhoonLists',
    version: 1,
};
export function storeTyphoonData(typhoonLists: Array<EachTyphoon>): void {
    const request = window.indexedDB.open(createDb[name], 1);
    request.onupgradeneeded = function (event) {
        const db = (event.target as any).result;
        const storeNames = db.objectStoreNames;
        if (!storeNames.contains('typhoon')) {
            db.createObjectStore('typhoon', {
                keyPath: 'tfbh',
                autoIncrement: true,
            });
        }
    };
    request.onsuccess = function (event) {
        const db = (event.target as any).result;
        const trans = db.transaction(['typhoon', 'readwrite']);
        const store = trans.objectStore('typhoon');
        typhoonLists.forEach((item) => {
            store.add(item);
        });
        db.close();
    };
    request.onerror = function (event) {
        console.error('打开数据库失败');
    };
}

export async function getTyphoonData(): Promise<Array<EachTyphoon>> {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(createDb[name], 1);
        request.onsuccess = (event) => {
            const db = (event.target as any).result;
            const trans = db.transaction(['typhoon', 'readonly']);
            const store = trans.objectStore('typhoon');
            resolve(store.getAll());
            db.close();
        };
        request.onerror = (event) => {
            reject({ type: 'error' });
        };
    });
}

export async function isExistTyphoonList(): Promise<number> {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(createDb[name], 1);
        request.onsuccess = (event) => {
            const db = (event.target as any).result;
            const storeNames = db.objectStoreNames;
            if (!storeNames.contains('typhoon')) {
                resolve(0);
            } else {
                resolve(1);
            }
            db.close();
        };
        request.onerror = (event) => {
            reject({ type: 'error' });
        };
    });
}
