export interface TyphoonOrigin {
    maxSpeed: number;
    position: Array<number>;
    tfdl: number;
    tfbh: string;
}
interface Neighbor {
    DP: number;
    neighbors: Array<number>;
    S: number;
}

function spDist(a: TyphoonOrigin, b: TyphoonOrigin) {
    return Math.sqrt(
        Math.pow(a['position'][0] - b['position'][0], 2) +
            Math.pow(a['position'][1] - b['position'][1], 2)
    );
}

function rankDist(a: TyphoonOrigin, maxSpeed: number) {
    return Math.abs(a['maxSpeed'] - maxSpeed);
}

function retrieveNeighbors(
    eps1: number,
    eps2: number,
    point: TyphoonOrigin,
    cluster: Array<TyphoonOrigin>,
    maxSpeed: number
): Neighbor {
    const neighbors = []; // list of neighbor
    let m = 0;
    let n = 0;
    let DP = 0;
    let S = 0;
    for (let iter = 0; iter < cluster.length; iter++) {
        const dist1 = spDist(point, cluster[iter]);
        const dist2 = rankDist(point, maxSpeed);
        if (dist1 <= eps1) {
            neighbors.push(iter);
            if (cluster[iter]['tfdl'] === 1) {
                m++;
            }
            if (dist2 <= eps2) {
                n++;
            }
        }
    }
    DP = m / neighbors.length;
    S = n / neighbors.length;
    return { neighbors, DP, S };
}

export function ssDbscan(
    result: Array<TyphoonOrigin>,
    eps1: number,
    eps2: number,
    minPoints: number,
    deltae: number,
    deltas: number
) {
    let clusterLabel = 0; // label meaning: 0:unmarked; 1,2,3,...:cluster label; "noise":noise
    const labels = new Array(result.length).fill(0); // new an 0 array to store labels
    const clusters = []; // final output
    let currentDp = 0;
    const cuc: number[] = [];
    // clustering data points
    for (let i = 0; i < result.length; i++) {
        if (!cuc.includes(i)) {
            const maxSpeed = result[i]['maxSpeed'];
            const { neighbors, DP, S: S1 } = retrieveNeighbors(
                eps1,
                eps2,
                result[i],
                result,
                maxSpeed
            );
            if (neighbors.length < minPoints) {
                // if it is unmarked, mark it "noise"
                if (labels[i] === 0) {
                    labels[i] = 'noise';
                }
            } else {
                clusterLabel += 1; // construct a new cluster
                const cluster = []; // construct cluster
                currentDp = DP;
                // mark label for all unmarked neighbors
                for (let j1 = 0; j1 < neighbors.length; j1++) {
                    // if no other labels
                    if (
                        labels[neighbors[j1]] === 0 ||
                        labels[neighbors[j1]] === 'noise'
                    ) {
                        labels[neighbors[j1]] = clusterLabel;
                        cluster.push(neighbors[j1]);
                        cuc.push(neighbors[j1]);
                    }
                }

                // check the sub-circle of all objects
                while (neighbors.length !== 0) {
                    const j2 = neighbors.pop();
                    const {
                        neighbors: subNeighbors,
                        DP,
                        S: S2,
                    } = retrieveNeighbors(
                        eps1,
                        eps2,
                        result[j2],
                        result,
                        maxSpeed
                    );

                    // mark all unmarked neighbors
                    if (
                        subNeighbors.length >= minPoints &&
                        Math.abs(currentDp - DP) < deltae &&
                        Math.abs(S2 - S1) <= deltas
                    ) {
                        for (let k = 0; k < subNeighbors.length; k++) {
                            // if no other labels
                            if (
                                labels[subNeighbors[k]] === 0 ||
                                labels[subNeighbors[k]] === 'noise'
                            ) {
                                neighbors.push(subNeighbors[k]);
                                labels[subNeighbors[k]] = clusterLabel;
                                cluster.push(subNeighbors[k]);
                                cuc.push(subNeighbors[k]);
                            }
                        }
                    }
                }

                // remove cluster of small size
                if (cluster.length < minPoints) {
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
    }

    return clusters;
}
