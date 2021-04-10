import React from 'react';
import ClusterPanel from './LandedClusterPanel';
import OriginGrid from './OriginGrid';
import InfluencedIndex from './InfluencedIndex';
import TrackDensity from './TrackDensity';
import TrackCluster from './TrackCluster';
import classNames from 'classnames';
import './detail.less';
import BasisBar from '../basisBar/basisBar';
export default function DetailPanel({ index }: { index: string }) {
    const getPanel = (index: string) => {
        console.log(index);
        switch (index) {
            case '11000':
                return <InfluencedIndex />;
            case '01':
                return <BasisBar />;
            case '11100':
                return <ClusterPanel />;
            case '11101':
                return <OriginGrid />;
            case '21000':
                return <TrackDensity />;
            case '21100':
                return <TrackCluster />;
        }
    };

    return (
        <div className={classNames({ 'detail-panel': !!index })}>
            {getPanel(index)}
        </div>
    );
}
