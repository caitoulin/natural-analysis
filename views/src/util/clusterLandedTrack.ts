import { LANDTRACK, TRACKCOOR } from '../middleware/reducer/typhoonInfo';
import { getAllTRacksLanded } from './analysisProcess';
import * as turf from '@turf/turf';
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
            /*             if (isCross(segment, getAllLandedPoints)) {
                pre.push({ [getTfbh]: getAllLandedPoints });
            } */
            pre.push({ [getTfbh]: getAllLandedPoints });
            return pre;
        }, []);
        return { segment, data: verifyTracks };
    });
    return getSegmentTracks;
}

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
    if (turf.booleanDisjoint(line1, line2)) {
        return true;
    } else {
        return false;
    }
}
