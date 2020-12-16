import { getIndexGridsData, writeGridsDataToSore } from './handleIndexDB';
const eachRadius = 105;
const gridWidth = 0.0083333333;
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
        '/get/transIndex',
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
// 未编辑完成
export async function getVulnerGrids(
    bound: BOUND,
    segment: number,
    trendIndex: number
) {
    const getReturnValues: any = getAllRequestVGrids(
        bound,
        segment,
        trendIndex
    );
    const getAllGrids = await Promise.all(getReturnValues[0]);
    getReturnValues[1].forEach((element: any) => {
        writeGridsDataToSore(getAllGrids[element]);
    });
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
        /*  let max = 0;
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
        const gridWidth = 0.0083333333;
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
        return canvas;
    };
}

/**
 * 根据gdp值得到颜色
 * @param value 栅格GDP值
 */
function getColorByGdp(value: number) {
    if (value < 761) return colors[0];
    if (value < 2653) return colors[1];
    if (value < 6203) return colors[2];
    if (value < 12709) return colors[3];
    if (value < 24387) return colors[4];
    if (value < 42933) return colors[5];
    if (value < 78778) return colors[6];
    if (value < 138675) return colors[7];
    if (value < 242375) return colors[8];
    if (value < 437625) return colors[9];
    if (value < 766279) return colors[10];
    if (value < 1998169) return colors[11];
}
/**
 * 根据人口栅格值得到颜色
 * @param value
 */
function getColorByPop(value: number) {
    if (value < 1030) return colors[0];
    if (value < 5151) return colors[1];
    if (value < 10302) return colors[2];
    if (value < 17514) return colors[3];
    if (value < 25757) return colors[4];
    if (value < 35029) return colors[5];
    if (value < 46362) return colors[6];
    if (value < 59756) return colors[7];
    if (value < 78301) return colors[8];
    if (value < 101998) return colors[9];
    if (value < 138058) return colors[10];
    if (value < 262723) return colors[11];
}
/**
 * 根据土地利用类型得到颜色
 * @param value
 */
function getColorByLucc(value: number) {
    switch (value) {
        case 11:
            return 'rgb(240,72,184)';
        case 12:
            return 'rgb(242,214,53)';
        case 21:
            return 'rgb(29,186,207)';
        case 22:
            return 'rgb(16,9,227)';
        case 23:
            return 'rgb(40,232,30)';
        case 24:
            return 'rgb(247,27,38)';
        case 31:
            return 'rgb(6,41,112)';
        case 32:
            return 'rgb(36,79,5)';
        case 33:
            return 'rgb(245,183,179)';
        case 41:
            return 'rgb(107,43,11)';
        case 42:
            return 'rgb(163,235,145)';
        case 43:
            return 'rgb(151,154,230)';
        case 44:
            return 'rgb(198,37,247)';
        case 45:
            return 'rgb(87,7,71)';
        case 46:
            return 'rgb(37,250,133)';
        case 51:
            return 'rgb(22,148,93)';
        case 52:
            return 'rgb(250,102,110)';
        case 53:
            return 'rgb(230,133,64)';
        case 61:
            return 'rgb(66,47,189)';
        case 62:
            return 'rgb(153,138,52)';
        case 63:
            return 'rgb(126,171,31)';
        case 64:
            return 'rgb(213,247,221)';
        case 65:
            return 'rgb(156,98,130)';
        case 66:
            return 'rgb(190,111,242)';
        case 67:
            return 'rgb(138,14,43)';
        case 99:
            return 'rgb(0,0,0)';
    }
}
/**
 * 根据交通类型得到颜色
 * @param value
 */
function getColorByTrans(value: number) {
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
 * 根据POI密度得到颜色
 * @param value
 */
function getColorByPoi(value: number) {
    // 行政管理单位,警察局、政府、法院
    if (value <= 2014) return 'rgb(240,72,184)';
    // 教育 幼儿 学校
    if (value <= 2084 && value >= 2082) return 'rgb(242,214,53)';
    // 医疗卫生 医院诊所
    if (value <= 2129 && value >= 2110) return 'rgb(240,72,184)';
    // 文化体育 公园、剧院
    if ((value >= 2201 && value <= 2258) || (value >= 2701 && value <= 2744))
        return 'rgb(29,186,207)';
    // 商业服务
    if (value >= 2301 && value <= 2601) return 'rgb(245,183,179)';
    // 市政公用
    if (value >= 2901 || [2015, 2030, 2031].includes(value))
        return 'rgb(230,133,64)';
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
 * 根据风趣指数获取颜色
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
            return getColorByTrans(value);
        case 'V5':
            return 'rgb(255,0,0)';
        case 'H0':
            return getColorByInfluenceTimes(value);
        case 'H1':
            return getColorByWind(value);
        case 'H2':
            return getColorByH(value);
    }
}