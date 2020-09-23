//// test data with latitude and longitude

// spatial distance
function sp_dist(a, b) {
    return Math.sqrt(
        Math.pow(a['y'] - b['y'], 2) + Math.pow(a['x'] - b['x'], 2)
    );
    return d;
}

// retrieve list of neighbors
function retrieve_neighbors(eps, point, cluster) {
    var neighbors = []; // list of neighbor
    for (var iter = 0; iter < cluster.length; iter++) {
        var dist = sp_dist(point, cluster[iter]);
        //        var dist2 = tp_dist(point, cluster[iter]);
        if (dist <= eps) {
            neighbors.push(iter);
        }
    }
    return neighbors;
}

// main function
function dbscan(result, eps, MinPts) {
    var cluster_label = 0; // label meaning: 0:unmarked; 1,2,3,...:cluster label; "noise":noise
    var labels = new Array(result.length).fill(0); // new an 0 array to store labels
    var clusters = []; // final output

    // clustering data points
    for (var i = 0; i < result.length; i++) {
        var neighbors = retrieve_neighbors(eps, result[i], result);

        if (neighbors.length < MinPts) {
            // if it is unmarked, mark it "noise"
            if (labels[i] === 0) {
                labels[i] = 'noise';
            }
        } else {
            cluster_label += 1; // construct a new cluster
            var cluster = []; // construct cluster

            // mark label for all unmarked neighbors
            for (var j1 = 0; j1 < neighbors.length; j1++) {
                // if no other labels
                if (
                    labels[neighbors[j1]] === 0 ||
                    labels[neighbors[j1]] === 'noise'
                ) {
                    labels[neighbors[j1]] = cluster_label;
                    cluster.push(neighbors[j1]);
                }
            }

            // check the sub-circle of all objects
            while (neighbors.length !== 0) {
                var j2;
                j2 = neighbors.pop();
                var sub_neighbors = retrieve_neighbors(eps, result[j2], result);

                // mark all unmarked neighbors
                if (sub_neighbors.length >= MinPts) {
                    for (var k = 0; k < sub_neighbors.length; k++) {
                        // if no other labels
                        if (
                            labels[sub_neighbors[k]] === 0 ||
                            labels[sub_neighbors[k]] === 'noise'
                        ) {
                            neighbors.push(sub_neighbors[k]);
                            labels[sub_neighbors[k]] = cluster_label;
                            cluster.push(sub_neighbors[k]);
                        }
                    }
                }
            }

            // remove cluster of small size
            if (cluster.length < MinPts) {
                for (var j3 = 0; j3 < result.length; j3++) {
                    if (labels[j3] === cluster_label) {
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
exports.dbscan = dbscan;
