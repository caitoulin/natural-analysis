function clustrOrigin(landTyphoonList) {
    const landOrigin = Object.entries(landTyphoonList).map(([key, item]) => {
        return item.position;
    });
    return landOrigin;
}

exports.clustrOrigin = clustrOrigin;
