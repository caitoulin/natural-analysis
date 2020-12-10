import React from 'react';
import { connect } from 'react-redux';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Fill, Circle, Style, Text, Stroke } from 'ol/style';
import {
    kmeans,
    dbscan,
    combineCluster,
    TyphoonLandedOrigin,
    splitSegment,
} from '../../src/util/clusterLanded';
import { getCircleRadius } from '../../src/util/analysisProcess';
import { combineLandedCluster } from '../../src/middleware/action/actions';
import { LineString, Point } from 'ol/geom';
import { Feature } from 'ol';
import { Dispatch } from 'redux';
const colors = [
    'rgb(220,20,60)',
    'rgb(255,0,255)',
    'rgb(0,0,205)',
    'rgb(0,191,255)',
    'rgb(0,255,0)',
    'rgb(255,215,0)',
    'rgb(255,69,0)',
    'rgb(255,0,0)',
    'rgb(105,105,105)',
    'rgb(138,43,226)',
];
const landedCenterPosition = [
    [120.85, 26.04],
    [114.7309, 22.059],
    [111.1182, 19.9807],
    [122.87, 37.39],
    [109.1423, 21.288],
    [121.82, 33.51],
    [121.79, 23.45],
];
const vectorSegmentSource = new VectorSource();
const vectorKmeansSource = new VectorSource();
const vectorDbscanSource = new VectorSource();
const vectorCombiSource = new VectorSource();
const vectorKmeansLayer = new VectorLayer({
    source: vectorKmeansSource,
    style: new Style({
        image: new Circle({
            fill: new Fill({
                color: 'rgb(255,0,0)',
            }),
            radius: 2,
        }),
    }),
});
const vectorDbscanLayer = new VectorLayer({
    source: vectorDbscanSource,
    style: new Style({
        image: new Circle({
            fill: new Fill({
                color: 'rgb(255,255,0)',
            }),
            radius: 2,
        }),
    }),
});
const vectorCombinLayer = new VectorLayer({
    source: vectorCombiSource,
    style: new Style({
        image: new Circle({
            fill: new Fill({
                color: 'rgb(0,128,0)',
            }),
            radius: 2,
        }),
    }),
});
const vectorSegmntLayer = new VectorLayer({
    source: vectorSegmentSource,
    style: new Style({
        image: new Circle({
            fill: new Fill({
                color: 'rgba(0,0,0,0,0.6)',
            }),
            radius: 2,
        }),
    }),
    zIndex: 50,
});
const clusterKmenasCount = 6;
function ClusterPanel({
    landedOrigin,
    landedCluster,
    dispatch,
}: {
    landedOrigin: Array<TyphoonLandedOrigin>;
    landedCluster: Array<any>;
    dispatch?: Dispatch;
}) {
    const handleKmeansCluster = (): void => {
        if (vectorKmeansSource.getFeatures().length !== 0) {
            if (vectorKmeansLayer.getVisible()) {
                vectorKmeansLayer.setVisible(false);
            } else {
                vectorKmeansLayer.setVisible(true);
            }
        } else {
            const getKmeansResult = kmeans(landedOrigin, clusterKmenasCount);
            const getAllFeatures = getKmeansResult
                .map((item, index) => {
                    return item.map((each) => {
                        const getKey = Object.keys(each)[0];
                        const getFeature = new Feature({
                            geometry: new Point(each[getKey]),
                        });
                        getFeature.setStyle(
                            new Style({
                                image: new Circle({
                                    fill: new Fill({
                                        color: colors[index],
                                    }),
                                    radius: 2,
                                }),
                            })
                        );
                        getFeature.setId(getKey.toString());
                        return getFeature;
                    });
                })
                .reduce((a, b) => {
                    return a.concat(b);
                }, []);
            vectorKmeansSource.addFeatures(getAllFeatures);
            window.LDmap.addLayer(vectorKmeansLayer);
        }
    };
    const handleDbscanCluster = (): void => {
        if (vectorDbscanSource.getFeatures().length !== 0) {
            if (vectorDbscanLayer.getVisible()) {
                vectorDbscanLayer.setVisible(false);
            } else {
                vectorDbscanLayer.setVisible(true);
            }
        } else {
            const getDbscanResult = dbscan(landedOrigin, 0.5, 2);
            const getAllFeatures = getDbscanResult
                .filter((each) => {
                    return each.length > 10;
                })
                .map((item, index) => {
                    return item.map((each) => {
                        const getKey = Object.keys(landedOrigin[each])[0];
                        const eachFeature = new Feature({
                            geometry: new Point(landedOrigin[each][getKey]),
                        });
                        eachFeature.setStyle(
                            new Style({
                                image: new Circle({
                                    fill: new Fill({
                                        color: colors[index],
                                    }),
                                    radius: 2,
                                }),
                            })
                        );
                        return eachFeature;
                    });
                })
                .reduce((a, b) => {
                    return a.concat(b);
                }, []);
            vectorDbscanSource.addFeatures(getAllFeatures);
            window.LDmap.addLayer(vectorDbscanLayer);
        }
    };
    const handleCombinationCluster = (): void => {
        // window.LDmap.on('singleclick', function (e: any) {
        //     if (window.LDmap.hasFeatureAtPixel(e.pixel)) {
        //         const feature = window.LDmap.getFeaturesAtPixel(e.pixel);
        //         console.log(feature);
        //     }
        // });
        if (vectorCombiSource.getFeatures().length !== 0) {
            if (vectorCombinLayer.getVisible()) {
                vectorCombinLayer.setVisible(false);
            } else {
                vectorCombinLayer.setVisible(true);
            }
        } else {
            const getCombineResult = combineCluster(landedOrigin);
            const getSegment = splitSegment();
            const getAllFeatures = getCombineResult
                .map((item, index) => {
                    return item.map((each) => {
                        const getKey = Object.keys(each)[0];
                        const getFeature = new Feature({
                            geometry: new Point(each[getKey]),
                        });
                        getFeature.setStyle(
                            new Style({
                                image: new Circle({
                                    fill: new Fill({
                                        color: colors[index],
                                    }),
                                    radius: 2,
                                }),
                                // text: new Text({
                                //     text: index.toString(),
                                //     offsetX: -3,
                                //     offsetY: -3,
                                //     font: '15px Microsoft YaHei',
                                // }),
                            })
                        );
                        getFeature.setId(getKey.toString());
                        return getFeature;
                    });
                })
                .reduce((a, b) => {
                    return a.concat(b);
                }, []);
            const getClusterSegment = getCombineResult.map((item, index) => {
                return {
                    segment: getSegment[index],
                    data: item,
                };
            });
            dispatch(combineLandedCluster(getClusterSegment));
            vectorCombiSource.addFeatures(getAllFeatures);
            window.LDmap.addLayer(vectorCombinLayer);
        }
    };
    const handleShowSegment = (): void => {
        if (vectorSegmentSource.getFeatures().length !== 0) {
            if (vectorSegmntLayer.getVisible()) {
                vectorSegmntLayer.setVisible(false);
            } else {
                vectorSegmntLayer.setVisible(true);
            }
        } else {
            const segmentFeatures = landedCluster
                .map((item, index) => {
                    const { segment, data } = item;
                    const getRadius = getCircleRadius(data.length);
                    const countFeature = new Feature({
                        geometry: new Point(landedCenterPosition[index]),
                    });
                    countFeature.setStyle(
                        new Style({
                            image: new Circle({
                                radius: getRadius,
                                fill: new Fill({
                                    color: 'rgb(255,193,37)',
                                }),
                            }),
                        })
                    );
                    const linefeature = new Feature({
                        geometry: new LineString(segment),
                    });
                    const pointStartFeature = new Feature({
                        geometry: new Point(segment[0]),
                    });
                    const pointEndFeature = new Feature({
                        geometry: new Point(segment[segment.length - 1]),
                    });
                    linefeature.setStyle(
                        new Style({
                            stroke: new Stroke({
                                width: 2,
                                color: colors[index],
                            }),
                            text: new Text({
                                offsetX: -3,
                                offsetY: -3,
                                font: '15px Microsoft YaHei',
                                text: (index + 1).toString(),
                                fill: new Fill({ color: '#000000' }),
                            }),
                        })
                    );
                    return [
                        pointStartFeature,
                        linefeature,
                        pointEndFeature,
                        countFeature,
                    ];
                })
                .reduce((a, b) => {
                    return a.concat(b);
                }, []);
            vectorSegmentSource.addFeatures(segmentFeatures);
            window.LDmap.addLayer(vectorSegmntLayer);
        }
    };
    return (
        <div className="cluster-groups">
            <button onClick={handleKmeansCluster}>Kmenas聚类</button>
            <button onClick={handleDbscanCluster}>DBSCAN聚类</button>
            <button onClick={handleCombinationCluster}>结合聚类</button>
            <button onClick={handleShowSegment}>分割段</button>
        </div>
    );
}
function mapStateToProps(state: any) {
    const { landedOrigin, landedCluster } = state.typhoonInfo;
    return { landedOrigin, landedCluster };
}

export default connect(mapStateToProps)(ClusterPanel);
