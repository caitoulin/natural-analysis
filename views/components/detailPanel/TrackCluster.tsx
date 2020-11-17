import React from 'react';
import { LANDTRACK } from '../../src/middleware/reducer/typhoonInfo';
import { connect } from 'react-redux';
import {
    getLandedTrackSegment,
    trackSegmentCluster,
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
const vectorTracks = new VectorSource();
const vectorTracksLayer = new VectorLayer({
    source: vectorTracks,
    style: new Style({
        stroke: new Stroke({
            width: 2,
            color: '#319FD3',
        }),
    }),
});
class TrackCluster extends React.Component<IProps> {
    constructor(props: IProps) {
        super(props);
        window.LDmap.addLayer(vectorTracksLayer);
    }
    handleClusterTracks = (index: number) => {
        const { landedCluster, landedTracks } = this.props;
        const landedTracksSegment = getLandedTrackSegment(
            landedCluster,
            landedTracks
        );
        const getIndexTracks = landedTracksSegment[index]['data'];
        const allSegments = trackSegmentCluster(getIndexTracks);
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
    render() {
        const arrButton = [0, 1, 2, 3, 4, 5, 6];
        return (
            <div className="cluster-groups">
                {arrButton.map((item) => {
                    return (
                        <button
                            key={item}
                            onClick={() =>
                                this.handleClusterTracks(item)
                            }>{`分段${item + 1}`}</button>
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
