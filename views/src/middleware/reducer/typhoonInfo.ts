import {
    GETLANDEDORIGIN,
    TYPHOONLIST,
    LANDEDCLUSTER,
    ORIGINCLUSTER,
} from '../action/types';
import { EachTyphoon } from '../../util/handleIndexDB';
import { TyphoonOrigin } from '../../util/clusterOrigin';
interface TYORIGININFO {
    [key: string]: { location: string; position: Array<number> };
}

export interface INISTIAL {
    landedOrigin: Array<TYORIGININFO>;
    typhoonLists: Array<EachTyphoon>;
    landedCluster: any;
    originCluster: Array<Array<TyphoonOrigin>>;
}
const initialState: INISTIAL = {
    landedOrigin: [],
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
        default:
            return state;
    }
}
