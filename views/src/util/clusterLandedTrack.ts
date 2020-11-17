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
    return +distance.toFixed(2);
}

function getDistToSegment(start: number[], end: number[], center: number[]) {
    const a = Math.abs(getTwoPointDistance(start, end));
    const b = Math.abs(getTwoPointDistance(start, center));
    const c = Math.abs(getTwoPointDistance(center, end));
    const p = (a + b + c) / 2.0;
    const s = Math.sqrt(Math.abs(p * (p - a) * (p - b) * (p - c)));
    return +((s * 2.0) / a).toFixed(2);
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
                getCoorTrack: getCoorTrack.slice(start, currentIndex + 1),
                result,
                start,
                end: currentIndex,
                maxDistance,
            });
            const resultRight = compressLine({
                getCoorTrack: getCoorTrack.slice(currentIndex, end + 1),
                result,
                start,
                end: currentIndex,
                maxDistance,
            });
            result.concat(resultLeft, resultRight);
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
                return coordinate;
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
}
