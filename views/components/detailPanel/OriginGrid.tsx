import React from 'react';
import { connect } from 'react-redux';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Fill, Circle, Style, Stroke, Icon, Text } from 'ol/style';
import { EachTyphoon } from '../../src/util/handleIndexDB';
import { TyphoonOrigin, ssDbscan } from '../../src/util/clusterOrigin';
import { LineString, Point } from 'ol/geom';
import * as turf from '@turf/turf';
import { Feature } from 'ol';
import {
    getCircleRadius,
    chooseClusterIndex,
    getRotation,
    getLineWidth,
    caclcuCenter,
} from '../../src/util/analysisProcess';
import { Dispatch } from 'redux';
import { locationIp } from '../../src/util/netRequets';
import { getDividedAreaTY } from '../../src/middleware/action/actions';
import { CLUSTERSEG } from '../../src/middleware/reducer/typhoonInfo';
import GeoJSON from 'ol/format/GeoJSON';
const colors = [
    'rgb(220,20,60)',
    'rgb(255,0,255)',
    'rgb(0,0,205)',
    'rgb(0,191,255)',
    'rgb(0,255,0)',
    'rgb(255,215,0)',
    'rgb(255,69,0)',
    'rgb(131,175,155)',
    'rgb(3,35,14)',
    'rgb(255,0,0)',
    'rgb(105,105,105)',
    'rgb(138,43,226)',
];
const originCenterPosition = [
    [133.31, 14.73],
    [116.41, 16.4],
    [152.98, 15.21],
    [116.59, 10.31],
    [166.37, 6.39],
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
const vectorGridSource = new VectorSource();
const vectorGridLayer = new VectorLayer({
    source: vectorGridSource,
    style: new Style({
        image: new Circle({
            fill: new Fill({
                color: 'rgb(255,255,0)',
            }),
            radius: 2,
        }),
        stroke: new Stroke({
            //边界样式
            color: '#319FD3',
            width: 1,
        }),
    }),
});
const vectorAnalysisiSource = new VectorSource();
const vectorAnalysisiLayer = new VectorLayer({
    source: vectorAnalysisiSource,
    style: new Style({
        image: new Circle({
            fill: new Fill({
                color: 'rgb(255,255,0)',
            }),
            radius: 2,
        }),
        stroke: new Stroke({
            //边界样式
            color: '#319FD3',
            width: 1,
        }),
    }),
});
interface IProps {
    tyLists: Array<EachTyphoon>;
    landedCluster: Array<CLUSTERSEG>;
    dispatch?: Dispatch;
}
interface IState {
    getClusterResult: number[][];
}

class OriginGrid extends React.Component<IProps, IState> {
    handleGetGrid = (): void => {
        if (vectorGridSource.getFeatures().length !== 0) {
            if (vectorGridLayer.getVisible()) {
                vectorGridLayer.setVisible(false);
                vectorAnalysisiLayer.setVisible(false);
            } else {
                vectorGridLayer.setVisible(true);
                vectorAnalysisiLayer.setVisible(true);
            }
        } else {
            const { tyLists } = this.props;
            const getOriginInfo: Array<TyphoonOrigin> = tyLists.map((item) => {
                const { tfbh, tfdl, maxfspeed: maxSpeed, listInfo } = item;
                const position = [
                    listInfo[0]['positon']['Lng'],
                    listInfo[0]['positon']['Lat'],
                ];
                return { tfdl, tfbh, maxSpeed, position };
            });
            const getClusterResult = ssDbscan(
                getOriginInfo,
                2.5,
                20,
                20,
                0.1,
                0.1
            );
            const getAllFeatures = getClusterResult.map((item, index) => {
                const polyConvex: any = [];
                const pointFeatures = item.map((each) => {
                    const getEach = getOriginInfo[each];
                    const getEachFeature = new Feature({
                        geometry: new Point(getEach['position']),
                    });
                    polyConvex.push(turf.point(getEach['position']));
                    getEachFeature.setStyle(
                        new Style({
                            image: new Circle({
                                fill: new Fill({
                                    color: colors[index],
                                }),
                                radius: 2,
                            }),
                        })
                    );
                    return getEachFeature;
                });
                const pointsHull = turf.concave(
                    turf.featureCollection(polyConvex),
                    { units: 'degrees', maxEdge: 3 }
                );
                const format = new GeoJSON();
                const convexFeature = format.readFeature(pointsHull);
                return [pointFeatures, convexFeature];
            });
            const getPointFeatures: any = [];
            const getConvexFeatures: any = [];
            getAllFeatures.forEach((item) => {
                Array.prototype.push.apply(getPointFeatures, item[0]);
                getConvexFeatures.push(item[1]);
            });
            vectorGridSource.addFeatures(getPointFeatures);
            window.LDmap.addLayer(vectorGridLayer);
            vectorAnalysisiSource.addFeatures(getConvexFeatures);
            window.LDmap.addLayer(vectorAnalysisiLayer);
            this.setState({ getClusterResult });
        }
    };
    gridAnalysis = (): void => {
        if (vectorGridSource.getFeatures().length !== 0) {
            if (vectorGridLayer.getVisible()) {
                vectorGridLayer.setVisible(false);
            }
        }
        if (!vectorAnalysisiLayer.getVisible())
            vectorAnalysisiLayer.setVisible(true);
        const { getClusterResult } = this.state;
        const getConvexCenterFeatures = getClusterResult.map((item, index) => {
            const width = getCircleRadius(item.length);
            const eachFeature = new Feature({
                geometry: new Point(originCenterPosition[index]),
            });
            eachFeature.setStyle(
                new Style({
                    image: new Circle({
                        radius: width,
                        fill: new Fill({
                            color: 'rgba(220,20,60)',
                        }),
                    }),
                    text: new Text({
                        font: '12px Calibri,sans-serif',
                        fill: new Fill({
                            color: '#000',
                        }),
                        text: item.length.toString(),
                    }),
                })
            );
            return eachFeature;
        });
        vectorAnalysisiSource.addFeatures(getConvexCenterFeatures);
        const { tyLists, landedCluster } = this.props;
        const getOriginInfo: Array<TyphoonOrigin> = tyLists.map((item) => {
            const { tfbh, tfdl, maxfspeed: maxSpeed, listInfo } = item;
            const position = [
                listInfo[0]['positon']['Lng'],
                listInfo[0]['positon']['Lat'],
            ];
            return { tfdl, tfbh, maxSpeed, position };
        });
        const flattenLandCluster = landedCluster.map((item) => {
            const { data } = item;
            const eachFlatten = Object.assign({}, ...data);
            return eachFlatten;
        });
        const getArrowDirection = getClusterResult.map((item) => {
            const getCluterCount: any = {
                '0': { value: 0, form: [] },
                '1': { value: 0, form: [] },
                '2': { value: 0, form: [] },
                '3': { value: 0, form: [] },
                '4': { value: 0, form: [] },
                '5': { value: 0, form: [] },
                '6': { value: 0, form: [] },
            };
            item.forEach((each) => {
                const { tfbh, tfdl } = getOriginInfo[each];
                if (tfdl === 0) return;
                const [getIndex, landtfbh] = chooseClusterIndex(
                    flattenLandCluster,
                    tfbh.toString()
                );
                if (getIndex) {
                    getCluterCount[getIndex]['value'] =
                        getCluterCount[getIndex]['value'] + 1;
                    getCluterCount[getIndex]['form'].push(landtfbh);
                }
            });
            return getCluterCount;
        });
        const { dispatch } = this.props;
        const getDividedAreaLand = getArrowDirection.map((item) => {
            return {
                '0': item['0']['form'],
                '1': item['1']['form'],
                '2': item['2']['form'],
                '3': item['3']['form'],
                '4': item['4']['form'],
                '5': item['5']['form'],
                '6': item['6']['form'],
            };
        });
        const getDividedArea = {
            '0': { C: getDividedAreaLand[0]['0'] },
            '1': {
                C: getDividedAreaLand[0]['1'],
                A: getDividedAreaLand[1]['1'],
            },
            '2': {
                C: getDividedAreaLand[0]['2'],
                A: getDividedAreaLand[1]['2'],
            },
        };
        dispatch(getDividedAreaTY(getDividedArea));
        const getArrowFeatures = getArrowDirection
            .map((item, index) => {
                const getIndexCoor = originCenterPosition[index];
                const allKeyFeatures: any = [];
                for (const [key, value] of Object.entries(item)) {
                    if (value['value'] === 0) continue;
                    const transKey = parseInt(key);
                    const rotation = getRotation(
                        getIndexCoor,
                        landedCenterPosition[transKey]
                    );
                    const getCenter = caclcuCenter(
                        getIndexCoor,
                        landedCenterPosition[transKey]
                    );
                    const feature = new Feature({
                        geometry: new LineString([
                            getIndexCoor,
                            landedCenterPosition[transKey],
                        ]),
                    });
                    feature.setStyle([
                        new Style({
                            stroke: new Stroke({
                                width: getLineWidth(value['value']),
                                color: 'rgb(38,188,213)',
                            }),
                        }),
                        new Style({
                            geometry: new Point(getCenter),
                            image: new Icon({
                                src: locationIp + '/public/images/arrow.png',
                                anchor: [0.75, 0.5],
                                rotateWithView: true,
                                rotation: -rotation,
                            }),
                            text: new Text({
                                offsetX: -2,
                                offsetY: -2,
                                font: '12px Microsoft YaHei',
                                text: value['value'].toString(),
                                fill: new Fill({ color: '#000000' }),
                            }),
                        }),
                    ]);
                    allKeyFeatures.push(feature);
                }
                return allKeyFeatures;
            })
            .reduce((a, b) => a.concat(b), []);
        vectorAnalysisiSource.addFeatures(getArrowFeatures);
    };

    render() {
        return (
            <div className="cluster-groups">
                <button onClick={this.handleGetGrid}>起源点格网</button>
                <button onClick={this.gridAnalysis}>网络分析</button>
            </div>
        );
    }
}

function mapStateToProps(state: any) {
    const { typhoonLists, landedCluster } = state.typhoonInfo;
    return { tyLists: typhoonLists, landedCluster };
}

export default connect(mapStateToProps)(OriginGrid);
