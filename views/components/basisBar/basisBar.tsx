import React from 'react';
import classNames from 'classnames';
import './basis.less';
import '../../src/assets/fonts/iconfont.css';
import { TyphoonOrigin } from '../../src/util/clusterOrigin';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Point, LineString } from 'ol/geom';
import { Fill, Stroke, Circle, Style } from 'ol/style';
import Feature from 'ol/Feature';
import { get } from 'ol/proj';
interface Istate {
    isShow: boolean;
}
interface IProps {
    origin: Array<TyphoonOrigin>;
}
const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
        image: new Circle({
            fill: new Fill({
                color: 'rgba(78,110,242)',
            }),
            radius: 2
            ,
        }),
        stroke: new Stroke({
            color: '#0F0',
            lineCap: 'round', // 设置线的两端为圆头
            width: 5,
        }),
        fill: new Fill({
            color: '#00F',
        }),
    }),
});
export default class BasisBar extends React.Component<IProps, Istate> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isShow: false,
        };
    }
    handleChangeStatus = (): void => {
        const { isShow } = this.state;
        if (isShow) {
            this.setState({ isShow: false });
        } else {
            this.setState({ isShow: true });
        }
    };
    handleShowOrigin = (): void => {
        const { origin } = this.props;
        const originFeatures = origin.map((item) => {
            const getKey = Object.keys(item)[0];
            return new Feature({
                geometry: new Point(item[getKey]),
            });
        });
        console.log(originFeatures.length);
        vectorSource.addFeatures(originFeatures);
        window.LDmap.addLayer(vectorLayer);
    };
    render() {
        const { isShow } = this.state;
        return (
            <div className="basis-bar">
                <div className="control-bar">
                    <i
                        className="iconfont icon-caidan"
                        onClick={this.handleChangeStatus}></i>
                </div>
                <div
                    className={classNames('show-bar', {
                        'no-show-bar': !isShow,
                    })}>
                    <span onClick={this.handleShowOrigin}>登陆点</span>
                </div>
            </div>
        );
    }
}
