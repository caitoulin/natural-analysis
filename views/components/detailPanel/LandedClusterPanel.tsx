import React from 'react';
import { connect } from 'react-redux';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Fill, Circle, Style } from 'ol/style';
import {
    kmeans,
    dbscan,
    TyphoonLandedOrigin,
} from '../../src/util/clusterLanded';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
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
const clusterKmenasCount = 7;
function ClusterPanel({
    landedOrigin,
}: {
    landedOrigin: Array<TyphoonLandedOrigin>;
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
            const getDbscanResult = dbscan(landedOrigin, 0.3, 2);
            const getAllFeatures = getDbscanResult
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
        if (vectorCombiSource.getFeatures().length !== 0) {
            if (vectorCombinLayer.getVisible()) {
                vectorCombinLayer.setVisible(false);
            } else {
                vectorCombinLayer.setVisible(true);
            }
        } else {
        }
    };
    return (
        <div className="cluster-groups">
            <button onClick={handleKmeansCluster}>Kmenas聚类</button>
            <button onClick={handleDbscanCluster}>DBSCAN聚类</button>
            <button onClick={handleCombinationCluster}>结合聚类</button>
        </div>
    );
}
function mapStateToProps(state: any) {
    const { landedOrigin } = state.typhoonInfo;
    return { landedOrigin };
}

export default connect(mapStateToProps)(ClusterPanel);
