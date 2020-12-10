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
        const getIndex = trendIndex
            ? segment.toString() + trendIndex.toString() + index + 'H'
            : segment.toString() + index + 'H';
        const getLayer = this.canvasLayer.getLayerByIndex(getIndex);
        if (this.preIndex === getIndex) {
            getLayer.getVisible()
                ? getLayer.setVisible(false)
                : getLayer.setVisible(true);
            return;
        }
        if (getLayer) {
            getLayer.setVisible(true);
            return;
        }
        this.preIndex = getIndex;
        const result = await getIndexGridsData(getIndex);
        const { boundNum, boundaryLat } = getBoundary(trackInfo);
        let getGridData;
        if (!!result) {
            const getData = result as VData;
            getGridData = getData['grids'];
        } else {
            if (index > 1) {
                console.time('1');
                getVulnerGrids(boundNum, segment, trendIndex);
                console.timeEnd('1');
            } else {
                index === 0
                    ? (getGridData = getEachHazardGrids(trackInfo, false))
                    : (getGridData = getEachHazardGrids(trackInfo, true));
                writeGridsDataToSore({ indexId: getIndex, grids: getGridData });
            }
        }
        /*    this.canvasLayer.createCanvasLayer(
            getIndex,
            index,
            getGridData,
            boundaryLat
        ); */
    };
    render() {
        const { Indexes } = this.state;
        const { isShowH } = this.props;
        return (
            <ul
                style={{
                    visibility: isShowH ? 'visible' : 'hidden',
                    top: '-88px',
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
