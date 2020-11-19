import React from 'react';
import { LANDTRACK } from '../../src/middleware/reducer/typhoonInfo';
import { connect } from 'react-redux';
import classNames from 'classnames';
import {
    getLandedTrackSegment,
    trackSegmentCluster,
    lineDbscan,
} from '../../src/util/clusterLandedTrack';
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
}
const colors = [
    'rgb(255,182,193)',
    'rgb(220,20,60)',
    'rgb(255,20,147)',
    'rgb(139,0,139)',
    'rgb(123,104,238)',
    'rgb(0,0,255)',
    'rgb(65,105,225)',
    'rgb(0,191,255)',
    'rgb(47,79,79)',
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
class TrackCluster extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = { index: 12 };
    }
    componentDidMount() {
        const layers = window.LDmap.getLayers().getArray();
        if (!layers.includes(vectorTracksLayer)) {
            window.LDmap.addLayer(vectorTracksLayer);
        }
    }
    handleShowTracks = () => {
        const { index } = this.state;
        const { landedCluster, landedTracks } = this.props;
        const landedTracksSegment = getLandedTrackSegment(
            landedCluster,
            landedTracks
        );
        const getIndexTracks = landedTracksSegment[index]['data'];
        if (vectorTracks.getFeatures().length !== 0) vectorTracks.clear();
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
                    text: new Text({
                        text: Object.keys(item)[0],
                    }),
                    stroke: new Stroke({
                        width: 1,
                        color: 'rgb(38,188,213)',
                    }),
                })
            );
            return eachLineFeature;
        });
        vectorTracks.addFeatures(getIndexFeatures);
    };
    handleShowClusterTracks = () => {
        const { index } = this.state;
        const { landedCluster, landedTracks } = this.props;
        const landedTracksSegment = getLandedTrackSegment(
            landedCluster,
            landedTracks
        );
        const getIndexTracks = landedTracksSegment[index]['data'];
        const allSegments = trackSegmentCluster(getIndexTracks);
        const getClusterLines = lineDbscan(allSegments, 2, 0.5);
        if (vectorTracks.getFeatures().length !== 0) vectorTracks.clear();
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
                                width: 2,
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
        vectorTracks.addFeatures(getAllLineFeatures);
    };
    showDialog = (index: number) => {
        this.setState({ index });
    };
    render() {
        const arrButton = [0, 1, 2, 3, 4, 5, 6];
        const { index } = this.state;
        return (
            <div className="cluster-groups">
                {arrButton.map((item) => {
                    return (
                        <div key={item + '3'}>
                            <button
                                key={item}
                                onClick={() => this.showDialog(item)}>{`分段${
                                item + 1
                            }`}</button>
                            <div
                                className={classNames('show-down', {
                                    'close-down': index !== item,
                                })}>
                                <span onClick={this.handleShowTracks}>
                                    原始轨迹
                                </span>
                                <span onClick={this.handleShowClusterTracks}>
                                    聚类轨迹
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

function mapStateToProps(state: any) {
    const { landedCluster, landedTracks } = state.typhoonInfo;
    return { landedCluster, landedTracks };
}

export default connect(mapStateToProps)(TrackCluster);
