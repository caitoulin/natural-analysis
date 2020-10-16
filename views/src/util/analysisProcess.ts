import { EachPoint } from './handleIndexDB';
export interface WINDCIRCLE {
    sevenCicle: number;
    tenCicle: number;
    twelveCicle: number;
}
function getMaxWindRadiusBySpeed(currentSpeed: number): number {
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
function getSecondWindRadiusBySpeed(currentSpeed: number): number {
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
function getThirdWindRadiusBySpeed(currentSpeed: number): number {
    if (currentSpeed >= 32.6 && currentSpeed < 36.9) return 41;
    if (currentSpeed >= 36.9 && currentSpeed < 41.4) return 50;
    if (currentSpeed >= 41.4 && currentSpeed < 46.1) return 63;
    if (currentSpeed >= 46.1 && currentSpeed < 50.9) return 70;
    if (currentSpeed >= 50.9 && currentSpeed < 55.9) return 83;
    if (currentSpeed >= 55.9 && currentSpeed < 60.9) return 96;
    if (currentSpeed >= 60.9) return 110;
    return 0;
}

/**
 * @param typhoonPoint 台风点
 * 得到7级风圈半径
 */
export function getWindMaxRadius(typhoonPoint: EachPoint): number {
    if (typhoonPoint['windCircle'].length === 0) {
        return getMaxWindRadiusBySpeed(+typhoonPoint['currentSpeed']);
    } else {
        const getRankSeven: Array<number> = typhoonPoint['windCircle'][0]
            .slice(1, 5)
            .map((item: any) => +item);
        return Math.max(...getRankSeven);
    }
}

export function getRankWindCircle(typhoonPoint: EachPoint): WINDCIRCLE {
    if (typhoonPoint['windCircle'].length === 0) {
        return {
            sevenCicle: getMaxWindRadiusBySpeed(+typhoonPoint['currentSpeed']),
            tenCicle: getSecondWindRadiusBySpeed(+typhoonPoint['currentSpeed']),
            twelveCicle: getThirdWindRadiusBySpeed(
                +typhoonPoint['currentSpeed']
            ),
        };
    } else {
        const getValue: Array<number> = typhoonPoint['windCircle'].map(
            (item: any) => {
                const getCircleValue: Array<number> = item
                    .slice(1, 5)
                    .map((value: any) => +value);
                return Math.max(...getCircleValue);
            }
        );
        return {
            sevenCicle: getValue[0],
            tenCicle: getValue.length > 1 ? getValue[1] : 0,
            twelveCicle: getValue.length > 2 ? getValue[2] : 0,
        };
    }
}
