import { getIndexGridsData, writeGridsDataToSore } from './handleIndexDB';
const eachRadius = 105;
const gridWidth = 0.083333333;  // 请求尺度
const topLeftCoor = [73.5570830473, 53.5662499699];
const downRightCoor = [134.773749469, 16.0329167867];
import { Extent } from 'ol/extent';
import Projection from 'ol/proj/Projection';
import { Size } from 'ol/size';
import { getDataIndex } from './netRequets';
const colors = [
    'rgb(48,255,41)',
    'rgb(0,214,86)',
    'rgb(252,249,66)',
    'rgb(255,204,0)',
    'rgb(255,157,0)',
    'rgb(255,77,0)',
    'rgb(245,5,49)',
    'rgb(242,7,199)',
    'rgb(195,7,237)',
    'rgb(136,20,219)',
    'rgb(81,27,196)',
    'rgb(12,28,173)',
];

function getTwoCorone(coordinates: number[][]) {
    let minLat = 90;
    let maxLat = 0;
    let minLng = 180;
    let maxLng = 0;
    if (coordinates.length === 0) {
        debugger;
    }
    coordinates.forEach((item) => {
        if (item[1] >= maxLat) {
            maxLat = item[1];
        }
        if (item[1] < minLat) {
            minLat = item[1];
        }
        if (item[0] >= maxLng) {
            maxLng = item[0];
        }
        if (item[0] < minLng) {
            minLng = item[0];
        }
    });
    if (minLat < downRightCoor[1]) {
        minLat = downRightCoor[1];
    }
    if (maxLat > topLeftCoor[1]) {
        maxLat = topLeftCoor[1];
    }
    if (minLng < topLeftCoor[0]) {
        minLng = topLeftCoor[0];
    }
    if (maxLng > downRightCoor[0]) {
        maxLng = downRightCoor[0];
    }
    return [
        [minLng, maxLat],
        [maxLng, minLat],
    ];
}
function calculateBound(eachLine: EACHLINE) {
    const getPoints = Object.values(eachLine)[0];
    const boundary = getPoints
        .map((each) => {
            const { coordinate, windCircle } = each;
            const circle = windCircle['sevenCicle'];
            if (circle > 0) {
                const leftTopLng = coordinate[0] - circle / eachRadius;
                const leftTopLat = coordinate[1] + circle / eachRadius;
                const rightDownLng = coordinate[0] + circle / eachRadius;
                const rightDownLat = coordinate[1] - circle / eachRadius;
                return [
                    [leftTopLng, leftTopLat],
                    [rightDownLng, rightDownLat],
                ];
            }
            return [];
        })
        .reduce((a, b) => {
            if (b.length === 0) {
                return a;
            } else {
                return a.concat(b);
            }
        }, []);
    if (boundary.length === 0) {
        return [];
    }
    return getTwoCorone(boundary);
}

export function getBoundary(trackInfo: Array<EACHLINE>) {
    const getAllPoints = trackInfo
        .map((eachLine) => {
            return calculateBound(eachLine);
        })
        .reduce((a, b) => a.concat(b));
    const boundary = getTwoCorone(getAllPoints);
    const leftTopX = Math.floor(
        Math.abs(boundary[0][0] - topLeftCoor[0]) / gridWidth
    );
    const leftTopY = Math.floor(
        Math.abs(boundary[0][1] - topLeftCoor[1]) / gridWidth
    );
    const rightDownX = Math.floor(
        Math.abs(boundary[1][0] - topLeftCoor[0]) / gridWidth
    );
    const rightDownY = Math.floor(
        Math.abs(boundary[1][1] - topLeftCoor[1]) / gridWidth
    );
    return {
        boundNum: { leftTopX, leftTopY, rightDownX, rightDownY },
        boundaryLat: boundary,
    };
}

export async function getGrids(getBound: BOUND, url: string) {
    const getData = await getDataIndex(url, getBound);
    return getData['data'];
}

export async function getSplitRequests(bound: BOUND, url: string) {
    const { leftTopX, leftTopY, rightDownX, rightDownY } = bound;
    const width = rightDownX - leftTopX + 1;
    const height = rightDownY - leftTopY + 1;
    const xHeigth = Math.ceil(640000 / width);
    const requestCount = Math.ceil(height / xHeigth);
    const requestArrays = new Array(requestCount).fill(0).map((item, index) => {
        const letfX = +leftTopX;
        const letfY = +leftTopY + index * xHeigth;
        const rightX = rightDownX;
        const tem = +leftTopY + (index + 1) * xHeigth;
        const rightY = tem > 4504 ? 4504 : tem;
        const getBound = {
            leftTopX: letfX,
            leftTopY: letfY,
            rightDownX: rightX,
            rightDownY: rightY,
        };
        return getGrids(getBound, url);
    });
    return Promise.all(requestArrays);
}

export function getAllRequestVGrids(
    bound: BOUND,
    segment: number,
    trendIndex: number
) {
    const Id = trendIndex
        ? segment.toString() + trendIndex.toString()
        : segment.toString();
    const urls = [
        '/get/gdpIndex',
        '/get/popIndex',
        '/get/poiIndex',
        '/get/landIndex',
    ];
    const noStore: any = [];
    const requestArrays = urls.map(async (url, index) => {
        const getIndex = Id + index + 'V';
        const result = await getIndexGridsData(getIndex);
        if (!!result) {
            return getIndexGridsData(getIndex);
        } else {
            noStore.push(index);
            return new Promise((resolve, reject) => {
                getDataIndex(url, bound)
                    .then((value) => {
                        resolve({
                            indexId: getIndex,
                            grids: value['data'],
                        });
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        }
    });
    return [requestArrays, noStore];
}

/**
 * return 栅格脆弱性
 * @param bound
 * @param segment
 * @param trendIndex
 */
// // 定权（POI:0.2002 人口0.3290 土地利用：0.1418 GDP:0.3290)
export async function getVulnerGrids(
    bound: BOUND,
    segment: number,
    trendIndex: number
) {
    const vulner = trendIndex
        ? segment.toString() + trendIndex.toString() + '4' + 'V'
        : segment.toString() + '4' + 'V';
    const vulnerIndex = await getIndexGridsData(vulner);
    if (!!vulnerIndex) return vulnerIndex['grids'];
    const maxPop = 262722.7813;
    const maxGdp = 1998169;
    const getReturnValues: any = getAllRequestVGrids(
        bound,
        segment,
        trendIndex
    );
    const getAllGrids = await Promise.all(getReturnValues[0]);
    getReturnValues[1].forEach((element: any) => {
        writeGridsDataToSore(getAllGrids[element]);
    });
    const n = getAllGrids[0]['grids'].length;
    const m = getAllGrids[0]['grids'][0].length;
    const grids = new Array(n);
    for (let i = 0; i < n; i++) {
        grids[i] = new Array(m);
        for (let j = 0; j < m; j++) {
            const gdpValue = getAllGrids[0]['grids'][i][j]
                ? getAllGrids[0]['grids'][i][j] / maxGdp
                : 0;
            const popValue = getAllGrids[1]['grids'][i][j]
                ? getAllGrids[1]['grids'][i][j] / maxPop
                : 0;
            const poiValue = getAllGrids[2]['grids'][i][j]
                ? getAllGrids[2]['grids'][i][j]
                : 0;
            const luccValue = getLuccValueByWeight(
                getAllGrids[3]['grids'][i][j]
            );
            grids[i][j] =
                0.329 * gdpValue +
                popValue * 0.329 +
                poiValue * 0.2002 +
                0.1418 * luccValue;
        }
    }
    let max = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            if (max < grids[i][j]) {
                max = grids[i][j];
            }
        }
    }
    console.log(max); // 插值计算,计算影响趋势的最大值
    writeGridsDataToSore({ indexId: vulner, grids });
    return grids;
}

/**
 * return 得到登陆趋势上的风险系数
 * @param trackInfo 登陆台风轨迹
 * @param segment 登陆段编号
 * @param trendIndex 登陆趋势编号
 */
export async function getHazardIndex(
    trackInfo: EACHLINE[],
    segment: number,
    trendIndex: number
) {
    const hazard = trendIndex
        ? segment.toString() + trendIndex.toString() + '2' + 'H'
        : segment.toString() + '2' + 'H';
    const hazardIndex = await getIndexGridsData(hazard);
    if (!!hazardIndex) {
        return hazardIndex['grids'];
    } else {
        const times = trendIndex
            ? segment.toString() + trendIndex.toString() + '0' + 'H'
            : segment.toString() + '0' + 'H';
        const wind = trendIndex
            ? segment.toString() + trendIndex.toString() + '1' + 'H'
            : segment.toString() + '1' + 'H';
        const timeIndex = await getIndexGridsData(times);
        const windIndex = await getIndexGridsData(wind);
        const timesGrids = !!timeIndex
            ? timeIndex['grids']
            : getEachHazardGrids(trackInfo, false);
        const windGrids = !!windIndex
            ? windIndex['grids']
            : getEachHazardGrids(trackInfo, true);
        if (!timeIndex) {
            writeGridsDataToSore({ indexId: times, grids: timesGrids });
        }
        if (!windIndex) {
            writeGridsDataToSore({ indexId: wind, grids: windGrids });
        }
        ///加权计算
        const n = windGrids.length;
        const m = windGrids[0].length;
        const grids = new Array(n);
        for (let i = 0; i < n; i++) {
            grids[i] = new Array(m);
            for (let j = 0; j < m; j++) {
                grids[i][j] =
                    (0.6 * windGrids[i][j]) / 3788 +
                    (0.4 * timesGrids[i][j]) / 2394;
            }
        }
        writeGridsDataToSore({ indexId: hazard, grids });
        return grids;
    }
}
export function getEachHazardGrids(trackInfo: EACHLINE[], isWind: boolean) {
    const { boundNum, boundaryLat } = getBoundary(trackInfo);
    const { leftTopX, leftTopY, rightDownX, rightDownY } = boundNum;
    const n = rightDownX - leftTopX + 1;
    const m = rightDownY - leftTopY + 1;
    const grids = new Array(n);
    for (let i = 0; i < n; i++) {
        grids[i] = new Array(m);
        for (let j = 0; j < m; j++) {
            grids[i][j] = 0;
        }
    }
    trackInfo.forEach((eachLine, index) => {
        const getPoints = Object.values(eachLine)[0];
        getPoints.forEach((each) => {
            const {
                coordinate,
                windCircle: { sevenCicle, tenCicle, twelveCicle },
            } = each;
            if (sevenCicle > 0) {
                if (isWind) {
                    getGridValueByCircle(
                        coordinate,
                        sevenCicle,
                        boundaryLat,
                        grids,
                        1,
                        true
                    );
                    return;
                } else {
                    getGridValueByCircle(
                        coordinate,
                        sevenCicle,
                        boundaryLat,
                        grids,
                        1
                    );
                }
            }
            if (tenCicle > 0) {
                getGridValueByCircle(
                    coordinate,
                    tenCicle,
                    boundaryLat,
                    grids,
                    2
                );
            }
            if (twelveCicle > 0) {
                getGridValueByCircle(
                    coordinate,
                    twelveCicle,
                    boundaryLat,
                    grids,
                    3
                );
            }
        });
        for (let i = 0; i < getPoints.length - 1; i++) {
            const getArrayPoints = interpolationPoints(
                getPoints[i],
                getPoints[i + 1]
            );
            getArrayPoints.forEach((item) => {
                const {
                    coordinate,
                    windCircle: { sevenCicle, tenCicle, twelveCicle },
                } = item;
                if (sevenCicle > 0) {
                    if (isWind) {
                        getGridValueByCircle(
                            coordinate,
                            sevenCicle,
                            boundaryLat,
                            grids,
                            1,
                            true
                        );
                        return;
                    } else {
                        getGridValueByCircle(
                            coordinate,
                            sevenCicle,
                            boundaryLat,
                            grids,
                            1
                        );
                    }
                }
                if (tenCicle > 0) {
                    getGridValueByCircle(
                        coordinate,
                        tenCicle,
                        boundaryLat,
                        grids,
                        2
                    );
                }
                if (twelveCicle > 0) {
                    getGridValueByCircle(
                        coordinate,
                        twelveCicle,
                        boundaryLat,
                        grids,
                        3
                    );
                }
            });
        }
    });
    /*    let max = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            if (max < grids[i][j]) {
                max = grids[i][j];
            }
        }
    }
    console.log(max); // 插值计算,计算影响趋势的最大值 */
    return grids;
}

export async function getRiskIndex(
    trackInfo: EACHLINE[],
    segment: number,
    trendIndex: number
) {
    const getIndex = trendIndex
        ? segment.toString() + trendIndex.toString() + 'R'
        : segment.toString() + 'R';
    const riskIndex = await getIndexGridsData(getIndex);
    if (!!riskIndex) {
        return riskIndex['grids'];
    }
    const hazardGrids = await getHazardIndex(trackInfo, segment, trendIndex);
    const { boundNum } = getBoundary(trackInfo);
    const vulnerGrids = await getVulnerGrids(boundNum, segment, trendIndex);
    const n = vulnerGrids.length;
    const m = vulnerGrids[0].length;
    const grids = new Array(n);
    for (let i = 0; i < n; i++) {
        grids[i] = new Array(m);
        for (let j = 0; j < m; j++) {
            grids[i][j] = (hazardGrids[i][j] * vulnerGrids[i][j]) / 0.268974576;
        }
    }
    writeGridsDataToSore({ indexId: getIndex, grids });
    return grids;
}

/**
 * 获取插值后的台风轨迹点及属性
 * @param prePoint 前一个台风点
 * @param curPoint 目前点
 */
function interpolationPoints(prePoint: TRACKCOOR, curPoint: TRACKCOOR) {
    const polatCount = 2;
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
    const getArray = new Array(polatCount).fill('').map((item, index) => {
        const coorX =
            (coorXDeviation[0] * (index + 1)) / (polatCount + 1) +
            prePoint['coordinate'][0];
        const coorY =
            (coorXDeviation[1] * (index + 1)) / (polatCount + 1) +
            prePoint['coordinate'][1];
        const currentSpeed =
            (proDeviation[0] * (index + 1)) / (polatCount + 1) +
            prePoint['currentSpeed'];
        const windCircle = {
            sevenCicle: Math.floor(
                (proDeviation[1] * (index + 1)) / (polatCount + 1) +
                    prePoint['windCircle']['sevenCicle']
            ),
            tenCicle: Math.floor(
                (proDeviation[2] * (index + 1)) / (polatCount + 1) +
                    prePoint['windCircle']['tenCicle']
            ),
            twelveCicle: Math.floor(
                (proDeviation[3] * (index + 1)) / (polatCount + 1) +
                    prePoint['windCircle']['tenCicle']
            ),
        };
        return { coordinate: [coorX, coorY], currentSpeed, windCircle };
    });
    return getArray;
}

/**
 * 通过风圈得到栅格的值
 * @param coordinate 坐标
 * @param circle 风圈半径
 * @param boundaryLat 范围
 * @param grids
 * @param value 权重值
 * @param isWind 是否计算风圈影响力
 */
function getGridValueByCircle(
    coordinate: number[],
    circle: number,
    boundaryLat: number[][],
    grids: number[][],
    value: number,
    isWind?: boolean
) {
    if (circle > 0) {
        let leftTopLng = coordinate[0] - circle / eachRadius;
        let leftTopLat = coordinate[1] + circle / eachRadius;
        let rightDownLng = coordinate[0] + circle / eachRadius;
        let rightDownLat = coordinate[1] - circle / eachRadius;
        if (rightDownLat < downRightCoor[1]) {
            rightDownLat = downRightCoor[1];
        }
        if (leftTopLat > topLeftCoor[1]) {
            leftTopLat = topLeftCoor[1];
        }
        if (leftTopLng < topLeftCoor[0]) {
            leftTopLng = topLeftCoor[0];
        }
        if (rightDownLng > downRightCoor[0]) {
            rightDownLng = downRightCoor[0];
        }
        const leftTopX = Math.floor(
            (leftTopLng - boundaryLat[0][0]) / gridWidth
        );
        const leftTopY = Math.floor(
            (boundaryLat[0][1] - leftTopLat) / gridWidth
        );
        const rightDownX = Math.floor(
            (rightDownLng - boundaryLat[0][0]) / gridWidth
        );
        const rightDownY = Math.floor(
            (boundaryLat[0][1] - rightDownLat) / gridWidth
        );
        if (isWind) {
            for (let i = leftTopX; i < rightDownX; i++) {
                for (let j = leftTopY; j <= rightDownY; j++) {
                    grids[i][j] = grids[i][j] + value;
                }
            }
        } else {
            for (let i = leftTopX; i < rightDownX; i++) {
                for (let j = leftTopY; j <= rightDownY; j++) {
                    grids[i][j] = grids[i][j] + value;
                }
            }
        }
    }
}

export function plotRiskAssessmentGrids(plotData: PLOTGRIDS, index: string) {
    return (
        extent: Extent,
        resolution: number,
        pixelRatio: number,
        size: Size,
        projection: Projection
    ) => {
        const { grids, renderExtent, getGridDataVL } = plotData;
        const gridWidth = 0.083333333; // 更改尺度
        const canvas = document.createElement('canvas');
        canvas.width = size[0];
        canvas.height = size[1];
        canvas.style.display = 'block';
        canvas.getContext('2d').globalAlpha = 0.75;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const range = [extent[2] - extent[0], extent[3] - extent[1]];
        const n = grids.length;
        const m = grids[0].length;
        const wx = Math.ceil((gridWidth * canvas.width) / range[0]);
        const wy = Math.ceil((gridWidth * canvas.height) / range[1]);
        if (!!getGridDataVL) {
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < m; j++) {
                    if (grids[i][j] <= 0 || getGridDataVL[i][j] <= 0) continue;
                    const x =
                        (canvas.width *
                            (i * gridWidth + renderExtent[0][0] - extent[0])) /
                        range[0];
                    const y =
                        (canvas.height *
                            (j * gridWidth + extent[3] - renderExtent[0][1])) /
                        range[1];
                    ctx.fillStyle = getColorByIndex(index, grids[i][j]);
                    ctx.fillRect(x, y, wx, wy);
                }
            }
        } else {
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < m; j++) {
                    if (grids[i][j] <= 0) continue;
                    const x =
                        (canvas.width *
                            (i * gridWidth + renderExtent[0][0] - extent[0])) /
                        range[0];
                    const y =
                        (canvas.height *
                            (j * gridWidth + extent[3] - renderExtent[0][1])) /
                        range[1];
                    ctx.fillStyle = getColorByIndex(index, grids[i][j]);
                    ctx.fillRect(x, y, wx, wy);
                }
            }
        }

        return canvas;
    };
}

/**
 * 根据gdp值得到颜色
 * @param value 栅格GDP值
 */
function getColorByGdp(value: number) {
    if (value < 13) return colors[0];
    if (value < 50) return colors[1];
    if (value < 151) return colors[2];
    if (value < 455) return colors[3];
    if (value < 1308) return colors[4];
    if (value < 3737) return colors[5];
    if (value < 10656) return colors[6];
    if (value < 30363) return colors[7];
    if (value < 86489) return colors[8];
    if (value < 246337) return colors[9];
    if (value < 701590) return colors[10];
    if (value < 1998169) return colors[11];
}
/**
 * 根据人口栅格值得到颜色
 * @param value
 */
function getColorByPop(value: number) {
    if (value < 962) return colors[0];
    if (value < 1437) return colors[1];
    if (value < 1673) return colors[2];
    if (value < 2149) return colors[3];
    if (value < 3112) return colors[4];
    if (value < 5054) return colors[5];
    if (value < 8979) return colors[6];
    if (value < 16906) return colors[7];
    if (value < 32924) return colors[8];
    if (value < 65289) return colors[9];
    if (value < 130656) return colors[10];
    if (value < 262723) return colors[11];
}
/**
 * 根据土地利用类型得到颜色
 * @param value
 */
// 权:耕地（0.3399） 林地（0.0682） 草地（0.1252） 水域（0.0386） 城乡用地（0.4021）未利用（0.0260）

function getColorByLucc(value: number) {
    switch (value) {
        case 11:
            return colors[0];
        case 12:
            return colors[0];
        case 21:
            return colors[1];
        case 22:
            return colors[1];
        case 23:
            return colors[1];
        case 24:
            return colors[1];
        case 31:
            return colors[2];
        case 32:
            return colors[2];
        case 33:
            return colors[2];
        case 41:
            return colors[3];
        case 42:
            return colors[3];
        case 43:
            return colors[3];
        case 44:
            return colors[3];
        case 45:
            return colors[3];
        case 46:
            return colors[3];
        case 51:
            return colors[4];
        case 52:
            return colors[4];
        case 53:
            return colors[4];
        case 61:
            return colors[5];
        case 62:
            return colors[5];
        case 63:
            return colors[5];
        case 64:
            return colors[5];
        case 65:
            return colors[5];
        case 66:
            return colors[5];
        case 67:
            return colors[5];
        case 99:
            return colors[5];
    }
}

/**
 * 根据土地利用的类别量化土地类型的值
 * @param value
 */

function getLuccValueByWeight(value: number) {
    if (!value) return 0;
    if (value <= 12) return 0.3399;
    if (value <= 24) return 0.0682;
    if (value <= 33) return 0.1252;
    if (value <= 46) return 0.0386;
    if (value <= 53) return 0.4021;
    return 0.026;
}

/**
 * 根据POI密度得到颜色
 * @param value
 */

// 定权 文化服务(0.1209) 市政服务(0.0833) 商业服务(0.1004) 卫生服务(0.2447) 政府服务(0.2583) 教育服务(0.1924)

function getColorByPoi(value: number) {
    if (value < 0.003) return colors[0];
    if (value < 0.005) return colors[1];
    if (value < 0.008) return colors[2];
    if (value < 0.014) return colors[3];
    if (value < 0.024) return colors[4];
    if (value < 0.04) return colors[5];
    if (value < 0.07) return colors[6];
    if (value < 0.12) return colors[7];
    if (value < 0.2) return colors[8];
    if (value < 0.35) return colors[9];
    if (value < 0.59) return colors[10];
    return colors[11];
}

/**
 * 根据影像次数获取颜色
 * @param value
 */
function getColorByInfluenceTimes(value: number) {
    if (value < 10) return colors[0];
    if (value < 30) return colors[1];
    if (value < 60) return colors[2];
    if (value < 100) return colors[3];
    if (value < 150) return colors[4];
    if (value < 220) return colors[5];
    if (value < 450) return colors[6];
    if (value < 950) return colors[7];
    if (value < 1400) return colors[8];
    if (value < 1750) return colors[9];
    if (value < 2145) return colors[10];
    return colors[11];
}
/**
 * 根据危险系数获取颜色
 * @param value
 */
function getColorByH(value: number) {
    if (value < 0.025) return colors[0];
    if (value < 0.075) return colors[1];
    if (value < 0.125) return colors[2];
    if (value < 0.185) return colors[3];
    if (value < 0.235) return colors[4];
    if (value < 0.3) return colors[5];
    if (value < 0.415) return colors[6];
    if (value < 0.525) return colors[7];
    if (value < 0.65) return colors[8];
    if (value < 0.75) return colors[9];
    if (value < 0.825) return colors[10];
    return colors[11];
}
/**
 * 根据风圈指数获取颜色
 * @param value
 */
function getColorByWind(value: number) {
    if (value < 10) return colors[0];
    if (value < 30) return colors[1];
    if (value < 60) return colors[2];
    if (value < 100) return colors[3];
    if (value < 200) return colors[4];
    if (value < 320) return colors[5];
    if (value < 560) return colors[6];
    if (value < 900) return colors[7];
    if (value < 1600) return colors[8];
    if (value < 2400) return colors[9];
    if (value < 3150) return colors[10];
    return colors[11];
}

/**
 * 通过脆弱性获取颜色
 * @param value
 */
function getColorByVulnerIndex(value: number) {
    if (value < 0.002) return colors[0];
    if (value < 0.01) return colors[1];
    if (value < 0.02) return colors[2];
    if (value < 0.04) return colors[3];
    if (value < 0.08) return colors[4];
    if (value < 0.1) return colors[5];
    if (value < 0.15) return colors[6];
    if (value < 0.2) return colors[7];
    if (value < 0.25) return colors[8];
    if (value < 0.3) return colors[9];
    if (value < 0.35) return colors[10];
    return colors[11]; // 0.5215
}

function getColorByRisk(value: number) {
    if (value < 0.003) return colors[0];
    if (value < 0.008) return colors[1];
    if (value < 0.015) return colors[2];
    if (value < 0.03) return colors[3];
    if (value < 0.05) return colors[4];
    if (value < 0.08) return colors[5];
    if (value < 0.15) return colors[6];
    if (value < 0.25) return colors[7];
    if (value < 0.4) return colors[8];
    if (value < 0.6) return colors[9];
    if (value < 0.8) return colors[10];
    return colors[11];
}

/**
 * 获取值对应的颜色
 * @param index 点击序号
 * @param value 栅格值
 */
function getColorByIndex(index: string, value: number) {
    switch (index) {
        case 'V0':
            return getColorByGdp(value);
        case 'V1':
            return getColorByPop(value);
        case 'V2':
            return getColorByPoi(value);
        case 'V3':
            return getColorByLucc(value);
        case 'V4':
            return getColorByVulnerIndex(value);
        case 'H0':
            return getColorByInfluenceTimes(value);
        case 'H1':
            return getColorByWind(value);
        case 'H2':
            return getColorByH(value);
        case 'R':
            return getColorByRisk(value)
    }
}
