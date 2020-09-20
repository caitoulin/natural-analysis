import React from 'react';
import classNames from 'classnames';
import './basis.less';
import '../../src/assets/fonts/iconfont.css';
interface Istate {
    isShow: boolean;
}

export default class BasisBar extends React.Component<any, Istate> {
    state = {
        isShow: false,
    };
    handleChangeStatus = (): void => {
        const { isShow } = this.state;
        if (isShow) {
            this.setState({ isShow: false });
        } else {
            this.setState({ isShow: true });
        }
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
                    <span>基本信息</span>
                </div>
            </div>
        );
    }
}
