import React from 'react';
import echarts from 'echarts';
import ecStat from 'echarts-stat';
interface IProps {
    index: string;
    indexKey: Grid;
}
export default class IndexChart extends React.Component<IProps> {
    indexChart: any;
    myChart: any;
    constructor(props: IProps) {
        super(props);
        this.myChart = '';
    }
    componentDidUpdate() {
        const { index, indexKey } = this.props;
        if (!index || !indexKey || !indexKey[index]) return;
        if (!this.myChart) {
            this.myChart = echarts.init(this.indexChart);
        }
        this.myChart.clear();
        const xValues = new Array(70).fill(0).map((item, index) => {
            return index + 1949;
        });
        const yValues = xValues.map((item) => {
            const key = item.toString();
            if (indexKey[index][key]) return indexKey[index][key];
            return 0;
        });
        const linerData = xValues.map((item, index) => {
            return [item, yValues[index]];
        });
        const linerRegression = ecStat.regression('linear', linerData, 1);
        linerRegression.points.sort(function (a, b) {
            return a[0] - b[0];
        });
        const polyRegression = ecStat.regression('polynomial', linerData, 3);
        polyRegression.points.sort(function (a, b) {
            return a[0] - b[0];
        });
        const options = {
            title: {
                text: '台风产生及登陆数量',
                left: 'center',
                textStyle: {
                    color: 'black',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    fontSize: 16,
                },
                show: false,
            },
            legend: {
                textStyle: {
                    color: 'black',
                },
                x: 'right',
                itemHeight: 1,
                itemWidth: 10,
                data: ['三次曲线', '线性趋势'],
                padding: [30, 0, 0, 0],
            },
            toolbox: {
                show: true,
                orient: 'horizontal',
                itemSize: 15,
                itemGap: 10,
                feature: {
                    show: true,
                    dataView: {
                        readOnly: false,
                    },
                    magicType: {
                        type: ['bar', 'line'],
                    },
                    saveAsImage: {
                        name: '趋势图',
                        type: 'png',
                        title: '保存为图片',
                        pixelRatio: 15,
                        excludeComponent: ['toolbox'], // 下载文件时不显示工具栏
                    },
                },
            },
            xAxis: [
                {
                    type: 'category',
                    data: xValues,
                    axisLabel: {
                        showMaxLabel: true,
                    },
                    name: '年份',
                    splitLine: {
                        show: false,
                    },
                },
            ],
            yAxis: [
                {
                    type: 'value',
                    name: '数量',
                    splitLine: {
                        show: false,
                    },
                },
            ],
            color: ['#4472C5', '#ED7C30', '#80FF80', '#FF8096', '#800080'],
            series: [
                {
                    name: '产生数',
                    type: 'bar',
                    barWidth: '40%',
                    data: yValues,
                },
                {
                    name: '三次曲线',
                    type: 'line',
                    showSymbol: false,
                    lineStyle: {
                        //  type: 'dashed',
                        width: 1,
                    },
                    data: polyRegression.points.map((item) =>
                        item[1] > 0 ? item[1] : 0
                    ),
                },
                {
                    name: '线性趋势',
                    type: 'line',
                    showSymbol: false,
                    lineStyle: {
                        //  type: 'dashed',
                        width: 1,
                    },
                    data: linerRegression.points.map((item) =>
                        item[1] > 0 ? item[1] : 0
                    ),
                },
            ],
        };
        this.myChart.setOption(options);
    }
    render() {
        const { index, indexKey } = this.props;
        if (!indexKey[index]) {
            this.myChart = '';
            return null;
        }
        return (
            <div
                ref={(ref) => (this.indexChart = ref)}
                className="index-chart"
                style={{
                    width: '400px',
                    height: '200px',
                }}></div>
        );
    }
}
