import { SEGMENT } from './clusterLandedTrack';
import CalcBean from './calcBean';
import trackSmooth from './dataSmooth';
import { trackSegmentCluster } from './clusterLandedTrack';
const minLines = 2;
const radius = 0;
export function getAllRerresentTrac(
    getClusterLines: number[][],
    allSegments: SEGMENT[]
) {
    const eachLine = getClusterLines.map((item) => {
        let px = 0;
        let py = 0;
        const points: any = [];
        item.forEach((each) => {
            const getPoints = allSegments[each]['values'];
            px += getPoints[getPoints.length - 1][0] - getPoints[0][0];
            py += getPoints[getPoints.length - 1][1] - getPoints[0][1];
        });
        px /= item.length;
        py /= item.length;
        const l = Math.sqrt(px ** 2 + py ** 2);
        const cosv = px / l;
        const sinv = py / l;
        const lines = rotateAxes(item, allSegments, cosv, sinv, points).sort(
            (a, b) => {
                const v1 = Math.min(a[0][0], a[1][0]);
                const v2 = Math.min(b[0][0], b[1][0]);
                return v1 - v2;
            }
        );
        points.sort((a: any, b: any) => a[0] - b[0]);
        const tra: number[][] = [];
        let preX = 0,
            mark = false;
        points.forEach((point: number[]) => {
            const neighbor = getNeighbor(point, lines);
            if (!mark && neighbor.getCount() >= minLines) {
                const avgy = neighbor.getSumy() / neighbor.getCount();
                //取旋转前的坐标
                const x = point[0] * cosv - avgy * sinv;
                const y =
                    (point[0] + avgy * sinv * cosv - point[0] * cosv * cosv) /
                    sinv;
                tra.push([x, y]);
                preX = point[0];
                mark = true;
            } else if (neighbor.getCount() >= minLines && mark) {
                if (point[0] - preX >= radius) {
                    const avgy = neighbor.getSumy() / neighbor.getCount();
                    //取旋转前的坐标
                    const x = point[0] * cosv - avgy * sinv;
                    const y =
                        (point[0] +
                            avgy * sinv * cosv -
                            point[0] * cosv * cosv) /
                        sinv;
                    tra.push([x, y]);
                    preX = point[0];
                }
            }
        });
        return trackSmooth(tra);
    });
    return eachLine;
}

function getNeighbor(point: number[], lines: number[][][]) {
    const bean = new CalcBean();
    for (let i = 0; i < lines.length; i++) {
        let max = lines[i][0][0],
            min = lines[i][1][0];
        if (max < min) {
            [min, max] = [max, min];
        }
        if (min > point[0]) break;
        if (min < point[0] && max > point[0]) {
            bean.incrementCount();
            bean.incrementSumY(getY(lines[i], point));
        }
    }
    return bean;
}
function getY(line: number[][], point: number[]) {
    const disX = line[0][0] - line[1][0];
    if (disX === 0) return (line[1][1] - line[0][1]) / 2;
    const k = (line[0][1] - line[1][1]) / disX;
    return line[0][1] + k * (point[0] - line[0][0]);
}

/**
 * 返回旋转后的坐标
 * @param item
 * @param allSegments
 * @param cosv
 * @param sinv
 * @param points
 */
function rotateAxes(
    item: number[],
    allSegments: SEGMENT[],
    cosv: number,
    sinv: number,
    points: any
) {
    const getRotateValues = item.map((each) => {
        const startPoint = allSegments[each]['values'][0];
        const endPoint =
            allSegments[each]['values'][allSegments[each]['values'].length - 1];
        const rotateStart = [
            startPoint[0] * cosv + startPoint[1] * sinv,
            -startPoint[0] * sinv + startPoint[1] * cosv,
        ];
        const rotateEnd = [
            endPoint[0] * cosv + endPoint[1] * sinv,
            -endPoint[0] * sinv + endPoint[1] * cosv,
        ];
        points.push(rotateStart);
        points.push(rotateEnd);
        return [rotateStart, rotateEnd];
    });
    return getRotateValues;
}
function rotateAxesSeg(
    allSegments: SEGMENT[],
    cosv: number,
    sinv: number,
    points: any
) {
    const getRotateValues = allSegments.map((each) => {
        const startPoint = each['values'][0];
        const endPoint = each['values'][each['values'].length - 1];
        const rotateStart = [
            startPoint[0] * cosv + startPoint[1] * sinv,
            -startPoint[0] * sinv + startPoint[1] * cosv,
        ];
        const rotateEnd = [
            endPoint[0] * cosv + endPoint[1] * sinv,
            -endPoint[0] * sinv + endPoint[1] * cosv,
        ];
        points.push(rotateStart);
        points.push(rotateEnd);
        return [rotateStart, rotateEnd];
    });
    return getRotateValues;
}

export function clusterTracksRepre(
    getLinesCluster: number[][],
    getIndexTracks: any
) {
    const eachMainTrack = getLinesCluster.map((item) => {
        const eachClusterTracks: any = [];
        item.forEach((each) => {
            eachClusterTracks.push(getIndexTracks[each]);
        });
        const allSegments = trackSegmentCluster(eachClusterTracks);
        let px = 0;
        let py = 0;
        const points: any = [];
        allSegments.forEach((el) => {
            const getPoints = el['values'];
            px += getPoints[getPoints.length - 1][0] - getPoints[0][0];
            py += getPoints[getPoints.length - 1][1] - getPoints[0][1];
        });
        px /= allSegments.length;
        py /= allSegments.length;
        const l = Math.sqrt(px ** 2 + py ** 2);
        const cosv = px / l;
        const sinv = py / l;
        const lines = rotateAxesSeg(allSegments, cosv, sinv, points).sort(
            (a, b) => {
                const v1 = Math.min(a[0][0], a[1][0]);
                const v2 = Math.min(b[0][0], b[1][0]);
                return v1 - v2;
            }
        );
        points.sort((a: any, b: any) => a[0] - b[0]);
        const tra: number[][] = [];
        let preX = 0,
            mark = false;
        points.forEach((point: number[]) => {
            const neighbor = getNeighbor(point, lines);
            if (!mark && neighbor.getCount() >= minLines) {
                const avgy = neighbor.getSumy() / neighbor.getCount();
                //取旋转前的坐标
                const x = point[0] * cosv - avgy * sinv;
                const y =
                    (point[0] + avgy * sinv * cosv - point[0] * cosv * cosv) /
                    sinv;
                tra.push([x, y]);
                preX = point[0];
                mark = true;
            } else if (neighbor.getCount() >= minLines && mark) {
                if (point[0] - preX >= radius) {
                    const avgy = neighbor.getSumy() / neighbor.getCount();
                    //取旋转前的坐标
                    const x = point[0] * cosv - avgy * sinv;
                    const y =
                        (point[0] +
                            avgy * sinv * cosv -
                            point[0] * cosv * cosv) /
                        sinv;
                    tra.push([x, y]);
                    preX = point[0];
                }
            }
        });
        return trackSmooth(tra);
    });
    return eachMainTrack;
}
