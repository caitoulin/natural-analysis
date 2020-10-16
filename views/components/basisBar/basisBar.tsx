import React from 'react';
import classNames from 'classnames';
import './basis.less';
import '../../src/assets/fonts/iconfont.css';
import { TyphoonLandedOrigin } from '../../src/util/clusterLanded';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Point, LineString } from 'ol/geom';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import Feature from 'ol/Feature';
import { connect } from 'react-redux';
import { EachTyphoon } from '../../src/util/handleIndexDB';
interface Istate {
    isShow: boolean;
}
interface IProps {
    landedOrigin: Array<TyphoonLandedOrigin>;
    tyLists: Array<EachTyphoon>;
}
const vectorSourceLanded = new VectorSource();
const vectorSourceTrack = new VectorSource();
const vectorLayerLanded = new VectorLayer({
    source: vectorSourceLanded,
    style: new Style({
        image: new Circle({
            fill: new Fill({
                color: 'rgba(78,110,242)',
            }),
            radius: 2,
        }),
    }),
});
const vectorLayerTrack = new VectorLayer({
    source: vectorSourceTrack,
    style: new Style({
        image: new Circle({
            fill: new Fill({
                color: 'rgba(78,110,242)',
            }),
            radius: 2,
        }),
        stroke: new Stroke({
            color: '#0F0',
            width: 1,
        }),
    }),
});
class BasisBar extends React.Component<IProps, Istate> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isShow: false,
        };
    }
    handleChangeStatus = (): void => {
        const { isShow } = this.state;
        if (isShow) {
            this.setState({ isShow: false });
        } else {
            this.setState({ isShow: true });
        }
    };
    handleShowLanded = (): void => {
        const { landedOrigin } = this.props;
        if (vectorSourceLanded.getFeatures().length !== 0) {
            if (vectorLayerLanded.getVisible()) {
                vectorLayerLanded.setVisible(false);
            } else {
                vectorLayerLanded.setVisible(true);
            }
        } else {
            const originFeatures = landedOrigin.map((item) => {
                const getKey = Object.keys(item)[0];
                const getPointFeature = new Feature({
                    geometry: new Point(item[getKey]),
                });
                getPointFeature.setStyle(
                    new Style({
                        image: new Circle({
                            radius: 2,
                            fill: new Fill({
                                color: 'orange',
                            }),
                        }),
                    })
                );
                return getPointFeature;
            });
            vectorSourceLanded.addFeatures(originFeatures);
            window.LDmap.addLayer(vectorLayerLanded);
        }
    };
    handleShowAllTracks = (): void => {
        if (vectorSourceTrack.getFeatures().length !== 0) {
            if (vectorLayerTrack.getVisible()) {
                vectorLayerTrack.setVisible(false);
            } else {
                vectorLayerTrack.setVisible(true);
            }
        } else {
            const { tyLists } = this.props;
            const lineFeatures = tyLists
                .map((item) => {
                    const { listInfo, tfdl } = item;
                    const firstPoint = [
                        listInfo[0]['positon']['Lng'],
                        listInfo[0]['positon']['Lat'],
                    ];
                    const getStartPointFeature = new Feature({
                        geometry: new Point(firstPoint),
                    });
                    const getLinePoint = listInfo.map((each) => {
                        return [each['positon']['Lng'], each['positon']['Lat']];
                    });
                    const getLineFeature = new Feature({
                        geometry: new LineString(getLinePoint),
                    });
                    if (tfdl === 1) {
                        getStartPointFeature.setStyle(
                            new Style({
                                image: new Circle({
                                    fill: new Fill({
                                        color: 'rgb(255,0,0)',
                                    }),
                                    radius: 2,
                                }),
                            })
                        );
                        getLineFeature.setStyle(
                            new Style({
                                stroke: new Stroke({
                                    width: 1,
                                    color: 'rgb(38,188,213)',
                                }),
                            })
                        );
                    }
                    return [getStartPointFeature, getLineFeature];
                })
                .reduce((pre, cur) => {
                    return pre.concat(cur);
                }, []);
            vectorSourceTrack.addFeatures(lineFeatures);
            window.LDmap.addLayer(vectorLayerTrack);
        }
    };
    handleShowLandedTracks = (): void => {};
    render() {
        const { isShow } = this.state;
        return (
            <div className="basis-bar">
                <div className="control-bar">
                    <i
                        className="iconfont icon-caidan"
                        onClick={this.handleChangeStatus}></i>
                </div>
                <div
                    className={classNames('show-bar', {
                        'no-show-bar': !isShow,
                    })}>
                    <span onClick={this.handleShowLanded}>登陆点</span>
                    <span onClick={this.handleShowAllTracks}>台风轨迹</span>
                    <span onClick={this.handleShowLandedTracks}>登陆轨迹</span>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state: any) {
    const { landedOrigin, typhoonLists } = state.typhoonInfo;
    return { landedOrigin, tyLists: typhoonLists };
}

export default connect(mapStateToProps)(BasisBar);
