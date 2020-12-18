import React from 'react';
interface IState {
    colors: string[]
    titles: { [key: string]: { title: string, values: number[] | string[] } }[]
}
/* interface IProps {
    values: number[]
} */
export default class LengendPanel extends React.Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            colors: [
                'rgb(48,255,41)',
                'rgb(0,214,86)',
                'rgb(252,249,66)',
                'rgb(255,204,0)',
                'rgb(255,157,0)',
                'rgb(255,77,0)',
                'rgb(245,5,49)',
                'rgb(242,7,199)',
                'rgb(195,7,237)',
                'rgb(136,20,219)',
                'rgb(81,27,196)',
                'rgb(12,28,173)',
            ],
            titles: [{
                'V0': {
                    title: 'GDP密度', values: [0.003, 0.005, 0.006, 0.008, 0.012, 0.019, 0.034, 0.064, 0.13, 0.25, 0.5, 1]
                },
                'V1': {
                    title: 'POI密度', values: [0.003, 0.005, 0.008, 0.014, 0.024, 0.04, 0.07, 0.12, 0.2, 0.35, 0.59, 1]
                },
                'V2': {
                    title: '人口密度', values: [0.003, 0.005, 0.006, 0.008, 0.012, 0.019, 0.034, 0.064, 0.13, 0.25, 0.5, 1]
                },
                'V3': {
                    title: '土地利用', values: ['耕地', '林地', '草地', '水域', '用地', '未利用']
                },
                'V4': {
                    title: '脆弱性', values: [0.002, 0.01, 0.02, 0.04, 0.08, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.53]
                },
                'H0': {
                    title: '影响次数', values: [10, 30, 60,100, 150, 220, 450, 950, 1400, 1750, 2145, 2400]
                },
                'H1': {
                    title: '风圈指数', values: [10, 30, 60, 100, 200, 320, 560, 900, 1600, 2400, 3150, 3780]
                },
                'H2': {
                    title: '危险性', values: [0.03, 0.08, 0.13, 0.19, 0.24, 0.3, 0.42, 0.53, 0.65, 0.75, 0.83, 1]
                },
                'R': {
                    title: '风险', values: [0.003, 0.008, 0.015, 0.03, 0.05, 0.08, 0.15, 0.25, 0.4, 0.6, 0.8, 1]
                }
            }]
        }
    }
    componentDidMount() {
    }
    render() {
        return <div className='lengend'><span>{'POI'}</span><canvas id='lengend'></canvas></div>
    }
}