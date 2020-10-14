import {
    GETLANDEDORIGIN,
    TYPHOONLIST,
    LANDEDCLUSTER,
    ORIGINCLUSTER,
} from './types';
export const addLandeOrigin = (dataOrigin: any) => {
    return { type: GETLANDEDORIGIN, data: dataOrigin };
};

export const addTyphonList = (typhoonLists: any) => {
    return { type: TYPHOONLIST, data: typhoonLists };
};

export const combineLandedCluster = (clusterResult: any) => {
    return { type: LANDEDCLUSTER, data: clusterResult };
};

export const originCluster = (result: any) => {
    return { type: ORIGINCLUSTER, data: result };
};
