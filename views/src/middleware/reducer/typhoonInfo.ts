import {
    GETLANDEDORIGIN,
    TYPHOONLIST,
    LANDEDCLUSTER,
    ORIGINCLUSTER,
    LANDEDTRACK,
} from '../action/types';
import { EachTyphoon } from '../../util/handleIndexDB';
import { TyphoonOrigin } from '../../util/clusterOrigin';
import { WINDCIRCLE } from '../../util/analysisProcess';
interface TYORIGININFO {
    [key: string]: { location: string; position: Array<number> };
}
interface TRACKCOOR {
    coordinate: Array<number>;
    windCircle: WINDCIRCLE;
    currentSpeed: number;
}
export interface LANDTRACK {
    tfbh: string;
    time: string;
    landedPosition: Array<number>;
    track: Array<TRACKCOOR>;
}

export interface INISTIAL {
    landedOrigin: Array<TYORIGININFO>;
    typhoonLists: Array<EachTyphoon>;
    landedTracks: Array<LANDTRACK>;
    landedCluster: any;
    originCluster: Array<Array<TyphoonOrigin>>;
}
const initialState: INISTIAL = {
    landedOrigin: [],
    landedTracks: [],
    typhoonLists: [],
    landedCluster: [],
    originCluster: [],
};
interface Action {
    type: string;
    data: any;
}
export default function typhoonInfo(
    state = initialState,
    { type, data }: Action
) {
    switch (type) {
        case GETLANDEDORIGIN:
            return { ...state, landedOrigin: data };
        case TYPHOONLIST:
            return { ...state, typhoonLists: data };
        case LANDEDCLUSTER:
            return { ...state, landedCluster: data };
        case ORIGINCLUSTER:
            return { ...state, originCluster: data };
        case LANDEDTRACK:
            return { ...state, landedTracks: data };
        default:
            return state;
    }
}
