import { combineReducers } from 'redux';
import typhoonInfo from './reducer/typhoonInfo';
import eachTrend from './reducer/trackRisk';
export const rootReducer = combineReducers({
    typhoonInfo,
    eachTrend,
});
