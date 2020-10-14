import React from 'react';
import ClusterPanel from './LandedClusterPanel';
import OriginGrid from './OriginGrid';
import './detail.less';
export default function DetailPanel({ index }: { index: string }) {
    const getPanel = (index: string) => {
        switch (index) {
            case '01000':
                return <div></div>;
            case '01001':
                return <div></div>;
            case '01100':
                return <ClusterPanel />;
            case '01101':
                return <OriginGrid />;
            case '11000':
                return <div></div>;
            case '11100':
                return <div></div>;
        }
    };

    return <div className="detail-panel">{getPanel(index)}</div>;
}
