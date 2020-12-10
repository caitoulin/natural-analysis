import {
    GETLANDEDORIGIN,
    TYPHOONLIST,
    LANDEDCLUSTER,
    ORIGINCLUSTER,
    LANDEDTRACK,
    TRENDINFO,
} from './types';
import { EachTyphoon } from '../../util/handleIndexDB';
import { getRankWindCircle } from '../../util/analysisProcess';
export const addLandeOrigin = (dataOrigin: any) => {
    return { type: GETLANDEDORIGIN, data: dataOrigin };
};

export const addTyphonList = (typhoonLists: any) => {
    return { type: TYPHOONLIST, data: typhoonLists };
};

export const addLandedTracks = (typhoonLists: any, landedOrigin: any) => {
    const getFlatLandedOrigin = Object.assign({}, ...landedOrigin);
    const getLandedTyphoon = typhoonLists
        .filter((item: any) => {
            return item['tfdl'] === 1;
        })
        .map((item: EachTyphoon) => {
            const tfbh = item['tfbh'];
            const time = item['listInfo'][0]['time'].split('-')[0];
            const landedPosition = getFlatLandedOrigin[tfbh];
            const track = item['listInfo'].map((each) => {
                const currentSpeed = +each['currentSpeed'];
                const coordinate = [
                    each['positon']['Lng'],
                    each['positon']['Lat'],
                ];
                const windCircle = getRankWindCircle(each);
                return { currentSpeed, coordinate, windCircle };
            });
            return { tfbh, time, landedPosition, track };
        });

    return { type: LANDEDTRACK, data: getLandedTyphoon };
};

export const combineLandedCluster = (clusterResult: any) => {
    return { type: LANDEDCLUSTER, data: clusterResult };
};

export const originCluster = (result: any) => {
    return { type: ORIGINCLUSTER, data: result };
};

export const getTrenInfo = (result: any) => {
    return { type: TRENDINFO, data: result };
};
