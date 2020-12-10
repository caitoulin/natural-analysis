import React from 'react';
import { LANDTRACK } from '../../src/middleware/reducer/typhoonInfo';
import { INISTIAL } from '../../src/middleware/reducer/trackRisk';
import { getTrenInfo } from '../../src/middleware/action/actions';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Stroke, Style, Text } from 'ol/style';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import { Dispatch } from 'redux';
import {
    getLandedTrackSegment,
    allLinesDbscan,
    combineClutserTracks,
} from '../../src/util/clusterLandedTrack';
import { clusterTracksRepre } from '../../src/util/representTrac';
import { connect } from 'react-redux';
interface IProps {
    landedCluster: Array<any>;
    landedTracks: Array<LANDTRACK>;
    index: number;
    dispatch?: Dispatch;
}
interface IState {
    remainIndex: number[];
    getNewClusterResult: number[][];
    classifyNewTracks: any;
    noiseIndex: number[];
}
const colors = [
    'rgb(47,79,79)',
    'rgb(220,20,60)',
    'rgb(255,20,147)',
    'rgb(139,0,139)',
    'rgb(123,104,238)',
    'rgb(0,0,255)',
    'rgb(65,105,225)',
    'rgb(0,191,255)',
    'rgb(0,255,0)',
    'rgb(255,215,0)',
    'rgb(160,82,45)',
    'rgb(255,0,0)',
    'rgb(105,105,105)',
];
const allClusterTracks = new VectorSource();
const allClusterTracksLayer = new VectorLayer({
    source: allClusterTracks,
    style: new Style({
        stroke: new Stroke({
            width: 1,
            color: '#319FD3',
        }),
    }),
});
const showPropertySource = new VectorSource();
const showLayer = new VectorLayer({
    source: showPropertySource,
    style: new Style({
        stroke: new Stroke({
            width: 1,
            color: '#319FD3',
        }),
    }),
});
const combineLayer = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        stroke: new Stroke({
            width: 1,
            color: '#319FD3',
        }),
    }),
});
const classfiyLayer = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        stroke: new Stroke({
            width: 1,
            color: '#319FD3',
        }),
    }),
});
const noiseLayer = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        stroke: new Stroke({
            width: 1,
            color: 'rgb(255,0,0)',
        }),
    }),
});
const trendLayer = new VectorLayer({
    source: new VectorSource(),
    style: new Style({
        stroke: new Stroke({
            width: 1,
            color: '#319FD3',
        }),
    }),
});
let preIndex: any = null;
let getResult: any = null;
let preTrendIndex: any = null;
class TrendPanel extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            getNewClusterResult: [],
            remainIndex: [],
            classifyNewTracks: '',
            noiseIndex: [],
        };
    }
    componentDidMount() {
        const { index } = this.props;
        if (index !== preIndex) {
            preIndex = index;
            if (!allClusterTracksLayer.getVisible()) {
                allClusterTracks.clear();
                allClusterTracksLayer.setVisible(true);
            }
            const { landedCluster, landedTracks } = this.props;
            const landedTracksSegment = getLandedTrackSegment(
                landedCluster,
                landedTracks
            );
            const getIndexTracks = landedTracksSegment[index]['data'];
            const getLinesCluster = allLinesDbscan(getIndexTracks, 5, 0.25);
            const allFeatures = getLinesCluster
                .map((item, index) => {
                    return item.map((each) => {
                        const eachLine: any = Object.values(
                            getIndexTracks[each]
                        )[0];
                        const getAllCoors = eachLine.map((each: any) => {
                            const { coordinate } = each;
                            return coordinate;
                        });
                        const eachLineFeature = new Feature({
                            geometry: new LineString(getAllCoors),
                        });
                        eachLineFeature.setStyle(
                            new Style({
                                stroke: new Stroke({
                                    width: 1,
                                    color: colors[index],
                                }),
                            })
                        );
                        return eachLineFeature;
                    });
                })
                .reduce((a, b) => {
                    return a.concat(b);
                }, []);
            const allRerTracks = clusterTracksRepre(
                getLinesCluster,
                getIndexTracks
            );
            const getAllRreTrackFeatures = allRerTracks.map((item, index) => {
                const eachFeature = new Feature({
                    geometry: new LineString(item),
                });
                eachFeature.setStyle(
                    new Style({
                        text: new Text({
                            font: '20px Calibri,sans-serif',
                            text: index.toString(),
                        }),
                        stroke: new Stroke({
                            width: 5,
                            color: colors[index],
                        }),
                    })
                );
                return eachFeature;
            });
            allClusterTracks.addFeatures([
                ...allFeatures,
                ...getAllRreTrackFeatures,
            ]);
            const combineResult = combineClutserTracks(
                getLinesCluster,
                getIndexTracks,
                index
            );
            getResult = combineResult;
            this.setState({ ...combineResult });
        } else {
            if (allClusterTracks.getFeatures().length !== 0) {
                if (!allClusterTracksLayer.getVisible()) {
                    allClusterTracksLayer.setVisible(true);
                    this.setState({ ...getResult });
                }
            }
        }
        const layers = window.LDmap.getLayers().getArray();
        if (!layers.includes(allClusterTracksLayer)) {
            window.LDmap.addLayer(allClusterTracksLayer);
        }
        if (!layers.includes(showLayer)) {
            window.LDmap.addLayer(showLayer);
        }
        if (!layers.includes(combineLayer)) {
            window.LDmap.addLayer(combineLayer);
        }
        if (!layers.includes(classfiyLayer)) {
            window.LDmap.addLayer(classfiyLayer);
        }
        if (!layers.includes(trendLayer)) {
            window.LDmap.addLayer(trendLayer);
        }
        if (!layers.includes(noiseLayer)) {
            window.LDmap.addLayer(noiseLayer);
        }
    }
    componentWillUnmount() {
        const { index } = this.props;
        if (preIndex === index) {
            if (allClusterTracks.getFeatures().length !== 0) {
                allClusterTracksLayer.setVisible(false);
            }
        } else {
            allClusterTracks.clear();
        }
        showPropertySource.clear();
        classfiyLayer.getSource().clear();
        combineLayer.getSource().clear();
        trendLayer.getSource().clear();
        noiseLayer.getSource().clear();
    }
    combineCluster = () => {
        if (combineLayer.getSource().getFeatures().length !== 0) {
            if (combineLayer.getVisible()) {
                combineLayer.setVisible(false);
            } else {
                combineLayer.setVisible(true);
            }
            return;
        }
        if (!combineLayer.getVisible()) {
            combineLayer.setVisible(true);
        }
        const { getNewClusterResult } = this.state;
        const { landedCluster, landedTracks, index } = this.props;
        const landedTracksSegment = getLandedTrackSegment(
            landedCluster,
            landedTracks
        );
        const getIndexTracks = landedTracksSegment[index]['data'];
        const allFeatures = getNewClusterResult
            .map((item, index) => {
                return item.map((each) => {
                    const eachLine: any = Object.values(
                        getIndexTracks[each]
                    )[0];
                    const getAllCoors = eachLine.map((each: any) => {
                        const { coordinate } = each;
                        return coordinate;
                    });
                    const eachLineFeature = new Feature({
                        geometry: new LineString(getAllCoors),
                    });
                    eachLineFeature.setStyle(
                        new Style({
                            stroke: new Stroke({
                                width: 1,
                                color: colors[index],
                            }),
                        })
                    );
                    return eachLineFeature;
                });
            })
            .reduce((a, b) => {
                return a.concat(b);
            }, []);
        combineLayer.getSource().addFeatures(allFeatures);
    };
    showRemainTracks = () => {
        if (showPropertySource.getFeatures().length !== 0) {
            if (showLayer.getVisible()) {
                showLayer.setVisible(false);
            } else {
                showLayer.setVisible(true);
            }
            return;
        }
        if (!showLayer.getVisible()) {
            showLayer.setVisible(true);
        }
        const { index, landedCluster, landedTracks } = this.props;
        const { remainIndex } = this.state;
        const landedTracksSegment = getLandedTrackSegment(
            landedCluster,
            landedTracks
        );
        const getIndexTracks = landedTracksSegment[index]['data'];
        const remainFeatures = remainIndex.map((each) => {
            const eachLine: any = Object.values(getIndexTracks[each])[0];
            const getAllCoors = eachLine.map((each: any) => {
                const { coordinate } = each;
                return coordinate;
            });
            const eachLineFeature = new Feature({
                geometry: new LineString(getAllCoors),
            });
            return eachLineFeature;
        });
        showPropertySource.addFeatures(remainFeatures);
    };
    reclusterResult = () => {
        if (classfiyLayer.getSource().getFeatures().length !== 0) {
            if (classfiyLayer.getVisible()) {
                classfiyLayer.setVisible(false);
            } else {
                classfiyLayer.setVisible(true);
            }
            return;
        }
        if (!classfiyLayer.getVisible()) {
            classfiyLayer.setVisible(true);
        }
        const { classifyNewTracks } = this.state;
        const { landedCluster, landedTracks, index, dispatch } = this.props;
        const landedTracksSegment = getLandedTrackSegment(
            landedCluster,
            landedTracks
        );
        const getIndexTracks = landedTracksSegment[index]['data'];
        const allFeatures = classifyNewTracks
            .map((item: number[], index: number) => {
                return item.map((each) => {
                    const eachLine: any = Object.values(
                        getIndexTracks[each]
                    )[0];
                    const getAllCoors = eachLine.map((each: any) => {
                        const { coordinate } = each;
                        return coordinate;
                    });
                    const eachLineFeature = new Feature({
                        geometry: new LineString(getAllCoors),
                    });
                    eachLineFeature.setStyle(
                        new Style({
                            stroke: new Stroke({
                                width: 1,
                                color: colors[index],
                            }),
                        })
                    );
                    return eachLineFeature;
                });
            })
            .reduce((a: any, b: any) => {
                return a.concat(b);
            }, []);
        classfiyLayer.getSource().addFeatures(allFeatures);
        const trackInfo = classifyNewTracks
            .map((item: number[]) => {
                return item.map((each) => {
                    return getIndexTracks[each];
                });
            })
            .reduce((a: any, b: any) => {
                return a.concat(b);
            }, []);
        const getTrendData: INISTIAL = {
            segment: index,
            trendIndex: null,
            trackInfo,
        };
        dispatch(getTrenInfo(getTrendData));
    };
    changeLayerStatus = (e: any) => {
        if (!e.target.checked) {
            allClusterTracksLayer.setVisible(false);
        } else {
            allClusterTracksLayer.setVisible(true);
        }
    };
    showEachTrend = (trendIndex: number) => {
        if (preTrendIndex !== trendIndex) {
            trendLayer.getSource().clear();
            preTrendIndex = trendIndex;
            if (!trendLayer.getVisible()) {
                trendLayer.setVisible(true);
            }
            const { classifyNewTracks } = this.state;
            const { index, landedCluster, landedTracks, dispatch } = this.props;
            const landedTracksSegment = getLandedTrackSegment(
                landedCluster,
                landedTracks
            );
            const getIndexTracks = landedTracksSegment[index]['data'];
            const eachTrendFeatures = classifyNewTracks[trendIndex].map(
                (each: any) => {
                    const eachLine: any = Object.values(
                        getIndexTracks[each]
                    )[0];
                    const getAllCoors = eachLine.map((each: any) => {
                        const { coordinate } = each;
                        return coordinate;
                    });
                    const eachLineFeature = new Feature({
                        geometry: new LineString(getAllCoors),
                    });
                    eachLineFeature.setStyle(
                        new Style({
                            stroke: new Stroke({
                                width: 1,
                                color: colors[trendIndex],
                            }),
                        })
                    );
                    return eachLineFeature;
                }
            );
            trendLayer.getSource().addFeatures(eachTrendFeatures);
            const trackInfo = classifyNewTracks[trendIndex].map((each: any) => {
                return getIndexTracks[each];
            });
            const getTrendData = {
                segment: index,
                trendIndex: (index + 1).toString() + trendIndex,
                trackInfo,
            };
            dispatch(getTrenInfo(getTrendData));
        } else {
            if (trendLayer.getSource().getFeatures().length !== 0) {
                if (trendLayer.getVisible()) {
                    trendLayer.setVisible(false);
                } else {
                    trendLayer.setVisible(true);
                }
            }
        }
    };
    showNoiseTracks = () => {
        if (noiseLayer.getSource().getFeatures().length !== 0) {
            if (noiseLayer.getVisible()) {
                noiseLayer.setVisible(false);
            } else {
                noiseLayer.setVisible(true);
            }
            return;
        }
        if (!noiseLayer.getVisible()) {
            noiseLayer.setVisible(true);
        }
        const { index, landedCluster, landedTracks } = this.props;
        const { noiseIndex } = this.state;
        const landedTracksSegment = getLandedTrackSegment(
            landedCluster,
            landedTracks
        );
        const getIndexTracks = landedTracksSegment[index]['data'];
        const remainFeatures = noiseIndex.map((each) => {
            const eachLine: any = Object.values(getIndexTracks[each])[0];
            const getAllCoors = eachLine.map((each: any) => {
                const { coordinate } = each;
                return coordinate;
            });
            const eachLineFeature = new Feature({
                geometry: new LineString(getAllCoors),
            });
            eachLineFeature.setStyle(
                new Style({
                    text: new Text({
                        text: Object.keys(getIndexTracks[each])[0],
                    }),
                    stroke: new Stroke({
                        width: 1,
                        color: 'rgb(0,255,0)',
                    }),
                })
            );
            return eachLineFeature;
        });
        noiseLayer.getSource().addFeatures(remainFeatures);
    };
    render() {
        const { getNewClusterResult } = this.state;
        return (
            <div className="dialog-trend-show">
                <span>
                    <input
                        type="checkbox"
                        defaultChecked={true}
                        onChange={this.changeLayerStatus}
                    />
                    {'控制初始'}
                </span>
                <button onClick={this.combineCluster}>合并聚类</button>
                <button onClick={this.showRemainTracks}>剩余轨迹</button>
                <button onClick={this.reclusterResult}>重新聚类</button>
                <button onClick={this.showNoiseTracks}>噪声轨迹</button>
                <div>
                    {getNewClusterResult.map((item, index) => {
                        return (
                            <button
                                key={index}
                                onClick={() => this.showEachTrend(index)}>
                                {'趋势' + (index + 1).toString()}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }
}
export default connect()(TrendPanel);
