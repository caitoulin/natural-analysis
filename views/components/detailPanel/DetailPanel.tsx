import React from 'react';
import ClusterPanel from './ClusterPanel';
import './detail.less';
import { TyphoonOrigin } from '../../src/util/clusterOrigin';
export default function DetailPanel({
    index,
    origin,
}: {
    index: string;
    origin: Array<TyphoonOrigin>;
}) {
    const getPanel = (index: string) => {
        switch (index) {
            case '01000':
                return <div></div>;
            case '01001':
                return <div></div>;
            case '01100':
                return <ClusterPanel origin={origin} />;
            case '01101':
                return <div></div>;
            case '11000':
                return <div></div>;
            case '11100':
                return <div></div>;
        }
    };

    return <div className="detail-panel">{getPanel(index)}</div>;
}
