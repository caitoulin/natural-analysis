import React from 'react';
import ShowChart from './showChart';
interface IProps {
    tyLists: Array<EachTyphoon>;
}
interface IState {
    options: any;
}

export default class ChartsPanel extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            options: {
                title: {
                    text: '月度登陆台风最大强度',
                    left: 'center',
                    textStyle: {
                        color: 'black',
                        fontStyle: 'normal',
                        fontWeight: 'normal',
                        fontSize: 10,
                    },
                    show: false,
                },
                legend: {
                    textStyle: {
                        color: 'black',
                    },
                    orient: 'vertical',
                    type: 'scroll',
                    itemHeight: 1,
                    itemWidth: 10,
                    x: 'right',
                    data: ['TD', 'TS', 'STS', 'TY', 'STY', 'SuperTY'],
                    padding: [70, 30, 0, 0],
                    show: true,
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
                        saveAsImage: {
                            name: '雷达图',
                            type: 'png',
                            pixelRatio: 15,
                            title: '保存为图片',
                            excludeComponent: ['toolbox'], // 下载文件时不显示工具栏
                        },
                    },
                },
                grid: {
                    position: 'center',
                },
                radar: {
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(0,0,0,0.4)',
                        },
                    },
                    name: {
                        textStyle: {
                            color: 'rgba(0,0,0)',
                        },
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            width: 1,
                            color: 'rgba(0,0,0,0.4)', // 设置网格的颜色
                        },
                    },
                    indicator: [
                        {
                            name: '1月',
                            max: 40,
                            axisLabel: {
                                show: true,
                                fontSize: 12,
                                color: 'black',
                                showMaxLabel: true, //不显示最大值，即外圈不显示数字30
                                showMinLabel: true, //显示最小数字，即中心点显示0
                            },
                        },
                        { name: '2月', max: 40 },
                        { name: '3月', max: 40 },
                        { name: '4月', max: 40 },
                        { name: '5月', max: 40 },
                        { name: '6月', max: 40 },
                        { name: '7月', max: 40 },
                        { name: '8月', max: 40 },
                        { name: '9月', max: 40 },
                        { name: '10月', max: 40 },
                        { name: '11月', max: 40 },
                        { name: '12月', max: 40 },
                    ],
                },
                series: [
                    {
                        type: 'radar',
                        data: [
                            {
                                value: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                                name: 'TD',
                            },
                            {
                                value: [0, 0, 0, 0, 0, 10, 8, 7, 8, 0, 0, 0],
                                name: 'TS',
                            },
                            {
                                value: [0, 0, 0, 1, 2, 15, 32, 34, 19, 2, 2, 0],
                                name: 'STS',
                            },
                            {
                                value: [0, 0, 0, 3, 6, 17, 37, 35, 31, 7, 1, 0],
                                name: 'TY',
                            },
                            {
                                value: [0, 0, 0, 0, 4, 10, 17, 26, 18, 7, 5, 0],
                                name: 'STY',
                            },
                            {
                                value: [0, 0, 0, 0, 0, 6, 34, 31, 27, 16, 5, 0],
                                name: 'SuperTY',
                            },
                        ],
                    },
                ],
            },
        };
    }
    getDataByYear = () => {
        const { tyLists } = this.props;
        const getData = tyLists.reduce((a: any, b: EachTyphoon) => {
            const year = b['listInfo'][0]['time'].substr(0, 4);
            if (a.hasOwnProperty(year)) {
                a[year]['tycount'] += 1;
                if (b['tfdl'] === 1) {
                    a[year]['land'] += 1;
                }
            } else {
                a[year] = {};
                a[year]['tycount'] = 1;
                b['tfdl'] === 1 ? (a[year]['land'] = 1) : (a[year]['land'] = 0);
            }
            return a;
        }, {});
        const getTyCount = Object.values(getData).map((item) => {
            return item['tycount'];
        });
        const getTyLandedCount = Object.values(getData).map((item) => {
            return item['land'];
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
            },
            legend: {
                textStyle: {
                    color: 'black',
                },
                x: 'right',
                data: ['产生数', '登陆数'],
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
                        name: '横向柱状图',
                        type: 'png',
                        pixelRatio: 15,
                        title: '保存为图片',
                        excludeComponent: ['toolbox'], // 下载文件时不显示工具栏
                    },
                },
            },
            xAxis: [
                {
                    type: 'category',
                    data: Object.keys(getData),
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
            series: [
                {
                    name: '产生数',
                    type: 'bar',
                    barWidth: '40%',
                    data: getTyCount,
                },
                {
                    name: '登陆数',
                    type: 'bar',
                    barWidth: '40%',
                    data: getTyLandedCount,
                    itemStyle: {
                        color: 'blue',
                    },
                },
            ],
        };
        this.setState({ options });
    };
    getDataByMonth = () => {
        const { tyLists } = this.props;
        const getData = tyLists.reduce((a: any, b: EachTyphoon) => {
            const splitData = b['listInfo'][0]['time'].split('-');
            let month;
            if (splitData.length > 1) {
                month = +splitData[1] + '';
            } else {
                month = +b['listInfo'][1]['time'].substr(4, 2) + '';
            }
            if (a.hasOwnProperty(month)) {
                a[month]['tycount'] += 1;
                if (b['tfdl'] === 1) {
                    a[month]['land'] += 1;
                }
            } else {
                a[month] = {};
                a[month]['tycount'] = 1;
                b['tfdl'] === 1
                    ? (a[month]['land'] = 1)
                    : (a[month]['land'] = 0);
            }
            return a;
        }, {});
        const getTyCount = Object.values(getData).map((item) => {
            return item['tycount'];
        });
        const getTyLandedCount = Object.values(getData).map((item) => {
            return item['land'];
        });
        const options = {
            title: {
                text: '月度台风产生数及登陆数',
                left: 'center',
                textStyle: {
                    color: 'black',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    fontSize: 12,
                },
                show: false,
            },
            legend: {
                textStyle: {
                    color: 'black',
                },
                itemHeight: 1,
                x: 'right',
                data: ['产生数', '登陆数'],
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
                    saveAsImage: {
                        name: '雷达图',
                        type: 'png',
                        pixelRatio: 15,
                        title: '保存为图片',
                        excludeComponent: ['toolbox'], // 下载文件时不显示工具栏
                    },
                },
            },
            grid: {
                position: 'center',
            },
            radar: {
                axisLine: {
                    lineStyle: {
                        color: 'rgba(0,0,0,0.4)',
                    },
                },
                name: {
                    textStyle: {
                        color: 'rgba(0,0,0)',
                    },
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        width: 1,
                        color: 'rgba(0,0,0,0.4)', // 设置网格的颜色
                    },
                },
                indicator: [
                    {
                        name: '1月',
                        max: 400,
                        axisLabel: {
                            show: true,
                            fontSize: 12,
                            color: 'black',
                            showMaxLabel: true, //不显示最大值，即外圈不显示数字30
                            showMinLabel: true, //显示最小数字，即中心点显示0
                        },
                    },
                    { name: '2月', max: 400 },
                    { name: '3月', max: 400 },
                    { name: '4月', max: 400 },
                    { name: '5月', max: 400 },
                    { name: '6月', max: 400 },
                    { name: '7月', max: 400 },
                    { name: '8月', max: 400 },
                    { name: '9月', max: 400 },
                    { name: '10月', max: 400 },
                    { name: '11月', max: 400 },
                    { name: '12月', max: 400 },
                ],
            },
            series: [
                {
                    type: 'radar',
                    data: [
                        {
                            value: getTyCount,
                            name: '产生数',
                            /*    label: {
                                normal: {
                                    show: true,
                                    formatter: function (params: any) {
                                        return params.value;
                                    },
                                },
                            }, */
                        },
                        {
                            value: getTyLandedCount,
                            name: '登陆数',
                            label: {
                                normal: {
                                    show: true,
                                    formatter: function (params: any) {
                                        return params.value;
                                    },
                                },
                            },
                        },
                    ],
                },
            ],
        };
        this.setState({ options });
    };
    getDataByIns = () => {
        // const { tyLists } = this.props;
        /* const getData = tyLists.reduce((a: any, b: EachTyphoon) => {
            if (b['tfdl'] !== 1) return a;
            const splitData = b['listInfo'][0]['time'].split('-');
            let month;
            if (splitData.length > 1) {
                month = +splitData[1] + '';
            } else {
                month = +b['listInfo'][1]['time'].substr(4, 2) + '';
            }
            const strong = b['maxstrong'];
            if (a.hasOwnProperty(month)) {
                a[month].hasOwnProperty(strong)
                    ? (a[month][strong] += 1)
                    : (a[month][strong] = 1);
            } else {
                a[month] = {};
                a[month][strong] = 1;
            }
            return a;
        }, {}); */
        const options = {
            title: {
                text: '月度登陆台风最大强度',
                left: 'center',
                textStyle: {
                    color: 'black',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    fontSize: 10,
                },
                show: false,
            },
            legend: {
                textStyle: {
                    color: 'black',
                },
                orient: 'vertical',
                type: 'scroll',
                itemHeight: 1,
                itemWidth: 10,
                x: 'right',
                data: ['TD', 'TS', 'STS', 'TY', 'STY', 'SuperTY'],
                padding: [70, 30, 0, 0],
                show: true,
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
                    saveAsImage: {
                        name: '雷达图',
                        type: 'png',
                        pixelRatio: 15,
                        title: '保存为图片',
                        excludeComponent: ['toolbox'], // 下载文件时不显示工具栏
                    },
                },
            },
            grid: {
                position: 'center',
            },
            radar: {
                axisLine: {
                    lineStyle: {
                        color: 'rgba(0,0,0,0.4)',
                    },
                },
                name: {
                    textStyle: {
                        color: 'rgba(0,0,0)',
                    },
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        width: 1,
                        color: 'rgba(0,0,0,0.4)', // 设置网格的颜色
                    },
                },
                indicator: [
                    {
                        name: '1月',
                        max: 40,
                        axisLabel: {
                            show: true,
                            fontSize: 12,
                            color: 'black',
                            showMaxLabel: true, //不显示最大值，即外圈不显示数字30
                            showMinLabel: true, //显示最小数字，即中心点显示0
                        },
                    },
                    { name: '2月', max: 40 },
                    { name: '3月', max: 40 },
                    { name: '4月', max: 40 },
                    { name: '5月', max: 40 },
                    { name: '6月', max: 40 },
                    { name: '7月', max: 40 },
                    { name: '8月', max: 40 },
                    { name: '9月', max: 40 },
                    { name: '10月', max: 40 },
                    { name: '11月', max: 40 },
                    { name: '12月', max: 40 },
                ],
            },
            series: [
                {
                    type: 'radar',
                    data: [
                        {
                            value: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                            name: 'TD',
                        },
                        {
                            value: [0, 0, 0, 0, 0, 10, 8, 7, 8, 0, 0, 0],
                            name: 'TS',
                        },
                        {
                            value: [0, 0, 0, 1, 2, 15, 32, 34, 19, 2, 2, 0],
                            name: 'STS',
                        },
                        {
                            value: [0, 0, 0, 3, 6, 17, 37, 35, 31, 7, 1, 0],
                            name: 'TY',
                        },
                        {
                            value: [0, 0, 0, 0, 4, 10, 17, 26, 18, 7, 5, 0],
                            name: 'STY',
                        },
                        {
                            value: [0, 0, 0, 0, 0, 6, 34, 31, 27, 16, 5, 0],
                            name: 'SuperTY',
                        },
                    ],
                },
            ],
        };
        this.setState({ options });
    };
    render() {
        const { options } = this.state;
        return (
            <div className="chart-panel">
                <ul className="chart-type">
                    <li onClick={this.getDataByIns}>登陆台风最大强度</li>
                    <li onClick={this.getDataByYear}>年度变化</li>
                    <li onClick={this.getDataByMonth}>月度变化</li>
                </ul>
                <ShowChart option={options} />
            </div>
        );
    }
}
