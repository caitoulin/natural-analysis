import React from 'react';
import { LANDTRACK } from '../../src/middleware/reducer/typhoonInfo';
import { connect } from 'react-redux';
import { getLandedTrackSegment } from '../../src/util/clusterLandedTrack';

interface IProps {
    landedCluster: Array<any>;
    landedTracks: Array<LANDTRACK>;
}
class TrackCluster extends React.Component<IProps> {
    handleClusterTracks = (index: number) => {
        const { landedCluster, landedTracks } = this.props;
        const landedTracksSegment = getLandedTrackSegment(
            landedCluster,
            landedTracks
        );
        const getIndexSegment = landedTracksSegment[index];
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
