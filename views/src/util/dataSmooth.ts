/**
 * 返回平滑后的轨迹
 * @param tra 代表轨迹
 */
export default function trackSmooth(tra: number[][]) {
    if (tra.length < 3) return tra;
    if (tra.length === 3) {
        let px = 0;
        let py = 0;
        tra.forEach((item) => {
            px += item[0];
            py += item[1];
        });
        return [tra[0], [px / 3, py / 3], tra[2]];
    } else {
        const pointX: number[] = [];
        const pointY: number[] = [];
        tra.forEach((item) => {
            pointX.push(item[0]);
            pointY.push(item[1]);
        });
        const smoothPointX = linearSmooth3(pointX);
        const getSmoothPoints = linearSmooth3(pointY).map((item, index) => {
            return [smoothPointX[index], item];
        });
        return getSmoothPoints;
    }
}

function linearSmooth3(data: number[]) {
    const n = data.length;
    if (n < 3) return data;
    if (n > 11) {
        const outData = [];
        outData[0] =
            0.1 * data[0] + 0.3 * data[0] + 0.4 * data[1] + 0.2 * data[3];
        outData[1] =
            0.1 * data[1] + 0.3 * data[2] + 0.4 * data[3] + 0.2 * data[4];
        outData[2] =
            (1.0 * data[0] +
                3.0 * data[1] +
                4.0 * data[2] +
                4.0 * data[3] +
                3.0 * data[4] +
                1.0 * data[5] -
                2.0 * data[6]) /
            14.0;
        for (let i = 3; i < n - 3; i++) {
            outData[i] =
                (data[i - 5] +
                    data[i + 5] +
                    data[i - 4] +
                    data[i + 4] +
                    data[i - 3] +
                    data[i + 3] +
                    (data[i - 2] + data[i + 2]) +
                    (data[i - 1] + data[i + 1]) +
                    data[i]) /
                11;
        }
        outData[n - 3] =
            (1.0 * data[n - 1] +
                3.0 * data[n - 2] +
                4.0 * data[n - 3] +
                4.0 * data[n - 4] +
                3.0 * data[n - 5] +
                1.0 * data[n - 6] -
                2.0 * data[n - 7]) /
            14.0;
        outData[n - 2] =
            (5.0 * data[n - 1] +
                4.0 * data[n - 2] +
                3.0 * data[n - 3] +
                2.0 * data[n - 4] +
                data[n - 5] -
                data[n - 7]) /
            14.0;
        outData[n - 1] =
            (32.0 * data[n - 1] +
                15.0 * data[n - 2] +
                3.0 * data[n - 3] -
                4.0 * data[n - 4] -
                6.0 * data[n - 5] -
                3.0 * data[n - 6] +
                5.0 * data[n - 7]) /
            42.0;
        return outData;
    } else {
        const outData = [];
        outData[0] = (5.0 * data[0] + 2.0 * data[1] - data[2]) / 6.0;
        for (let i = 1; i <= n - 2; i++) {
            outData[i] = (data[i - 1] + data[i] + data[i + 1]) / 3.0;
        }
        outData[n - 1] =
            (5.0 * data[n - 1] + 2.0 * data[n - 2] - data[n - 3]) / 6.0;
        return outData;
    }
}
