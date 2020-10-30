function getMaxWindRadiusBySpeed(currentSpeed) {
    if (currentSpeed >= 14 && currentSpeed < 17.2) return 171;
    if (currentSpeed >= 17.2 && currentSpeed < 20.7) return 186;
    if (currentSpeed >= 20.7 && currentSpeed < 24.4) return 210;
    if (currentSpeed >= 24.4 && currentSpeed < 28.4) return 229;
    if (currentSpeed >= 28.4 && currentSpeed < 32.6) return 243;
    if (currentSpeed >= 32.6 && currentSpeed < 36.9) return 265;
    if (currentSpeed >= 36.9 && currentSpeed < 41.4) return 292;
    if (currentSpeed >= 41.4 && currentSpeed < 46.1) return 311;
    if (currentSpeed >= 46.1 && currentSpeed < 50.9) return 336;
    if (currentSpeed >= 50.9 && currentSpeed < 55.9) return 366;
    if (currentSpeed >= 55.9 && currentSpeed < 60.9) return 386;
    if (currentSpeed >= 60.9) return 410;
    return 0;
}
function getSecondWindRadiusBySpeed(currentSpeed) {
    if (currentSpeed >= 24.4 && currentSpeed < 28.4) return 54;
    if (currentSpeed >= 28.4 && currentSpeed < 32.6) return 68;
    if (currentSpeed >= 32.6 && currentSpeed < 36.9) return 94;
    if (currentSpeed >= 36.9 && currentSpeed < 41.4) return 111;
    if (currentSpeed >= 41.4 && currentSpeed < 46.1) return 126;
    if (currentSpeed >= 46.1 && currentSpeed < 50.9) return 140;
    if (currentSpeed >= 50.9 && currentSpeed < 55.9) return 166;
    if (currentSpeed >= 55.9 && currentSpeed < 60.9) return 186;
    if (currentSpeed >= 60.9) return 209;
    return 0;
}
function getThirdWindRadiusBySpeed(currentSpeed) {
    if (currentSpeed >= 32.6 && currentSpeed < 36.9) return 41;
    if (currentSpeed >= 36.9 && currentSpeed < 41.4) return 50;
    if (currentSpeed >= 41.4 && currentSpeed < 46.1) return 63;
    if (currentSpeed >= 46.1 && currentSpeed < 50.9) return 70;
    if (currentSpeed >= 50.9 && currentSpeed < 55.9) return 83;
    if (currentSpeed >= 55.9 && currentSpeed < 60.9) return 96;
    if (currentSpeed >= 60.9) return 110;
    return 0;
}

function getRankWindCircle(typhoonPoint) {
    if (typhoonPoint['windCircle'].length === 0) {
        return {
            sevenCicle: getMaxWindRadiusBySpeed(+typhoonPoint['currentSpeed']),
            tenCicle: getSecondWindRadiusBySpeed(+typhoonPoint['currentSpeed']),
            twelveCicle: getThirdWindRadiusBySpeed(
                +typhoonPoint['currentSpeed']
            ),
        };
    } else {
        const getValue = typhoonPoint['windCircle'].map((item) => {
            const getCircleValue = item.slice(1, 5).map((value) => +value);
            return Math.max(...getCircleValue);
        });
        return {
            sevenCicle: getValue[0],
            tenCicle: getValue.length > 1 ? getValue[1] : 0,
            twelveCicle: getValue.length > 2 ? getValue[2] : 0,
        };
    }
}

function getInterpolationPoints(prePoint, curPoint) {
    const getprePointCircle = getRankWindCircle(prePoint);
    const getcurPointCircle = getRankWindCircle(curPoint);
    const n = 2;
    const coorXDeviation = [
        curPoint['positon']['Lng'] - prePoint['positon']['Lng'],
        curPoint['positon']['Lat'] - prePoint['positon']['Lat'],
    ];
    const proDeviation = [
        curPoint['currentSpeed'] - prePoint['currentSpeed'],
        getcurPointCircle['sevenCicle'] - getprePointCircle['sevenCicle'],
        getcurPointCircle['tenCicle'] - getprePointCircle['tenCicle'],
        getcurPointCircle['twelveCicle'] - getprePointCircle['twelveCicle'],
    ];
    const getArray = new Array(n).fill('').map((item, index) => {
        const coorX =
            (coorXDeviation[0] * (index + 1)) / (n + 1) +
            prePoint['positon']['Lng'];
        const coorY =
            (coorXDeviation[1] * (index + 1)) / (n + 1) +
            prePoint['positon']['Lat'];
        const currentSpeed =
            (proDeviation[0] * (index + 1)) / (n + 1) +
            prePoint['currentSpeed'];
        const windCircle = {
            sevenCicle: Math.floor(
                (proDeviation[1] * (index + 1)) / (n + 1) +
                    getprePointCircle['sevenCicle']
            ),
            tenCicle: Math.floor(
                (proDeviation[2] * (index + 1)) / (n + 1) +
                    getprePointCircle['tenCicle']
            ),
            twelveCicle: Math.floor(
                (proDeviation[3] * (index + 1)) / (n + 1) +
                    getprePointCircle['tenCicle']
            ),
        };
        return { coordinate: [coorX, coorY], currentSpeed, windCircle };
    });
    return getArray;
}

function circleBoundary(
    coordinate,
    grids,
    circle,
    extent,
    grid,
    eachRad,
    value
) {
    const boundRightLng = coordinate[0] + circle / eachRad;
    const boundRightLat = coordinate[1] + circle / eachRad;
    const boundLeftLng = coordinate[0] - circle / eachRad;
    const boundLeftLat = coordinate[1] - circle / eachRad;
    if (boundLeftLng < 98) return;
    if (boundLeftLat < 3) return;
    if (boundRightLat > 83) return;
    if (boundRightLng > 178) return;
    const leftX = Math.floor((boundLeftLng - extent[0][0]) / grid[0]);
    const leftY = Math.floor((boundLeftLat - extent[0][1]) / grid[0]);
    const rightX = Math.floor((boundRightLng - extent[0][0]) / grid[0]);
    const rightY = Math.floor((boundRightLat - extent[0][1]) / grid[0]);
    for (let i = leftX; i < rightX; i++) {
        for (let j = leftY; j <= rightY; j++) {
            grids[i][j] = grids[i][j] + value;
        }
    }
}
function calcuIndex(allTyphoons) {
    const extent = [
        [98, 3],
        [178, 83],
    ];
    const grid = [0.1, 0.1];
    const eachRad = 111;
    const width = (extent[1][0] - extent[0][0]) / grid[0];
    const height = (extent[1][1] - extent[0][1]) / grid[1];
    const grids = [];
    for (let i = 0; i < width; i++) {
        grids[i] = [];
        for (let j = 0; j < height; j++) {
            grids[i][j] = 0;
        }
    }
    allTyphoons.forEach((each) => {
        const { listInfo } = each;
        listInfo.forEach((element) => {
            const getWindCircle = getRankWindCircle(element);
            const {
                positon: { Lat, Lng },
            } = element;
            const { sevenCicle, tenCicle, twelveCicle } = getWindCircle;
            if (sevenCicle !== 0) {
                circleBoundary(
                    [Lng, Lat],
                    grids,
                    sevenCicle,
                    extent,
                    grid,
                    eachRad,
                    1
                );
            }
            if (tenCicle !== 0) {
                circleBoundary(
                    [Lng, Lat],
                    grids,
                    tenCicle,
                    extent,
                    grid,
                    eachRad,
                    2
                );
            }
            if (twelveCicle !== 0) {
                circleBoundary(
                    [Lng, Lat],
                    grids,
                    twelveCicle,
                    extent,
                    grid,
                    eachRad,
                    3
                );
            }
        });
        for (let i = 0; i < listInfo.length - 1; i++) {
            const getArrayPoint = getInterpolationPoints(
                listInfo[i],
                listInfo[i + 1]
            );
            getArrayPoint.forEach((item) => {
                const {
                    coordinate,
                    windCircle: { sevenCicle, tenCicle, twelveCicle },
                } = item;
                if (sevenCicle !== 0) {
                    circleBoundary(
                        coordinate,
                        grids,
                        sevenCicle,
                        extent,
                        grid,
                        eachRad,
                        1
                    );
                }
                if (tenCicle !== 0) {
                    circleBoundary(
                        coordinate,
                        grids,
                        tenCicle,
                        extent,
                        grid,
                        eachRad,
                        2
                    );
                }
                if (twelveCicle !== 0) {
                    circleBoundary(
                        coordinate,
                        grids,
                        twelveCicle,
                        extent,
                        grid,
                        eachRad,
                        3
                    );
                }
            });
        }
    });

    return grids;
}

exports.calcuIndex = calcuIndex;
