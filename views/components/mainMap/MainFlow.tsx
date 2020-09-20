import React from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import './main.less';
import Menu from '../menuBar/Menu';
import BasisBar from '../basisBar/basisBar';
declare global {
    interface Window {
        LDmap: any;
    }
}

export default class MainFlow extends React.Component<any, any> {
    componentDidMount() {
        window.LDmap = new Map({
            controls: [],
            view: new View({
                projection: 'ESPG:4326',
                center: [123.71318, 24.943509],
                zoom: 1,
            }),
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            target: 'map',
        });
    }
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
