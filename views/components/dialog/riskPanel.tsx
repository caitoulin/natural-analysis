import React from 'react';
import { connect } from 'react-redux';
import { EACHLINE } from '../../src/util/clusterLandedTrack';
import VulnerPanel from './vulnerPanel';
import HazardPanel from './hazardPanel';
import classNames from 'classnames';
import { getRiskIndex, getBoundary } from '../../src/util/riskAssement';
import CanvasLayrs from '../../src/util/canvasLayer';
import LengendPanel from '../dialog/legendPanel';
interface IProps {
    segment: number | null;
    trendIndex: number | null;
    trackInfo: Array<EACHLINE>;
}
interface IState {
    isShowV: boolean;
    isShowH: boolean;
    isShowL?: boolean;
    cliclkIndex?: string
}
class RiskPanel extends React.Component<IProps, IState> {
    canvasLayer: any; preIndex: any;
    constructor(props: IProps) {
        super(props);
        this.state = { isShowV: false, isShowH: false, isShowL: true };
        this.canvasLayer = new CanvasLayrs();
        this.preIndex = null;
    }
    showHazard = async () => {
        this.setState((preState) => ({ isShowH: !preState.isShowH }));
    };
    showVlunter = () => {
        this.setState((preState) => ({ isShowV: !preState.isShowV }));
    };
    showRisk = async () => {
        const { segment, trendIndex, trackInfo } = this.props;
        this.changeLengendStatus('R');
        const getIndex = trendIndex
            ? segment.toString() + trendIndex.toString() + 'R'
            : segment.toString() + 'R';
        const getLayer = this.canvasLayer.getLayerByIndex(getIndex);
        if (this.preIndex === getIndex) {
            getLayer.getVisible()
                ? getLayer.setVisible(false)
                : getLayer.setVisible(true);
            return;
        }
        if (getLayer) {
            getLayer.setVisible(true);
            this.preIndex = getIndex;
            return;
        }
        this.preIndex = getIndex;
        const { boundaryLat } = getBoundary(trackInfo);
        const riskIndex = await getRiskIndex(trackInfo, segment, trendIndex);
        this.canvasLayer.createCanvasLayer(
            getIndex,
            'R',
            riskIndex,
            boundaryLat,
        );
    };
    changeLengendStatus = (cliclkIndex: string) => {
        this.setState({ cliclkIndex });
    }
    isShowLengend = (e: any) => {
        if (!e.target.checked) {
            this.setState({ isShowL: false })
        } else {
            this.setState({ isShowL: true })
        }

    }
    render() {
        const { isShowV, isShowH, isShowL, cliclkIndex } = this.state;
        const { segment, trendIndex, trackInfo } = this.props;
        const VProps = { segment, trendIndex, trackInfo, isShowV };
        const HProps = { segment, trendIndex, trackInfo, isShowH };
        return (
            <div
                className={classNames('risk-panel-show', {
                    'risk-panel-close': segment === null,
                })}>
                {isShowL && <LengendPanel getIndex={cliclkIndex} />}
                <span>
                    <input
                        type="checkbox"
                        defaultChecked={true}
                        onChange={this.isShowLengend}
                    />
                    {'图例'}
                </span>
                <ul>
                    <li onClick={this.showHazard}>
                        <span>{'危险性'}</span>
                        <HazardPanel {...HProps} changeLengend={this.changeLengendStatus} />
                    </li>
                    <li onClick={this.showVlunter}>
                        <span>{'脆弱性'}</span>
                        <VulnerPanel {...VProps} changeLengend={this.changeLengendStatus} />
                    </li>
                    <li onClick={this.showRisk}>
                        <span>{'风险性'}</span>
                    </li>
                </ul>
            </div>
        );
    }
}
function mapStateToProps(state: any) {
    const { segment, trendIndex, trackInfo } = state.eachTrend;
    return { segment, trendIndex, trackInfo };
}

export default connect(mapStateToProps)(RiskPanel);
