import React from 'react';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import * as turf from '@turf/turf';
import {
    BBox,
    Units,
    Feature as turfFeature,
    Polygon,
    MultiPolygon,
    Properties,
} from '@turf/turf';
import IndexChart from '../dialog/indexChart';
import { LANDTRACK } from '../../src/middleware/reducer/typhoonInfo';
import {
    getInterplotTRacksLanded,
    getColor,
} from '../../src/util/analysisProcess';
import { getInfluenceIndex } from '../../src/util/netRequets';
import { connect } from 'react-redux';
import { Fill, Style, Text } from 'ol/style';
import { extend } from 'ol/extent';
interface Option {
    units?: Units;
    properties?: Properties;
    mask?: turfFeature<Polygon | MultiPolygon> | Polygon | MultiPolygon;
}
interface IProps {
    landedTracks: Array<LANDTRACK>;
}
interface IState {
    index: string;
    indexKey: Grid;
}
const localCompute = 1;
const indexSource = new VectorSource();
const indexLayer = new VectorLayer({ source: indexSource });
class InfluencedIndex extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = { index: '', indexKey: {} };
    }
    defaultGrids = async () => {
        let indexKey = {};
        const { landedTracks } = this.props;
        if (indexSource.getFeatures().length !== 0) {
            if (indexLayer.getVisible()) {
                indexLayer.setVisible(false);
            } else {
                indexLayer.setVisible(true);
            }
        } else {
            const bbox: BBox = [98, 17.5, 124, 46];
            const cellSide = 150;
            const options: Option = { units: 'miles' };
            const squareGrid = turf.squareGrid(bbox, cellSide, options);
            try {
                if (!localStorage.getItem('influencedIndex')) {
                    const requestIndex = await getInfluenceIndex();
                    indexKey = requestIndex['data'];
                    localStorage.setItem(
                        'influencedIndex',
                        JSON.stringify(indexKey)
                    );
                } else {
                    indexKey = JSON.parse(
                        localStorage.getItem('influencedIndex')
                    );
                }
            } catch (err) {
                console.error(err);
            }
            if (localCompute !== 1) {
                // 计算登陆后的轨迹
                const getrAllLandedData = getInterplotTRacksLanded(
                    landedTracks
                );
                getrAllLandedData.forEach((each) => {
                    each['getAllLandedPoints'].forEach((eachPoint) => {
                        const point = turf.point(eachPoint['coordinate']);
                        if (eachPoint['windCircle']['sevenCicle'] !== 0) {
                            const buffered = turf.buffer(
                                point,
                                eachPoint['windCircle']['sevenCicle']
                            );
                            squareGrid['features'].forEach((item, index) => {
                                if (turf.booleanOverlap(item, buffered)) {
                                    const key = index.toString();
                                    if (!indexKey[key]) {
                                        indexKey[key] = {};
                                        indexKey[key][each['time']] = 1;
                                        indexKey[key]['total'] = 1;
                                    } else {
                                        indexKey[key]['total'] += 1;
                                        if (!indexKey[key][each['time']]) {
                                            indexKey[key][each['time']] = 1;
                                        } else {
                                            indexKey[key][each['time']] += 1;
                                        }
                                    }
                                }
                            });
                        }
                    });
                });
            }
            const format = new GeoJSON();
            const allFeatures = format
                .readFeatures(squareGrid)
                .map((feature, index) => {
                    const key = index.toString();
                    if (indexKey[key]) {
                        const colorValue = getColor(indexKey[key]['total']);
                        feature.setStyle(
                            new Style({
                                fill: new Fill({
                                    color: colorValue,
                                }),
                                text: new Text({
                                    font: '12px Calibri,sans-serif',
                                    fill: new Fill({
                                        color: '#000',
                                    }),
                                    text: indexKey[key]['total'].toString(),
                                }),
                            })
                        );
                    }
                    feature.setId('infIndex-' + index);
                    return feature;
                });
            indexSource.addFeatures(allFeatures);
            window.LDmap.addLayer(indexLayer);
            this.setState({ indexKey });
        }
    };
    rigisterClick = (e: any) => {
        this.setState({ index: '' });
        window.LDmap.forEachFeatureAtPixel(
            e.pixel,
            (feature: any) => {
                const id = feature.getId();
                if (id.includes('infIndex')) {
                    const index = id.split('-')[1];
                    this.setState({ index });
                }
            },
            {
                layerFilter: (layer: any) => {
                    return layer === indexLayer;
                },
            }
        );
    };
    componentDidMount() {
        window.LDmap.on('singleclick', this.rigisterClick);
    }
    componentWillUnmount() {
        window.LDmap.un('singleclick', this.rigisterClick);
    }
    render() {
        const { index, indexKey } = this.state;
        return (
            <div className="cluster-groups">
                <button onClick={this.defaultGrids}>影响力栅格</button>
                <IndexChart index={index} indexKey={indexKey} />
            </div>
        );
    }
}

function mapStateToProps(state: any) {
    const { landedTracks } = state.typhoonInfo;
    return { landedTracks };
}

export default connect(mapStateToProps)(InfluencedIndex);
