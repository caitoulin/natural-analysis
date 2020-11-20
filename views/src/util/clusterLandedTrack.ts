import { LANDTRACK, TRACKCOOR } from '../middleware/reducer/typhoonInfo';
import { getAllTRacksLanded } from './analysisProcess';
import * as turf from '@turf/turf';

interface SEGMENT {
    tfbh: string;
    startIndex: number;
    endIndex: number;
    values: number[][];
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
            const compressIndex = trackSplitSegment(eachTrack, 0.5);
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
        const dist = similarDistanceByStrc(line, cluster[i]);
        // const dist = similarDistanceByDistance(line, cluster[i]);
        if (dist <= eps) {
            neighbors.push(i);
        }
    }
    return neighbors;
}

export function lineDbscan(
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
    let getSimilarDistace: number;
    if (distOne < distTwo) {
        getSimilarDistace = getSimilarDist(segmentOne, segmentTwo);
    } else {
        getSimilarDistace = getSimilarDist(segmentTwo, segmentOne);
    }
    return getSimilarDistace;
}

/**
 *  获取两条线段的夹角
 * @param shortLine 较短的线段
 * @param longLine 较长的线段
 */
function getAngel(shortLine: number[][], longLine: number[][]) {
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
/**
 * 得到两条线段的相似距离
 * @param shortLine 短线段
 * @param longLine 长线段
 */
function getSimilarDist(shortLine: number[][], longLine: number[][]) {
    const verDist1 = getDistToSegment(longLine[0], longLine[1], shortLine[0]);
    const verDist2 = getDistToSegment(longLine[0], longLine[1], shortLine[1]);
    const verticalDistace =
        (Math.pow(verDist1, 2) + Math.pow(verDist2, 2)) / (verDist1 + verDist2);
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
    let angelDistance = getTwoPointDistance(shortLine[0], shortLine[1]);
    const angel = getAngel(shortLine, longLine);
    if (angel >= 0 && angel < Math.PI / 2) {
        angelDistance = angelDistance * Math.sin(angel);
    }
    return +(verticalDistace + getHorizontal + angelDistance).toFixed(2);
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
    const dp = new Array(m);
    for (let i = 0; i < line1.length; i++) {
        const inital = [];
        for (let j = 0; j < line2.length; j++) {
            inital[j] = 0;
        }
        dp[i].push(inital);
    }
    for (let i = 1; i < line1.length; i++) {
        for (let j = 1; j < line2.length; j++) {
            if (
                getTrackDistance(
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
