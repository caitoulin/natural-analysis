interface TRACKCOOR {
    coordinate: Array<number>;
    windCircle: WINDCIRCLE;
    currentSpeed: number;
}
interface EACHLINE {
    [key: string]: Array<TRACKCOOR>;
}
interface WINDCIRCLE {
    sevenCicle: number;
    tenCicle: number;
    twelveCicle: number;
}
interface BOUNDARY {
    leftTop: Array<number>;
    rightDown: Array<number>;
}

interface BOUND {
    leftTopX: number;
    leftTopY: number;
    rightDownX: number;
    rightDownY: number;
}

interface VData {
    indexId: string;
    grids: number[][];
}

interface PLOTGRIDS {
    grids: number[][];
    renderExtent: number[][];
    getGridDataVL?: number[][];
}
interface EachPoint {
    time: string;
    positon: Coordinate;
    pressure?: string;
    currentSpeed: string;
    windCircle: any;
}
interface EachTyphoon {
    tfbh: string;
    tfdl: number;
    maxstrong: string;
    maxp: number;
    maxfspeed: number;
    maxmovespeed: number;
    isornotty: number;
    listInfo: Array<EachPoint>;
}
interface Coordinate {
    Lat: number;
    Lng: number;
}
interface GridIndex {
    total?: number;
    [key: string]: number;
}
interface Grid {
    [key: string]: GridIndex;
}
