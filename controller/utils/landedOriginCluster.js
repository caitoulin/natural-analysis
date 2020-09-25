function landedOrigin(landTyphoonList) {
    const landOrigin = Object.entries(landTyphoonList).map(([key, item]) => {
        return { [key]: item.position };
    });
    return landOrigin;
}

exports.landedOrigin = landedOrigin;
