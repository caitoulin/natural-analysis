function clustrLandedOrigin(landTyphoonList) {
    const landOrigin = Object.entries(landTyphoonList).map(([key, item]) => {
        return item.position;
    });
    return landOrigin;
}

exports.clustrLandedOrigin = clustrLandedOrigin;
