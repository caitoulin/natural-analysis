import React from 'react';
import { TyphoonOrigin } from '../../src/util/clusterOrigin';
import { kmeans, dbscan } from '../../src/util/clusterOrigin';
export default function ClusterPanel({
    origin,
}: {
    origin: Array<TyphoonOrigin>;
}) {
    const handleKmeansCluster = (): void => {
        const getCluterResult = kmeans(origin, 5);
    };
    const handleDbscanCluster = (): void => {
        const getCluterResult = dbscan(origin, 2, 2);
    };
    const handleCombinationCluster = (): void => {};
    return (
        <div className="cluster-groups">
            <button onClick={handleKmeansCluster}>Kmenas聚类</button>
            <button onClick={handleDbscanCluster}>DBSCAN聚类</button>
            <button onClick={handleCombinationCluster}>结合聚类</button>
        </div>
    );
}
