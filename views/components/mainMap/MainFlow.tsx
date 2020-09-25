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
import { getTyphoonOrigin } from '../../src/util/netRequets';
import { TyphoonOrigin } from '../../src/util/clusterOrigin';
import * as turf from '@turf/turf';
import {
    BBox,
    Units,
    Feature,
    Polygon,
    MultiPolygon,
    Properties,
} from '@turf/turf';
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
    origin: Array<TyphoonOrigin>;
}

export default class MainFlow extends React.Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            index: '',
            origin: [],
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
        this.handleTyphoonOrigin();
    }
    defaultGrids = (): void => {
        const bbox: BBox = [98, 17.5, 124, 46];
        const cellSide = 150;
        const options: Option = { units: 'miles' };
        const squareGrid = turf.squareGrid(bbox, cellSide, options);
        console.log(squareGrid);
        const format = new GeoJSON();
        const source = new VectorSource();
        const allFeatures = format
            .readFeatures(squareGrid)
            .map((feature, index) => {
                feature.setId(index);
                return feature;
            });
        console.log(allFeatures);
        source.addFeatures(allFeatures);
        const getLayer = new VectorLayer({ source: source });
        window.LDmap.addLayer(getLayer);
    };

    handleTyphoonOrigin = async () => {
        try {
            if (!localStorage.getItem('origin')) {
                const typhoonOrigin: any = await getTyphoonOrigin();
                localStorage.setItem(
                    'origin',
                    JSON.stringify(typhoonOrigin['data'])
                );
                this.setState({ origin: typhoonOrigin['data'] });
            } else {
                const typhoonOrigin = JSON.parse(
                    localStorage.getItem('origin')
                );
                this.setState({ origin: typhoonOrigin });
            }
        } catch (err) {
            console.log(err);
        }
    };
    handleConrolPanel = (getIndex: string): void => {
        this.setState({ index: getIndex });
    };
    render() {
        const { index, origin } = this.state;
        return (
            <div className="container">
                <Menu handleControlPanel={this.handleConrolPanel} />
                <BasisBar origin={origin} />
                <DetailPanel index={index} origin={origin} />
                <div id="map"></div>
            </div>
        );
    }
}
