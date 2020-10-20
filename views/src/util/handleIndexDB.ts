interface Coordinate {
    Lat: number;
    Lng: number;
}
export interface EachPoint {
    time: string;
    positon: Coordinate;
    pressure?: string;
    currentSpeed: string;
    windCircle: any;
}
export interface EachTyphoon {
    tfbh: string;
    tfdl: number;
    maxstrong: string;
    maxp: number;
    maxfspeed: number;
    maxmovespeed: number;
    isornotty: number;
    listInfo: Array<EachPoint>;
}
export function storeTyphoonData(typhoonLists: Array<EachTyphoon>): void {
    const request = window.indexedDB.open('typhoonLists', 3);
    request.onsuccess = function (event) {
        const db = (event.target as any).result;
        const trans = db.transaction('typhoon', 'readwrite');
        const store = trans.objectStore('typhoon');
        typhoonLists.forEach((item) => {
            store.add(item);
        });
        db.close();
    };
    request.onerror = function () {
        console.error('打开数据库失败');
    };
}

export async function getTyphoonData(): Promise<Array<EachTyphoon>> {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open('typhoonLists', 3);
        request.onsuccess = (event) => {
            const db = (event.target as any).result;
            const trans = db.transaction('typhoon', 'readonly');
            const storeData = trans.objectStore('typhoon').getAll();
            storeData.onsuccess = function () {
                resolve(storeData.result);
            };
            db.close();
        };
        request.onerror = () => {
            reject({ type: 'error' });
        };
    });
}

export async function isExistTyphoonList(): Promise<number> {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open('typhoonLists', 3);
        let isCreate = false;
        request.onupgradeneeded = function (event) {
            const db = (event.target as any).result;
            const storeNames = db.objectStoreNames;
            if (!storeNames.contains('typhoon')) {
                isCreate = true;
                db.createObjectStore('typhoon', {
                    keyPath: 'tfbh',
                    autoIncrement: true,
                });
                resolve(0);
            }
        };
        request.onsuccess = (event) => {
            const db = (event.target as any).result;
            const storeNames = db.objectStoreNames;
            if (storeNames.contains('typhoon') && !isCreate) {
                resolve(1);
            }
        };
        request.onerror = () => {
            reject({ type: 'error' });
        };
    });
}
