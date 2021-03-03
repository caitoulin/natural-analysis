import React from 'react';
import echarts from 'echarts';
interface IProps {
    option: any;
}
export default class ShowChart extends React.Component<IProps, any> {
    myChart: any;
    chart: any;
    constructor(props: IProps) {
        super(props);
    }
    componentDidMount() {
        this.myChart = echarts.init(this.chart);
        const { option } = this.props;
        this.myChart.clear();
        this.myChart.setOption(option);
    }
    componentDidUpdate() {
        const { option } = this.props;
        this.myChart.clear();
        this.myChart.setOption(option);
    }
    render() {
        return (
            <div
                id="chart"
                ref={(ref) => (this.chart = ref)}
                style={{
                    width: '500px',
                    height: '270px',
                }}></div>
        );
    }
}
