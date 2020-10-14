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
            if (getDist(centroids[j], oldCentroids[j]) > 0.05) {
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
            Math.pow(center[1] - center[1], 2)
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
