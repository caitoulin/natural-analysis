import React from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import './main.less';
import Menu from '../menuBar/Menu';
import DetailPanel from '../detailPanel/DetailPanel';
import BasisBar from '../basisBar/basisBar';
import {
    getTyphoonLandedOrigin,
    getTyphoonLists,
} from '../../src/util/netRequets';
import * as turf from '@turf/turf';
import {
    storeTyphoonData,
    getTyphoonData,
    isExistTyphoonList,
} from '../../src/util/handleIndexDB';
import {
    addLandeOrigin,
    addTyphonList,
} from '../../src/middleware/action/actions';
import {
    BBox,
    Units,
    Feature,
    Polygon,
    MultiPolygon,
    Properties,
} from '@turf/turf';
import { connect } from 'react-redux';
declare global {
    interface Window {
        LDmap: any;
    }
}
interface Option {
    units?: Units;
    properties?: Properties;
    mask?: Feature<Polygon | MultiPolygon> | Polygon | MultiPolygon;
}
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
    defaultGrids = (): void => {
        const bbox: BBox = [98, 17.5, 124, 46];
        const cellSide = 150;
        const options: Option = { units: 'miles' };
        const squareGrid = turf.squareGrid(bbox, cellSide, options);
        const format = new GeoJSON();
        const source = new VectorSource();
        const allFeatures = format
            .readFeatures(squareGrid)
            .map((feature, index) => {
                feature.setId(index);
                return feature;
            });
        source.addFeatures(allFeatures);
        const getLayer = new VectorLayer({ source: source });
        window.LDmap.addLayer(getLayer);
    };

    handleTyphoonLandedOrigin = async () => {
        const { dispatch } = this.props;
        try {
            if (!localStorage.getItem('landedOrigin')) {
                const typhoonLandedOrigin: any = await getTyphoonLandedOrigin();
                localStorage.setItem(
                    'landedOrigin',
                    JSON.stringify(typhoonLandedOrigin['data'])
                );
                dispatch(addLandeOrigin(typhoonLandedOrigin['data']));
            } else {
                const typhoonLandedOrigin = JSON.parse(
                    localStorage.getItem('landedOrigin')
                );
                dispatch(addLandeOrigin(typhoonLandedOrigin['data']));
            }
        } catch (err) {
            console.error(err);
        }
        try {
            const getMessage = await isExistTyphoonList();
            if (getMessage === 1) {
                const typhoonList = await getTyphoonData();
                dispatch(addTyphonList(typhoonList));
            } else {
                const typhoonList: any = await getTyphoonLists();
                storeTyphoonData(typhoonList['data']);
                dispatch(addTyphonList(typhoonList['data']));
            }
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
                <BasisBar />
                <DetailPanel index={index} />
                <div id="map"></div>
            </div>
        );
    }
}

export default connect()(MainFlow);
