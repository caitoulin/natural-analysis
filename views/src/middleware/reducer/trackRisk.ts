import { EACHLINE } from '../../util/clusterLandedTrack';
import { TRENDINFO } from '../action/types';
export interface INISTIAL {
    segment: number | null;
    trendIndex: number | string | null;
    trackInfo: Array<EACHLINE>;
}

const initialState: INISTIAL = {
    segment: null,
    trendIndex: null,
    trackInfo: [],
};

interface Action {
    type: string;
    data: any;
}
export default function eachTrend(
    state = initialState,
    { type, data }: Action
) {
    switch (type) {
        case TRENDINFO:
            return { ...state, ...data };
        default:
            return state;
    }
}
