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
