import { LANDTRACK, TRACKCOOR } from '../middleware/reducer/typhoonInfo';
import { getAllTRacksLanded } from './analysisProcess';
import * as turf from '@turf/turf';
export interface SEGMENT {
    tfbh: string;
    startIndex: number;
    endIndex: number;
    values: number[][];
}
export interface EACHLINE {
    [key: string]: Array<TRACKCOOR>;
}
/**
 * @param landedCluster 位于不同登陆段上的聚类台风信息
 * @param landedTracks 登陆轨迹
 */

export function getLandedTrackSegment(
    landedCluster: Array<any>,
    landedTracks: Array<LANDTRACK>
) {
    const getLandedTracks = getAllTRacksLanded(landedTracks);
    const flattenLandedTracks = getLandedTracks.reduce((pre, cur) => {
        const { getAllLandedPoints, tfbh, time } = cur;
        pre[tfbh] = { time, getAllLandedPoints };
        return pre;
    }, {});
    const getSegmentTracks = landedCluster.map((item) => {
        const { segment, data } = item;
        const verifyTracks = data.reduce((pre: any, cur: any) => {
            const getTfbh = Object.keys(cur)[0];
            const { getAllLandedPoints } = flattenLandedTracks[getTfbh];
            pre.push({ [getTfbh]: getAllLandedPoints });
            return pre;
        }, []);
        return { segment, data: verifyTracks };
    });
    return getSegmentTracks;
}

/**
 * @param segment 分割段
 * @param getAllLandedPoints 所有的登陆点
 */
function isCross(
    segment: Array<Array<number>>,
    getAllLandedPoints: TRACKCOOR[]
) {
    const getAllCoors = getAllLandedPoints.map((item) => {
        const { coordinate } = item;
        return [+coordinate[0].toFixed(2), +coordinate[1].toFixed(2)];
    });
    const line1 = turf.lineString(segment);
    const line2 = turf.lineString(getAllCoors);
    return turf.booleanDisjoint(line1, line2);
}

function getTwoPointDistance(a: number[], b: number[]) {
    const distance = Math.sqrt(
        Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)
    );
    return distance;
}

function getDistToSegment(start: number[], end: number[], center: number[]) {
    const a = Math.abs(getTwoPointDistance(start, end));
    const b = Math.abs(getTwoPointDistance(start, center));
    const c = Math.abs(getTwoPointDistance(center, end));
    const p = (a + b + c) / 2.0;
    const s = Math.sqrt(Math.abs(p * (p - a) * (p - b) * (p - c)));
    return (s * 2.0) / a;
}

/**
 * 返回压缩点的索引
 * @param {getCoorTrack, start, end, maxDistance } 轨迹点：开始索引、结束索引、分割限制距离
 */
function compressLine({ getCoorTrack, start, end, maxDistance }: any) {
    const result = [];
    if (start < end) {
        let maxDist = 0;
        let currentIndex = 0;
        const startPoint = getCoorTrack[start];
        const endPoint = getCoorTrack[end];
        for (let i = start + 1; i < end; i++) {
            const currentDist = getDistToSegment(
                startPoint,
                endPoint,
                getCoorTrack[i]
            );
            if (currentDist > maxDistance) {
                maxDist = currentDist;
                currentIndex = i;
            }
        }
        if (maxDist > maxDistance) {
            result.push(currentIndex);
            const resultLeft = compressLine({
                getCoorTrack,
                start,
                end: currentIndex,
                maxDistance,
            });
            const resultRight = compressLine({
                getCoorTrack,
                start: currentIndex,
                end,
                maxDistance,
            });
            Array.prototype.push.apply(result, resultLeft);
            Array.prototype.push.apply(result, resultRight);
        }
    }
    return result;
}

/**
 * 获取分割后的轨迹段
 * @param eackTrack 每条轨迹
 */
function trackSplitSegment(eackTrack: number[][], maxDistance: number) {
    const compressIndex = compressLine({
        getCoorTrack: eackTrack,
        start: 0,
        end: eackTrack.length - 1,
        maxDistance,
    });
    Array.prototype.push.call(compressIndex, 0, eackTrack.length - 1);
    compressIndex.sort((a, b) => a - b);
    return compressIndex;
}

export function trackSegmentCluster(allLandedTracks: any) {
    const getSegments: Array<SEGMENT> = allLandedTracks
        .map((item: any) => {
            const tfbh = Object.keys(item)[0];
            const eachTrack: number[][] = item[tfbh].map((item: any) => {
                const { coordinate } = item;
                return [+coordinate[0].toFixed(2), +coordinate[1].toFixed(2)];
            });
            const eachTrackSegments: SEGMENT[] = [];
            const compressIndex = trackSplitSegment(eachTrack, 0.3);
            for (let i = 0; i < compressIndex.length - 1; i++) {
                eachTrackSegments.push({
                    tfbh,
                    startIndex: compressIndex[i],
                    endIndex: compressIndex[i + 1],
                    values: eachTrack.slice(
                        compressIndex[i],
                        compressIndex[i + 1] + 1
                    ),
                });
            }
            return eachTrackSegments;
        })
        .reduce((a: any, b: any) => a.concat(b));
    return getSegments;
}

function retrieveNeighbors(
    eps: number,
    line: SEGMENT,
    cluster: Array<SEGMENT>
) {
    const neighbors = [];
    for (let i = 0; i < cluster.length; i++) {
        if (line === cluster[i]) {
            neighbors.push(i);
            continue;
        }
        const { dist1, angelDistance } = similarDistanceByStrc(
            line,
            cluster[i]
        );
        // const dist = similarDistanceByDistance(line, cluster[i]);
        // 参数 3 0.2 0.08
        if (dist1 <= eps && angelDistance < 0.07) {
            neighbors.push(i);
        }
    }
    return neighbors;
}

export function lineSegDbscan(
    getSegments: Array<SEGMENT>,
    minLins: number,
    eps: number
) {
    let clusterLabel = 0;
    const labels = new Array(getSegments.length).fill(0);
    const clusters = [];
    for (let i = 0; i < getSegments.length; i++) {
        if (labels[i] !== 0) continue;
        const neighbors = retrieveNeighbors(eps, getSegments[i], getSegments);
        if (neighbors.length < minLins) {
            if (labels[i] === 0) {
                labels[i] = 'noise';
            }
        } else {
            clusterLabel += 1;
            const cluster = [];
            for (let j1 = 0; j1 < neighbors.length; j1++) {
                if (
                    labels[neighbors[j1]] === 0 ||
                    labels[neighbors[j1]] === 'noise'
                ) {
                    labels[neighbors[j1]] = clusterLabel;
                    cluster.push(neighbors[j1]);
                }
            }
            while (neighbors.length !== 0) {
                const j2 = neighbors.pop();
                const subNeighbors = retrieveNeighbors(
                    eps,
                    getSegments[j2],
                    getSegments
                );
                if (subNeighbors.length >= minLins) {
                    for (let k = 0; k < subNeighbors.length; k++) {
                        if (
                            labels[subNeighbors[k]] === 0 ||
                            labels[subNeighbors[k]] === 'noise'
                        ) {
                            neighbors.push(subNeighbors[k]);
                            labels[subNeighbors[k]] = clusterLabel;
                            cluster.push(subNeighbors[k]);
                        }
                    }
                }
            }
            if (cluster.length < minLins) {
                for (let j3 = 0; j3 < getSegments.length; j3++) {
                    if (labels[j3] === clusterLabel) {
                        labels[j3] = 'noise';
                    }
                }
            } else {
                clusters.push(cluster);
            }
        }
    }
    return clusters;
}
/**
 * 返回结构相似性
 * @param line1
 * @param line2
 */
function similarDistanceByStrc(line1: SEGMENT, line2: SEGMENT) {
    const segmentOne = [
        line1['values'][0],
        line1['values'][line1['values'].length - 1],
    ];
    const segmentTwo = [
        line2['values'][0],
        line2['values'][line2['values'].length - 1],
    ];
    return getTrackDistance(segmentOne, segmentTwo);
}

/**
 * 得到欧式距离上的相似性
 * @param line1
 * @param line2
 */
function similarDistanceByDistance(line1: SEGMENT, line2: SEGMENT) {
    const segmentOne = [
        line1['values'][0],
        line1['values'][line1['values'].length - 1],
    ];
    const segmentTwo = [
        line2['values'][0],
        line2['values'][line2['values'].length - 1],
    ];
    const distA = getTwoPointDistance(segmentOne[0], segmentTwo[0]);
    const distB = getTwoPointDistance(segmentOne[1], segmentTwo[1]);
    return +Math.sqrt(Math.pow(distA, 2) + Math.pow(distB, 2)).toFixed(2);
}

function getTrackDistance(segmentOne: number[][], segmentTwo: number[][]) {
    const distOne = getTwoPointDistance(segmentOne[0], segmentOne[1]);
    const distTwo = getTwoPointDistance(segmentTwo[0], segmentTwo[1]);
    let getSimilarDistace: any;
    if (distOne < distTwo) {
        getSimilarDistace = getSimilarDist(segmentOne, segmentTwo);
    } else {
        getSimilarDistace = getSimilarDist(segmentTwo, segmentOne);
    }
    return getSimilarDistace;
}

/**
 *  方式1：获取两条线段的夹角
 * @param shortLine 较短的线段
 * @param longLine 较长的线段
 */
function getAngelRad(shortLine: number[][], longLine: number[][]) {
    const dx1 = shortLine[0][0] - shortLine[1][0];
    const dy1 = shortLine[0][1] - shortLine[1][1];
    const dx2 = longLine[0][0] - longLine[1][0];
    const dy2 = longLine[0][1] - longLine[1][1];
    const angel1 = Math.atan2(dy1, dx1);
    const angel2 = Math.atan2(dy2, dx2);
    if (angel1 * angel2 >= 0) {
        return Math.abs(angel1 - angel2);
    } else {
        return Math.abs(angel2) + Math.abs(angel1);
    }
}

function getAngelValue(shortLine: number[][], longLine: number[][]) {
    const dx1 = shortLine[1][0] - shortLine[0][0];
    const dy1 = shortLine[1][1] - shortLine[0][1];
    const dx2 = longLine[1][0] - longLine[0][0];
    const dy2 = longLine[1][1] - longLine[0][1];
    const angel1 = Math.atan2(dy1, dx1);
    const angel2 = Math.atan2(dy2, dx2);
    if (angel1 * angel2 >= 0) {
        return Math.floor((Math.abs(angel1 - angel2) * 180) / Math.PI);
    } else {
        let getAngel = Math.abs(angel2) + Math.abs(angel1);
        if (getAngel > Math.PI / 2) {
            getAngel = 2 * Math.PI - getAngel;
        }
        return (getAngel * 180) / Math.PI;
    }
}

/**
 * 得到两条线段的相似距离
 * @param shortLine 短线段
 * @param longLine 长线段
 */
function getSimilarDist(shortLine: number[][], longLine: number[][]) {
    const verDist1 = getDistToSegment(longLine[0], longLine[1], shortLine[0]);
    const verDist2 = getDistToSegment(longLine[0], longLine[1], shortLine[1]);
    const verticalDistace = (Math.pow(verDist1, 2) + Math.pow(verDist2, 2)) / 2;
    const horiDist1 = Math.sqrt(
        Math.pow(getTwoPointDistance(shortLine[0], longLine[0]), 2) -
            Math.pow(verDist1, 2)
    );
    const horiDist2 = Math.sqrt(
        Math.pow(getTwoPointDistance(shortLine[1], longLine[0]), 2) -
            Math.pow(verDist2, 2)
    );
    const horiDist3 = Math.sqrt(
        Math.pow(getTwoPointDistance(shortLine[0], longLine[1]), 2) -
            Math.pow(verDist1, 2)
    );
    const horiDist4 = Math.sqrt(
        Math.pow(getTwoPointDistance(shortLine[1], longLine[1]), 2) -
            Math.pow(verDist2, 2)
    );
    const getHorizontal = Math.min(horiDist1, horiDist2, horiDist3, horiDist4);
    const angelDistance1 = getTwoPointDistance(shortLine[0], shortLine[1]);
    const angelDistance2 = getTwoPointDistance(longLine[0], longLine[1]);
    let angelDistance;
    const angel = getAngelRad(shortLine, longLine);
    if (angel >= 0 && angel < Math.PI / 2) {
        angelDistance =
            Math.min(angelDistance1, angelDistance2) * Math.sin(angel);
    } else {
        angelDistance = Math.max(angelDistance1, angelDistance2);
    }
    return {
        dist1: +(verticalDistace + getHorizontal).toFixed(2),
        angelDistance,
    };
}
/**
 * 两条线段的相似性，欧式距离
 * @param line1
 * @param line2
 */
function similarDistanceByOSDistance(line1: number[][], line2: number[][]) {
    const distA = getTwoPointDistance(line1[0], line2[0]);
    const distB = getTwoPointDistance(line1[1], line2[1]);
    return +Math.sqrt(Math.pow(distA, 2) + Math.pow(distB, 2)).toFixed(2);
}
/**
 * 计算两条轨迹的相似性
 * @param line1
 * @param line2
 */
function getSimilarByLCSS(line1: number[][], line2: number[][]) {
    if (line1.length === 0 || line2.length === 0) return 0;
    const m = line1.length;
    const n = line2.length;
    const dp: number[][] = [];
    for (let i = 0; i < line1.length; i++) {
        dp[i] = [];
        for (let j = 0; j < line2.length; j++) {
            dp[i][j] = 0;
        }
    }
    for (let i = 1; i < line1.length; i++) {
        for (let j = 1; j < line2.length; j++) {
            if (
                getSimilarByDtw(
                    [line1[i - 1], line1[i]],
                    [line2[j - 1], line2[j]]
                ) < 5
            ) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return +(1 - dp[m - 1][n - 1] / Math.min(m - 1, n - 1)).toFixed(3);
}
function getSimilarByDtw(line1: number[][], line2: number[][]) {
    const n = line1.length,
        m = line2.length;
    const dtw = new Array(n);
    for (let i = 0; i < dtw.length; i++) {
        dtw[i] = new Array(m);
        for (let j = 0; j < dtw[i].length; j++) {
            dtw[i][j] = 0;
        }
    }
    for (let i = 1; i < n; i++) {
        dtw[i][0] = Number.MAX_VALUE;
    }
    for (let j = 1; j < m; j++) {
        dtw[0][j] = Number.MAX_VALUE;
    }
    dtw[0][0] = 0;
    for (let i = 1; i < n; i++) {
        for (let j = 1; j < m; j++) {
            const cost = getTwoPointDistance(line1[i], line2[j]);
            dtw[i][j] =
                cost +
                Math.min(dtw[i - 1][j], dtw[i][j - 1], dtw[i - 1][j - 1]);
        }
    }
    return dtw[n - 1][m - 1];
}

function computeDistance(
    dp: number[][],
    i: number,
    j: number,
    line1: number[][],
    line2: number[][]
) {
    if (dp[i][j] > -1) return dp[i][j];
    if (i === 0 && j === 0) {
        dp[i][j] = getTwoPointDistance(line1[0], line2[0]);
    } else if (i > 0 && j == 0) {
        dp[i][j] = Math.max(
            computeDistance(dp, i - 1, 0, line1, line2),
            getTwoPointDistance(line1[i], line2[0])
        );
    } else if (i == 0 && j > 0) {
        dp[i][j] = Math.max(
            computeDistance(dp, 0, j - 1, line1, line2),
            getTwoPointDistance(line1[0], line2[j])
        );
    } else if (i > 0 && j > 0) {
        dp[i][j] = Math.max(
            Math.min(
                computeDistance(dp, i - 1, j, line1, line2),
                Math.min(
                    computeDistance(dp, i - 1, j - 1, line1, line2),
                    computeDistance(dp, i, j - 1, line1, line2),
                    getTwoPointDistance(line1[i], line2[j])
                )
            )
        );
    } else {
        dp[i][j] = Number.POSITIVE_INFINITY;
    }
    return dp[i][j];
}
function getSimilarByFrechet(line1: number[][], line2: number[][]) {
    const n = line1.length,
        m = line2.length;
    const dp = new Array(n);
    for (let i = 0; i < dp.length; i++) {
        dp[i] = new Array(m);
        for (let j = 0; j < dp[i].length; j++) {
            dp[i][j] = -1;
        }
    }
    return computeDistance(dp, n - 1, m - 1, line1, line2);
}

function lineRetrieveNeighbors(
    eps: number,
    line: EACHLINE,
    cluster: Array<EACHLINE>
) {
    const neighbors = [];
    const line1 = Object.values(line)[0].map((item) => {
        const { coordinate } = item;
        return coordinate;
    });
    for (let i = 0; i < cluster.length; i++) {
        if (line === cluster[i]) {
            neighbors.push(i);
            continue;
        }
        const line2 = Object.values(cluster[i])[0].map((item) => {
            const { coordinate } = item;
            return coordinate;
        });
        const compressIndexline1 = trackSplitSegment(line1, 0.3).map(
            (item) => line1[item]
        );
        const compressIndexline2 = trackSplitSegment(line2, 0.3).map(
            (item) => line2[item]
        );
        // 三种计算相似性的方法
        // const dist = getSimilarByDtw(line1, line2);
        // const dist = frechet(compressIndexline1, compressIndexline2);
        // const dist = getSimilarByFrechet(line1, line2);
        const angel = getAngelValue(
            [line1[0], line1[line1.length - 1]],
            [line2[0], line2[line2.length - 1]]
        );
        const dist = getSimilarByLCSS(compressIndexline1, compressIndexline2);
        if (dist <= eps && angel < 4.5) {
            neighbors.push(i);
        }
    }
    return neighbors;
}

export function allLinesDbscan(
    allLines: Array<EACHLINE>,
    minLins: number,
    eps: number
) {
    let clusterLabel = 0;
    const labels = new Array(allLines.length).fill(0);
    const clusters = [];
    for (let i = 0; i < allLines.length; i++) {
        if (labels[i] !== 0) continue;
        const neighbors = lineRetrieveNeighbors(eps, allLines[i], allLines);
        if (neighbors.length < minLins) {
            if (labels[i] === 0) {
                labels[i] = 'noise';
            }
        } else {
            clusterLabel += 1;
            const cluster = [];
            for (let j1 = 0; j1 < neighbors.length; j1++) {
                if (
                    labels[neighbors[j1]] === 0 ||
                    labels[neighbors[j1]] === 'noise'
                ) {
                    labels[neighbors[j1]] = clusterLabel;
                    cluster.push(neighbors[j1]);
                }
            }
            while (neighbors.length !== 0) {
                const j2 = neighbors.pop();
                const subNeighbors = lineRetrieveNeighbors(
                    eps,
                    allLines[j2],
                    allLines
                );
                if (subNeighbors.length >= minLins) {
                    for (let k = 0; k < subNeighbors.length; k++) {
                        if (
                            labels[subNeighbors[k]] === 0 ||
                            labels[subNeighbors[k]] === 'noise'
                        ) {
                            neighbors.push(subNeighbors[k]);
                            labels[subNeighbors[k]] = clusterLabel;
                            cluster.push(subNeighbors[k]);
                        }
                    }
                }
            }
            if (cluster.length < minLins) {
                for (let j3 = 0; j3 < allLines.length; j3++) {
                    if (labels[j3] === clusterLabel) {
                        labels[j3] = 'noise';
                    }
                }
            } else {
                clusters.push(cluster);
            }
        }
    }
    return clusters;
}

function ssRetrieveNeighbors(
    eps: number,
    line: EACHLINE,
    cluster: Array<EACHLINE>
) {
    const neighbors = [];
    let n = 0;
    let dp = 0;
    const line1 = Object.values(line)[0].map((item) => {
        const { coordinate } = item;
        return coordinate;
    });
    for (let i = 0; i < cluster.length; i++) {
        if (line === cluster[i]) {
            neighbors.push(i);
            continue;
        }
        const line2 = Object.values(cluster[i])[0].map((item) => {
            const { coordinate } = item;
            return coordinate;
        });
        const compressIndexline1 = trackSplitSegment(line1, 0.3).map(
            (item) => line1[item]
        );
        const compressIndexline2 = trackSplitSegment(line2, 0.3).map(
            (item) => line2[item]
        );
        // const dist = getSimilarByDtw(line1, line2);
        // const dist = frechet(compressIndexline1, compressIndexline2);
        // const dist = getSimilarByFrechet(line1, line2);
        const angel = getAngelValue(
            [line1[0], line1[line1.length - 1]],
            [line2[0], line2[line2.length - 1]]
        );
        const dist = getSimilarByLCSS(line1, line2);
        if (dist <= eps) {
            neighbors.push(i);
            if (angel < 2) {
                n++;
            }
        }
    }
    dp = n / neighbors.length;
    return { neighbors, dp };
}

export function ssAllLinesDbscan(
    allLines: Array<EACHLINE>,
    minLins: number,
    eps: number,
    delta: number
) {
    let clusterLabel = 0;
    const labels = new Array(allLines.length).fill(0);
    const clusters = [];
    let currentDp = 0;
    for (let i = 0; i < allLines.length; i++) {
        if (labels[i] !== 0) continue;
        const { neighbors, dp } = ssRetrieveNeighbors(
            eps,
            allLines[i],
            allLines
        );
        if (neighbors.length < minLins) {
            if (labels[i] === 0) {
                labels[i] = 'noise';
            }
        } else {
            clusterLabel += 1;
            const cluster = [];
            currentDp = dp;
            for (let j1 = 0; j1 < neighbors.length; j1++) {
                if (
                    labels[neighbors[j1]] === 0 ||
                    labels[neighbors[j1]] === 'noise'
                ) {
                    labels[neighbors[j1]] = clusterLabel;
                    cluster.push(neighbors[j1]);
                }
            }
            while (neighbors.length !== 0) {
                const j2 = neighbors.pop();
                const { neighbors: subNeighbors, dp } = ssRetrieveNeighbors(
                    eps,
                    allLines[j2],
                    allLines
                );
                if (
                    subNeighbors.length >= minLins &&
                    Math.abs(currentDp - dp) <= delta
                ) {
                    for (let k = 0; k < subNeighbors.length; k++) {
                        if (
                            labels[subNeighbors[k]] === 0 ||
                            labels[subNeighbors[k]] === 'noise'
                        ) {
                            neighbors.push(subNeighbors[k]);
                            labels[subNeighbors[k]] = clusterLabel;
                            cluster.push(subNeighbors[k]);
                        }
                    }
                }
            }
            if (cluster.length < minLins) {
                for (let j3 = 0; j3 < allLines.length; j3++) {
                    if (labels[j3] === clusterLabel) {
                        labels[j3] = 'noise';
                    }
                }
            } else {
                clusters.push(cluster);
            }
        }
    }
    return clusters;
}
