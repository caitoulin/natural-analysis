import React from 'react';
import { connect } from 'react-redux';
import { EACHLINE } from '../../src/util/clusterLandedTrack';
import VulnerPanel from './vulnerPanel';
import HazardPanel from './hazardPanel';
import classNames from 'classnames';
interface IProps {
    segment: number | null;
    trendIndex: number | null;
    trackInfo: Array<EACHLINE>;
}
interface IState {
    isShowV: boolean;
    isShowH: boolean;
}
class RiskPanel extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = { isShowV: false, isShowH: false };
    }
    showHazard = async () => {
        this.setState((preState) => ({ isShowH: !preState.isShowH }));
    };
    showVlunter = () => {
        this.setState((preState) => ({ isShowV: !preState.isShowV }));
    };
    showRisk = () => {};
    render() {
        const { isShowV, isShowH } = this.state;
        const { segment, trendIndex, trackInfo } = this.props;
        const VProps = { segment, trendIndex, trackInfo, isShowV };
        const HProps = { segment, trendIndex, trackInfo, isShowH };
        return (
            <div
                className={classNames('risk-panel-show', {
                    'risk-panel-close': segment === null,
                })}>
                <ul>
                    <li onClick={this.showHazard}>
                        <span>{'危险性'}</span>
                        <HazardPanel {...HProps} />
                    </li>
                    <li onClick={this.showVlunter}>
                        <span>{'脆弱性'}</span>
                        <VulnerPanel {...VProps} />
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
