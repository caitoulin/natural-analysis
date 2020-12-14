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
} from '../../src/util/riskAssement';

interface IState {
    Indexes: string[];
    urls: string[];
}
interface IProps {
    isShowV: boolean;
    segment: number | null;
    trendIndex: number | null;
    trackInfo: Array<EACHLINE>;
}
export default class VulnerPanel extends React.Component<IProps, IState> {
    canvasLayer: any;
    preIndex: any;
    constructor(props: any) {
        super(props);
        this.state = {
            Indexes: ['GDP', '人口', 'POI', '土地类型', '交通', '综合'],
            urls: [
                '/get/gdpIndex',
                '/get/popIndex',
                '/get/poiIndex',
                '/get/landIndex',
                '/get/transIndex',
            ],
        };
        this.canvasLayer = new CanvasLayrs();
        this.preIndex = null;
    }
    showGridResults = async (e: MouseEvent, index: number) => {
        e.stopPropagation();
        const { segment, trendIndex, trackInfo } = this.props;
        const { urls } = this.state;
        const getIndex = trendIndex
            ? segment.toString() + trendIndex.toString() + index + 'V'
            : segment.toString() + index + 'V';
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
            if (index > 4) {
                console.time('1');
                getVulnerGrids(boundNum, segment, trendIndex);
                console.timeEnd('1');
            } else {
                getGridData = await getGrids(boundNum, urls[index]);
                writeGridsDataToSore({ indexId: getIndex, grids: getGridData });
            }
        }
        this.canvasLayer.createCanvasLayer(
            getIndex,
            'V'+index,
            getGridData,
            boundaryLat
        );
    };
    render() {
        const { Indexes } = this.state;
        const { isShowV } = this.props;
        return (
            <ul style={{ visibility: isShowV ? 'visible' : 'hidden' }}>
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
