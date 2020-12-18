import CanvasLayrs from '../../src/util/canvasLayer';
import React, { MouseEvent } from 'react';
import {
    getIndexGridsData,
    writeGridsDataToSore,
} from '../../src/util/handleIndexDB';
import {
    getBoundary,
    getGrids,
    getVulnerGrids,
    getEachHazardGrids,
    getHazardIndex,
} from '../../src/util/riskAssement';

interface IState {
    Indexes: string[];
}
interface IProps {
    isShowH: boolean;
    segment: number | null;
    trendIndex: number | null;
    trackInfo: Array<EACHLINE>;
}
export default class HazardPanel extends React.Component<IProps, IState> {
    canvasLayer: any;
    preIndex: any;
    constructor(props: any) {
        super(props);
        this.state = {
            Indexes: ['影响次数', '风圈指数', '综合'],
        };
        this.canvasLayer = new CanvasLayrs();
        this.preIndex = null;
    }
    showGridResults = async (e: MouseEvent, index: number) => {
        e.stopPropagation();
        const { segment, trendIndex, trackInfo } = this.props;
        const getIndexLand = trendIndex
            ? segment.toString() + trendIndex.toString()
            : segment.toString()
        const getIndex = trendIndex
            ? segment.toString() + trendIndex.toString() + index + 'H'
            : segment.toString() + index + 'H'
        const getLayer = this.canvasLayer.getLayerByIndex(getIndex);
        if (this.preIndex === getIndex) {
            getLayer.getVisible()
                ? getLayer.setVisible(false)
                : getLayer.setVisible(true);
            return;
        }
        if (getLayer) {
            getLayer.setVisible(true);
            this.preIndex = getIndex;
            return;
        }
        this.preIndex = getIndex;
        const resultH = await getIndexGridsData(getIndex);
        const resultV = await getIndexGridsData(getIndexLand + '3' + 'V');
        let getGridDataVL;
        const { boundaryLat, boundNum } = getBoundary(trackInfo);
        if (!!resultV) {
            const getData = resultV as VData;
            getGridDataVL = getData['grids'];
        } else {
            getGridDataVL = await getGrids(boundNum, '/get/landIndex');
            writeGridsDataToSore({ indexId: getIndexLand + '3' + 'V', grids: getGridDataVL });
        }
        let getGridData;
        if (!!resultH) {
            const getData = resultH as VData;
            getGridData = getData['grids'];
        } else {
            if (index > 1) {
                getGridData = await getHazardIndex(trackInfo, segment, trendIndex);
            } else {
                index === 0
                    ? (getGridData = getEachHazardGrids(trackInfo, true))
                    : (getGridData = getEachHazardGrids(trackInfo, false));
                writeGridsDataToSore({ indexId: getIndex, grids: getGridData });
            }
        }
        this.canvasLayer.createCanvasLayer(
            getIndex,
            'H' + index,
            getGridData,
            boundaryLat, getGridDataVL
        );
    };
    render() {
        const { Indexes } = this.state;
        const { isShowH } = this.props;
        return (
            <ul
                style={{
                    visibility: isShowH ? 'visible' : 'hidden',
                }}>
                {Indexes.map((item, index) => {
                    return (
                        <li
                            key={index}
                            onClick={(e) => this.showGridResults(e, index)}>
                            {item}
                        </li>
                    );
                })}
            </ul>
        );
    }
}
