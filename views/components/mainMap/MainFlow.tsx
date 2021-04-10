import React from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import './main.less';
import Menu from '../menuBar/Menu';
import DetailPanel from '../detailPanel/DetailPanel';
import BasisBar from '../basisBar/basisBar';
import RiskPanel from '../dialog/riskPanel';
import {
    getTyphoonLandedOrigin,
    getTyphoonLists,
} from '../../src/util/netRequets';
import {
    storeTyphoonData,
    getTyphoonData,
    isExistTyphoonList,
} from '../../src/util/handleIndexDB';
import {
    addLandeOrigin,
    addTyphonList,
    addLandedTracks,
} from '../../src/middleware/action/actions';
import { connect } from 'react-redux';
declare global {
    interface Window {
        LDmap: any;
    }
} // 更改已存在的对象，Window对象以及存在
interface IState {
    index: string;
}
class MainFlow extends React.Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            index: '',
        };
    }
    componentDidMount() {
        window.LDmap = new Map({
            controls: [],
            view: new View({
                center: [123.474903, 24.223405],
                zoom: 4,
                projection: 'EPSG:4326',
            }),
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            target: 'map',
        });
        this.handleTyphoonLandedOrigin();
    }
    handleTyphoonLandedOrigin = async () => {
        const { dispatch } = this.props;
        try {
            let typhoonLandedOrigin: any;
            let typhoonList: any;
            if (!localStorage.getItem('landedOrigin')) {
                const requestLandedOrigin = await getTyphoonLandedOrigin();
                typhoonLandedOrigin = requestLandedOrigin['data'];
                localStorage.setItem(
                    'landedOrigin',
                    JSON.stringify(typhoonLandedOrigin)
                );
                dispatch(addLandeOrigin(typhoonLandedOrigin));
            } else {
                typhoonLandedOrigin = JSON.parse(
                    localStorage.getItem('landedOrigin')
                );
                dispatch(addLandeOrigin(typhoonLandedOrigin));
            }
            const getMessage = await isExistTyphoonList();
            if (getMessage === 1) {
                typhoonList = await getTyphoonData();
                dispatch(addTyphonList(typhoonList));
            } else {
                const requestTyphoonList = await getTyphoonLists();
                typhoonList = requestTyphoonList['data'];
                storeTyphoonData(typhoonList);
                dispatch(addTyphonList(typhoonList));
            }
            dispatch(addLandedTracks(typhoonList, typhoonLandedOrigin));
        } catch (err) {
            console.error(err);
        }
    };
    handleConrolPanel = (getIndex: string): void => {
        this.setState({ index: getIndex });
    };
    render() {
        const { index } = this.state;
        return (
            <div className="container">
                <Menu handleControlPanel={this.handleConrolPanel} />
                <DetailPanel index={index} />
                <RiskPanel />
                <div id="map"></div>
            </div>
        );
    }
}

export default connect()(MainFlow);
