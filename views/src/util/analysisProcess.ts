import { EachPoint } from './handleIndexDB';
import { TRACKCOOR, LANDTRACK } from '../middleware/reducer/typhoonInfo';
export interface WINDCIRCLE {
    sevenCicle: number;
    tenCicle: number;
    twelveCicle: number;
}
function getMaxWindRadiusBySpeed(currentSpeed: number): number {
    if (currentSpeed >= 14 && currentSpeed < 17.2) return 171;
    if (currentSpeed >= 17.2 && currentSpeed < 20.7) return 186;
    if (currentSpeed >= 20.7 && currentSpeed < 24.4) return 210;
    if (currentSpeed >= 24.4 && currentSpeed < 28.4) return 229;
    if (currentSpeed >= 28.4 && currentSpeed < 32.6) return 243;
    if (currentSpeed >= 32.6 && currentSpeed < 36.9) return 265;
    if (currentSpeed >= 36.9 && currentSpeed < 41.4) return 292;
    if (currentSpeed >= 41.4 && currentSpeed < 46.1) return 311;
    if (currentSpeed >= 46.1 && currentSpeed < 50.9) return 336;
    if (currentSpeed >= 50.9 && currentSpeed < 55.9) return 366;
    if (currentSpeed >= 55.9 && currentSpeed < 60.9) return 386;
    if (currentSpeed >= 60.9) return 410;
    return 0;
}
function getSecondWindRadiusBySpeed(currentSpeed: number): number {
    if (currentSpeed >= 24.4 && currentSpeed < 28.4) return 54;
    if (currentSpeed >= 28.4 && currentSpeed < 32.6) return 68;
    if (currentSpeed >= 32.6 && currentSpeed < 36.9) return 94;
    if (currentSpeed >= 36.9 && currentSpeed < 41.4) return 111;
    if (currentSpeed >= 41.4 && currentSpeed < 46.1) return 126;
    if (currentSpeed >= 46.1 && currentSpeed < 50.9) return 140;
    if (currentSpeed >= 50.9 && currentSpeed < 55.9) return 166;
    if (currentSpeed >= 55.9 && currentSpeed < 60.9) return 186;
    if (currentSpeed >= 60.9) return 209;
    return 0;
}
function getThirdWindRadiusBySpeed(currentSpeed: number): number {
    if (currentSpeed >= 32.6 && currentSpeed < 36.9) return 41;
    if (currentSpeed >= 36.9 && currentSpeed < 41.4) return 50;
    if (currentSpeed >= 41.4 && currentSpeed < 46.1) return 63;
    if (currentSpeed >= 46.1 && currentSpeed < 50.9) return 70;
    if (currentSpeed >= 50.9 && currentSpeed < 55.9) return 83;
    if (currentSpeed >= 55.9 && currentSpeed < 60.9) return 96;
    if (currentSpeed >= 60.9) return 110;
    return 0;
}

/**
 * @param typhoonPoint 台风点
 * 得到7级风圈半径
 */
export function getWindMaxRadius(typhoonPoint: EachPoint): number {
    if (typhoonPoint['windCircle'].length === 0) {
        return getMaxWindRadiusBySpeed(+typhoonPoint['currentSpeed']);
    } else {
        const getRankSeven: Array<number> = typhoonPoint['windCircle'][0]
            .slice(1, 5)
            .map((item: any) => +item);
        return Math.max(...getRankSeven);
    }
}

export function getRankWindCircle(typhoonPoint: EachPoint): WINDCIRCLE {
    if (typhoonPoint['windCircle'].length === 0) {
        return {
            sevenCicle: getMaxWindRadiusBySpeed(+typhoonPoint['currentSpeed']),
            tenCicle: getSecondWindRadiusBySpeed(+typhoonPoint['currentSpeed']),
            twelveCicle: getThirdWindRadiusBySpeed(
                +typhoonPoint['currentSpeed']
            ),
        };
    } else {
        const getValue: Array<number> = typhoonPoint['windCircle'].map(
            (item: any) => {
                const getCircleValue: Array<number> = item
                    .slice(1, 5)
                    .map((value: any) => +value);
                return Math.max(...getCircleValue);
            }
        );
        return {
            sevenCicle: getValue[0],
            tenCicle: getValue.length > 1 ? getValue[1] : 0,
            twelveCicle: getValue.length > 2 ? getValue[2] : 0,
        };
    }
}

export function getSpatialDistance(
    landedPosition: Array<number>,
    eachTrackPoint: TRACKCOOR
) {
    return Math.sqrt(
        Math.pow(landedPosition[0] - eachTrackPoint['coordinate'][0], 2) +
            Math.pow(landedPosition[1] - eachTrackPoint['coordinate'][1], 2)
    );
}

export function getInterpolationPoints(
    prePoint: TRACKCOOR,
    curPoint: TRACKCOOR
): Array<TRACKCOOR> {
    const n = 2;
    const coorXDeviation = [
        curPoint['coordinate'][0] - prePoint['coordinate'][0],
        curPoint['coordinate'][1] - prePoint['coordinate'][1],
    ];
    const proDeviation = [
        curPoint['currentSpeed'] - prePoint['currentSpeed'],
        curPoint['windCircle']['sevenCicle'] -
            prePoint['windCircle']['sevenCicle'],
        curPoint['windCircle']['tenCicle'] - prePoint['windCircle']['tenCicle'],
        curPoint['windCircle']['twelveCicle'] -
            prePoint['windCircle']['twelveCicle'],
    ];
    const getArray = new Array(n).fill('').map((item, index) => {
        const coorX =
            (coorXDeviation[0] * (index + 1)) / (n + 1) +
            prePoint['coordinate'][0];
        const coorY =
            (coorXDeviation[1] * (index + 1)) / (n + 1) +
            prePoint['coordinate'][1];
        const currentSpeed =
            (proDeviation[0] * (index + 1)) / (n + 1) +
            prePoint['currentSpeed'];
        const windCircle = {
            sevenCicle:
                (proDeviation[1] * (index + 1)) / (n + 1) +
                prePoint['windCircle']['sevenCicle'],
            tenCicle:
                (proDeviation[2] * (index + 1)) / (n + 1) +
                prePoint['windCircle']['tenCicle'],
            twelveCicle:
                (proDeviation[3] * (index + 1)) / (n + 1) +
                prePoint['windCircle']['tenCicle'],
        };
        return { coordinate: [coorX, coorY], currentSpeed, windCircle };
    });
    return getArray;
}

export function getColor(value: number) {
    const colors = [
        '#006837',
        '#1a9850',
        '#66bd63',
        '#a6d96a',
        '#d9ef8b',
        '#ffffbf',
        '#fee08b',
        '#fdae61',
        '#f46d43',
        '#d73027',
        '#a50026',
    ];
    if (value <= 20) return colors[0];
    if (value <= 90) return colors[1];
    if (value <= 200) return colors[2];
    if (value <= 400) return colors[3];
    if (value <= 700) return colors[4];
    if (value <= 1100) return colors[5];
    if (value <= 1600) return colors[6];
    if (value <= 2000) return colors[7];
    if (value <= 2500) return colors[8];
    if (value <= 3000) return colors[9];
    return colors[10];
}

function getNeareastIndex(eachTrack: LANDTRACK) {
    const { landedPosition, track } = eachTrack;
    const getMinDistancePoint = track.reduce(
        (pre, cur, index) => {
            const preDistance = getSpatialDistance(landedPosition, pre['val']);
            const curDistance = getSpatialDistance(landedPosition, cur);
            if (curDistance < preDistance) {
                pre['val'] = cur;
                pre['index'] = index;
            }
            return pre;
        },
        { val: track[0], index: 0 }
    );
    return getMinDistancePoint['index'];
}

/**
 * @param landedTracks 登陆的台风轨迹
 * return 截取并插值每条轨迹登陆后的所有轨迹点
 */
export function getInterplotTRacksLanded(landedTracks: Array<LANDTRACK>) {
    const getrAllLandedData = landedTracks.map((item) => {
        const { track, tfbh, time } = item;
        const nearestIndex = getNeareastIndex(item);
        const getAllLandedPoints = [];
        for (let i = nearestIndex - 1; i < track.length - 1; i++) {
            if (track[i]['windCircle']['sevenCicle'] !== 0)
                getAllLandedPoints.push(track[i]);
            if (
                track[i]['windCircle']['sevenCicle'] !== 0 ||
                track[i + 1]['windCircle']['sevenCicle'] !== 0
            ) {
                const interploatPoints = getInterpolationPoints(
                    track[i],
                    track[i + 1]
                );
                getAllLandedPoints.push(...interploatPoints);
            }
        }
        if (track[track.length - 1]['windCircle']['sevenCicle'] !== 0)
            getAllLandedPoints.push(track[track.length - 1]);
        return { tfbh, time, getAllLandedPoints };
    });
    return getrAllLandedData;
}

/**
 *
 * @param landedTracks  台风登陆的轨迹
 *  获取未插值且登陆后的轨迹点
 */

export function getAllTRacksLanded(landedTracks: Array<LANDTRACK>) {
    const getAllLandedData = landedTracks.map((item) => {
        const { track, tfbh, time } = item;
        const nearestIndex = getNeareastIndex(item);
        const getAllLandedPoints = track.slice(nearestIndex - 1);
        return { tfbh, time, getAllLandedPoints };
    });
    return getAllLandedData;
}

export function getCircleRadius(length: number) {
    if (length < 10) return 2;
    if (length < 30) return 5;
    if (length < 100) return 8;
    if (length < 200) return 12;
    if (length < 400) return 16;
    if (length < 600) return 20;
    if (length < 800) return 24;
    if (length < 1000) return 30;
}

export function getRotation(start: number[], end: number[]) {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const rotation = Math.atan2(dy, dx);
    return rotation;
}

export function caclcuCenter(start: number[], end: number[]) {
    const x = (end[0] + start[0]) / 2;
    const y = (end[1] + start[1]) / 2;
    return [+x.toFixed(2), +y.toFixed(2)];
}

/**
 * @param count 在各登陆段上登陆的台风数量
 */
export function getLineWidth(count: any) {
    if (count < 5) return 1;
    if (count < 15) return 2;
    if (count < 30) return 4;
    if (count < 50) return 6;
    if (count < 70) return 8;
    return 10;
}
/**
 * @param flattenLandCluster 登陆段上的台风登陆信息
 * @param tfbh 台风编号
 */
export function chooseClusterIndex(flattenLandCluster: any, tfbh: string) {
    for (let i = 0; i < flattenLandCluster.length; i++) {
        const getKeys = Object.keys(flattenLandCluster[i]);
        if (getKeys.includes(tfbh)) {
            return [i.toString(), tfbh];
        }
    }
}

function getValueColor(value: number) {
    const colors = [
        '#006837',
        '#1a9850',
        '#66bd63',
        '#a6d96a',
        '#d9ef8b',
        '#ffffbf',
        '#fee08b',
        '#fdae61',
        '#f46d43',
        '#d73027',
        '#a50026',
    ];
    if (value < 100) return colors[0];
    if (value < 500) return colors[1];
    if (value < 1500) return colors[2];
    if (value < 2500) return colors[3];
    if (value < 3500) return colors[4];
    if (value < 4500) return colors[5];
    if (value < 5500) return colors[6];
    if (value < 6500) return colors[7];
    if (value < 8500) return colors[8];
    if (value < 10500) return colors[9];
    return colors[10];
}
export function plotGrids(
    canvas: any,
    grids: number[][],
    renderExtent: number[][],
    grid: number[],
    xlim: number[],
    ylim: number[]
) {
    const gridWidth = grid[0];
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const range = [xlim[1] - xlim[0], ylim[1] - ylim[0]];
    const n = grids.length;
    const m = grids[0].length;
    const wx = Math.ceil((gridWidth * canvas.width) / (xlim[1] - xlim[0]));
    const wy = Math.ceil((gridWidth * canvas.height) / (ylim[1] - ylim[0]));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            if (grids[i][j] === 0) continue;
            const x =
                (canvas.width *
                    (i * gridWidth + renderExtent[0][0] - xlim[0])) /
                range[0];
            const y =
                canvas.height *
                (1 - (j * gridWidth + renderExtent[0][1] - ylim[0]) / range[1]);
            ctx.fillStyle = getValueColor(grids[i][j]);
            ctx.fillRect(
                Math.round(x - wx / 2),
                Math.round(y - wy / 2),
                wx,
                wy
            );
        }
    }
}
