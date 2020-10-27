export interface TyphoonLandedOrigin {
    [key: string]: number[];
}

export function kmeans(
    arrayToProcess: Array<TyphoonLandedOrigin>,
    clustersCount: number
) {
    const groups: Array<Array<TyphoonLandedOrigin>> = [];
    const centroids = [];
    let oldCentroids = [];
    let changed = false;
    for (let initGroups = 0; initGroups < clustersCount; initGroups++) {
        groups[initGroups] = [];
    }
    const initialCentroids = Math.round(
        arrayToProcess.length / (clustersCount + 1)
    );
    for (let i = 0; i < clustersCount; i++) {
        const getKey = Object.keys(
            arrayToProcess[initialCentroids * (i + 1)]
        )[0];
        centroids[i] = arrayToProcess[initialCentroids * (i + 1)][getKey];
    }
    do {
        for (let i = 0; i < clustersCount; i++) {
            groups[i] = [];
        }

        changed = false;

        for (let i = 0; i < arrayToProcess.length; i++) {
            let distance = -1;
            let oldDistance = -1;
            let newGroup;
            for (let j = 0; j < clustersCount; j++) {
                distance = spDistance(centroids[j], arrayToProcess[i]);
                if (oldDistance == -1) {
                    oldDistance = distance;
                    newGroup = j;
                } else if (distance <= oldDistance) {
                    newGroup = j;
                    oldDistance = distance;
                }
            }

            groups[newGroup].push(arrayToProcess[i]);
        }

        oldCentroids = centroids.slice();

        for (let j = 0; j < clustersCount; j++) {
            centroids[j] = caculateNewCenter(groups[j]);
        }

        for (let j = 0; j < clustersCount; j++) {
            if (getDist(centroids[j], oldCentroids[j]) > 0.02) {
                changed = true;
            }
        }
    } while (changed === true);

    return groups;
}

function spDistance(center: number[], point: TyphoonLandedOrigin) {
    const getPointKey = Object.keys(point)[0];
    const getPointPosition = point[getPointKey];
    return Math.sqrt(
        Math.pow(center[0] - getPointPosition[0], 2) +
            Math.pow(center[1] - getPointPosition[1], 2)
    );
}

function caculateNewCenter(eachGroup: Array<TyphoonLandedOrigin>) {
    const getSum = eachGroup.reduce(
        (a, b) => {
            const getPosition = b[Object.keys(b)[0]];
            return [a[0] + getPosition[0], a[1] + getPosition[1]];
        },
        [0, 0]
    );
    return [
        +(getSum[0] / eachGroup.length).toFixed(3),
        +(getSum[1] / eachGroup.length).toFixed(3),
    ];
}

export function spDist(a: TyphoonLandedOrigin, b: TyphoonLandedOrigin) {
    const getOneKey = Object.keys(a)[0];
    const getTwoKey = Object.keys(b)[0];
    return Math.sqrt(
        Math.pow(a[getOneKey][0] - b[getTwoKey][0], 2) +
            Math.pow(a[getOneKey][1] - b[getTwoKey][1], 2)
    );
}
function getDist(a: number[], b: number[]) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}
function retrieveNeighbors(
    eps: number,
    point: TyphoonLandedOrigin,
    cluster: Array<TyphoonLandedOrigin>
) {
    const neighbors = []; // list of neighbor
    for (let iter = 0; iter < cluster.length; iter++) {
        const dist = spDist(point, cluster[iter]);
        if (dist <= eps) {
            neighbors.push(iter);
        }
    }
    return neighbors;
}

export function dbscan(
    result: Array<TyphoonLandedOrigin>,
    eps: number,
    MinPts: number
) {
    let clusterLabel = 0; // label meaning: 0:unmarked; 1,2,3,...:cluster label; "noise":noise
    const labels = new Array(result.length).fill(0); // new an 0 array to store labels
    const clusters = []; // final output

    // clustering data points
    for (let i = 0; i < result.length; i++) {
        const neighbors = retrieveNeighbors(eps, result[i], result);
        if (neighbors.length < MinPts) {
            // if it is unmarked, mark it "noise"
            if (labels[i] === 0) {
                labels[i] = 'noise';
            }
        } else {
            clusterLabel += 1; // construct a new cluster
            const cluster = []; // construct cluster

            // mark label for all unmarked neighbors
            for (let j1 = 0; j1 < neighbors.length; j1++) {
                // if no other labels
                if (
                    labels[neighbors[j1]] === 0 ||
                    labels[neighbors[j1]] === 'noise'
                ) {
                    labels[neighbors[j1]] = clusterLabel;
                    cluster.push(neighbors[j1]);
                }
            }

            // check the sub-circle of all objects
            while (neighbors.length !== 0) {
                const j2 = neighbors.pop();
                const subNeighbors = retrieveNeighbors(eps, result[j2], result);

                // mark all unmarked neighbors
                if (subNeighbors.length >= MinPts) {
                    for (let k = 0; k < subNeighbors.length; k++) {
                        // if no other labels
                        if (
                            labels[subNeighbors[k]] === 0 ||
                            labels[subNeighbors[k]] === 'noise'
                        ) {
                            neighbors.push(subNeighbors[k]);
                            labels[subNeighbors[k]] = clusterLabel;
                            cluster.push(subNeighbors[k]);
                        }
                    }
                }
            }

            // remove cluster of small size
            if (cluster.length < MinPts) {
                for (let j3 = 0; j3 < result.length; j3++) {
                    if (labels[j3] === clusterLabel) {
                        labels[j3] = 'noise';
                    }
                }
            } else {
                clusters.push(cluster);
            }
        }
    }

    return clusters;
}

/**
 * @param arrayToProcess 聚类的点
 * 返回混合聚类的值
 */
export function combineCluster(arrayToProcess: Array<TyphoonLandedOrigin>) {
    const getDbscanResult = dbscan(arrayToProcess, 0.5, 2).filter(
        (each) => each.length > 10
    );
    const getLongRepeatCluster = getDbscanResult[0].map((item) => {
        return arrayToProcess[item];
    });
    const getShortResult = getDbscanResult[1].map((item) => {
        return arrayToProcess[item];
    });
    const remainPoint = arrayToProcess.filter((item, index) => {
        return !getDbscanResult.reduce((a, b) => a.concat(b)).includes(index);
    });
    const getRepeatKemeansCluestr = kmeans(getLongRepeatCluster, 4);
    const getRemainKemeansCluestr = kmeans(remainPoint, 4);
    getRepeatKemeansCluestr.push(getRemainKemeansCluestr[2]); // 2与3类符合规则点数大于12个
    getRepeatKemeansCluestr.push(getRemainKemeansCluestr[3]);
    const getTwoCluster = kmeans(getRemainKemeansCluestr[0], 2);
    Array.prototype.push.apply(getShortResult, getTwoCluster[0]);
    getRepeatKemeansCluestr.push(getShortResult);
    getRepeatKemeansCluestr.push(getTwoCluster[1]);
    return getRepeatKemeansCluestr;
}

export function splitSegment() {
    const getSegment = [];
    getSegment[0] = [
        [118.1, 24.05],
        [119.93, 25.49],
        [122.01, 28.94],
    ];
    getSegment[1] = [
        [114.22, 22.07],
        [116.52, 22.9],
        [118.1, 24.05],
    ];
    getSegment[2] = [
        [110.6, 21.12],
        [114.22, 22.07],
    ];
    getSegment[3] = [
        [108.41, 18.7],
        [109.57, 18.11],
        [111.12, 19.65],
        [110.6, 21.12],
    ];
    getSegment[4] = [
        [120.64, 34.18],
        [122.77, 37.32],
        [121.66, 38.82],
        [124.15, 39.77],
    ];
    getSegment[5] = [
        [122.01, 28.94],
        [122.6, 30.99],
        [120.64, 34.18],
    ];
    getSegment[6] = [
        [120.04, 23.62],
        [119.91, 22.78],
        [120.75, 21.86],
        [122.08, 25.15],
    ];
    getSegment[7] = [
        [108.09, 21.52],
        [109.17, 21.37],
        [109.93, 20.2],
    ];
    return getSegment;
}
