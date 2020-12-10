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
            if (!storeNames.contains('gridData')) {
                isCreate = true;
                const objectVulner = db.createObjectStore('gridData', {
                    keyPath: 'indexId',
                    autoIncrement: true,
                });
                objectVulner.createIndex('indexId', 'indexId', {
                    unique: false,
                });
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

export function writeGridsDataToSore(data: any) {
    const request = window.indexedDB.open('typhoonLists', 3);
    request.onsuccess = function (event) {
        const db = (event.target as any).result;
        const trans = db.transaction('gridData', 'readwrite');
        const store = trans.objectStore('gridData');
        store.add(data);
        db.close();
    };
    request.onerror = function () {
        console.error('打开数据库失败');
    };
}
/**
 * @param getIndex 数据索引
 */
export async function getIndexGridsData(getIndex: string): Promise<any> {
    const request = window.indexedDB.open('typhoonLists', 3);
    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
            const db = (event.target as any).result;
            const trans = db.transaction('gridData', 'readonly');
            const store = trans.objectStore('gridData');
            const index = store.index('indexId');
            const request = index.get(getIndex);
            request.onsuccess = (e: any) => {
                const result = (e.target as any).result;
                if (result) {
                    resolve(result);
                } else {
                    resolve(0);
                }
            };
            request.onerror = () => {
                reject({ type: 'error' });
            };
            db.close();
        };
    });
}
