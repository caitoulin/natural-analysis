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
import BasisBar from '../basisBar/basisBar';
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

export default class MainFlow extends React.Component<any, any> {
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
        this.defaultGrids();
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
    render() {
        return (
            <div className="container">
                <Menu />
                <BasisBar />
                <div id="map"></div>
            </div>
        );
    }
}
