import React from 'react';
import { LANDTRACK } from '../../src/middleware/reducer/typhoonInfo';
import { connect } from 'react-redux';
import classNames from 'classnames';
import TrendPanel from '../dialog/trendPanel';
import {
    getLandedTrackSegment,
    trackSegmentCluster,
    lineSegDbscan,
    allLinesDbscan,
} from '../../src/util/clusterLandedTrack';
import {
    getAllRerresentTrac,
    clusterTracksRepre,
} from '../../src/util/representTrac';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Stroke, Style, Text } from 'ol/style';
import { Feature } from 'ol';
import { LineString } from 'ol/geom';

interface IProps {
    landedCluster: Array<any>;
    landedTracks: Array<LANDTRACK>;
}
interface IState {
    index: number;
    isShow: boolean;
}
const colors = [
    'rgb(47,79,79)',
    'rgb(255,182,193)',
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
const vectorTracks = new VectorSource();
const vectorTracksLayer = new VectorLayer({
    source: vectorTracks,
    style: new Style({
        stroke: new Stroke({
            width: 1,
            color: '#319FD3',
        }),
    }),
});
const clusterTracks = new VectorSource();
const clusterTracksLayer = new VectorLayer({
    source: clusterTracks,
    style: new Style({
        stroke: new Stroke({
            width: 1,
            color: '#319FD3',
        }),
    }),
});
const clusterLine = new VectorSource();
const clusterLineLayer = new VectorLayer({
    source: clusterLine,
    style: new Style({
        stroke: new Stroke({
            width: 1,
            color: '#319FD3',
        }),
    }),
});
class TrackCluster extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = { index: 12, isShow: false };
    }
    componentDidMount() {
        const layers = window.LDmap.getLayers().getArray();
        if (!layers.includes(vectorTracksLayer)) {
            window.LDmap.addLayer(vectorTracksLayer);
        }
        if (!layers.includes(clusterTracksLayer)) {
            window.LDmap.addLayer(clusterTracksLayer);
        }
        if (!layers.includes(clusterLineLayer)) {
            window.LDmap.addLayer(clusterLineLayer);
        }
    }
    handleShowTracks = () => {
        if (vectorTracks.getFeatures().length !== 0) {
            if (vectorTracksLayer.getVisible()) {
                vectorTracksLayer.setVisible(false);
            } else {
                vectorTracksLayer.setVisible(true);
            }
        } else {
            if (!vectorTracksLayer.getVisible()) {
                vectorTracksLayer.setVisible(true);
            }
            const { index } = this.state;
            const { landedCluster, landedTracks } = this.props;
            const landedTracksSegment = getLandedTrackSegment(
                landedCluster,
                landedTracks
            );
            const getIndexTracks = landedTracksSegment[index]['data'];
            const getIndexFeatures = getIndexTracks.map((item: any) => {
                const getCoors: any = Object.values(item)[0];
                const getAllCoors = getCoors.map((each: any) => {
                    const { coordinate } = each;
                    return [+coordinate[0], +coordinate[1]];
                });
                const eachLineFeature = new Feature({
                    geometry: new LineString(getAllCoors),
                });
                eachLineFeature.setStyle(
                    new Style({
                      /*   text: new Text({
                            text: Object.keys(item)[0],
                        }), */
                        stroke: new Stroke({
                            width: 1,
                            color: 'rgb(38,188,213)',
                        }),
                    })
                );
                return eachLineFeature;
            });
            vectorTracks.addFeatures(getIndexFeatures);
        }
    };
    handleShowClusterSegTracks = () => {
        if (clusterTracks.getFeatures().length !== 0) {
            if (clusterTracksLayer.getVisible()) {
                clusterTracksLayer.setVisible(false);
            } else {
                clusterTracksLayer.setVisible(true);
            }
        } else {
            if (!clusterTracksLayer.getVisible()) {
                clusterTracksLayer.setVisible(true);
            }
            const { index } = this.state;
            const { landedCluster, landedTracks } = this.props;
            const landedTracksSegment = getLandedTrackSegment(
                landedCluster,
                landedTracks
            );
            const getIndexTracks = landedTracksSegment[index]['data'];
            const allSegments = trackSegmentCluster(getIndexTracks);
            const getClusterLines = lineSegDbscan(allSegments, 5, 2);
            const getAllLineFeatures = getClusterLines
                .map((item, index) => {
                    return item.map((each) => {
                        const linePoints = allSegments[each]['values'];
                        const eachFeature = new Feature({
                            geometry: new LineString(linePoints),
                        });
                        eachFeature.setStyle(
                            new Style({
                                stroke: new Stroke({
                                    width: 1,
                                    color: colors[index],
                                }),
                            })
                        );
                        return eachFeature;
                    });
                })
                .reduce((a, b) => {
                    return a.concat(b);
                }, []);
            const getAllRreTrackFeatures = getAllRerresentTrac(
                getClusterLines,
                allSegments
            ).map((item, index) => {
                const eachFeature = new Feature({
                    geometry: new LineString(item),
                });
                eachFeature.setStyle(
                    new Style({
                        stroke: new Stroke({
                            width: 5,
                            color: colors[index],
                        }),
                    })
                );
                return eachFeature;
            });
            clusterTracks.addFeatures([
                ...getAllLineFeatures,
                ...getAllRreTrackFeatures,
            ]);
        }
    };
    handleShowClusterLine = () => {
        const { index } = this.state;
        if ([0, 1, 2].includes(index)) {
            const { isShow } = this.state;
            this.setState({ isShow: !isShow });
            return;
        }
        if (clusterLine.getFeatures().length !== 0) {
            if (clusterLineLayer.getVisible()) {
                clusterLineLayer.setVisible(false);
            } else {
                clusterLineLayer.setVisible(true);
            }
        } else {
            if (!clusterLineLayer.getVisible()) {
                clusterLineLayer.setVisible(true);
                return;
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
                        // text: new Text({
                        //     offsetX:-3,
                        //     offsetY:-3,
                        //     font: '22px Calibri,sans-serif',
                        //     text: (index+1).toString(),
                        // }),
                        stroke: new Stroke({
                            width: 4,
                            color: colors[index],
                        }),
                    })
                );
                return eachFeature;
            });
            clusterLine.addFeatures([
                ...allFeatures,
                ...getAllRreTrackFeatures,
            ]);
        }
    };
    showDialog = (index: number) => {
        const { isShow } = this.state;
        if (isShow) {
            this.setState({ isShow: false });
        }
        this.setState({ index });
        if (vectorTracks.getFeatures().length !== 0) vectorTracks.clear();
        if (clusterTracks.getFeatures().length !== 0) clusterTracks.clear();
        if (clusterLine.getFeatures().length !== 0) clusterLine.clear();
    };
    render() {
        const arrButton = [0, 1, 2, 3, 4, 5, 6];
        const { index } = this.state;
        const { isShow } = this.state;
        const { landedCluster, landedTracks } = this.props;
        const nextProps = { landedCluster, landedTracks, index };
        return (
            <div>
                <div className="cluster-groups">
                    {arrButton.map((item) => {
                        return (
                            <div key={item + '3'}>
                                <button
                                    key={item}
                                    onClick={() =>
                                        this.showDialog(item)
                                    }>{`分段${item + 1}`}</button>
                                <div
                                    className={classNames('show-down', {
                                        'close-down': index !== item,
                                    })}>
                                    <span onClick={this.handleShowTracks}>
                                        原始轨迹
                                    </span>
                                    <span
                                        onClick={
                                            this.handleShowClusterSegTracks
                                        }>
                                        分段聚类
                                    </span>
                                    <span onClick={this.handleShowClusterLine}>
                                        整条聚类
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {isShow && <TrendPanel {...nextProps} />}
            </div>
        );
    }
}

function mapStateToProps(state: any) {
    const { landedCluster, landedTracks } = state.typhoonInfo;
    return { landedCluster, landedTracks };
}

export default connect(mapStateToProps)(TrackCluster);
