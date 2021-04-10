import React, { Component } from 'react';
import './menu.less';
import '../../src/assets/fonts/iconfont.css';
import classNames from 'classnames';

interface IProps {
    handleControlPanel: (index: string) => void;
}

export default class Menu extends Component<IProps, any> {
    state: any = {
        menu: {
            基础特征: [1, 2],
            统计分析: [
                { 空间分析: ['影响力指数'] },
                { 网络分析: ['登陆划分', '起源划分'] },
            ],
            风险挖掘: [
                { 轨迹密度: ['轨迹可视化'] },
                { 轨迹风险: ['轨迹聚类'] },
            ],
        },
        isSelectedFirst: [],
        isSelectedSecond: [],
    };
    generateChildren = (lists: any, indexStr: string): any => {
        const { isSelectedFirst, isSelectedSecond } = this.state;
        return lists.map((item: any, indexItem: any) => {
            return (
                <ul
                    key={indexItem}
                    className={classNames('second-child-no', {
                        'second-child-ok': isSelectedFirst.includes(indexStr),
                    })}>
                    {Object.entries(item).map(
                        ([keys, values]: [string, string[]], index) => {
                            return (
                                <li key={index}>
                                    <i className="iconfont icon-kongjian"></i>
                                    <span
                                        onClick={(e) =>
                                            this.selectedSecond(
                                                e,
                                                indexStr +
                                                    indexItem.toString() +
                                                    index.toString() +
                                                    '11'
                                            )
                                        }>
                                        {keys}
                                    </span>
                                    {
                                        <ul
                                            className={classNames(
                                                'third-child-no',
                                                {
                                                    'third-child-ok': isSelectedSecond.includes(
                                                        indexStr +
                                                            indexItem.toString() +
                                                            index.toString() +
                                                            '11'
                                                    ),
                                                }
                                            )}>
                                            {values.map(
                                                (
                                                    value: string,
                                                    valueIndex: number
                                                ) => (
                                                    <li key={valueIndex}>
                                                        <span
                                                            onClick={() => {
                                                                this.handleAnalysis(
                                                                    indexStr +
                                                                        indexItem.toString() +
                                                                        index.toString() +
                                                                        valueIndex.toString()
                                                                );
                                                            }}>
                                                            {value}
                                                        </span>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    }
                                </li>
                            );
                        }
                    )}
                </ul>
            );
        });
    };
    handleAnalysis = (index: string): void => {
        console.log(index);
        this.props.handleControlPanel(index);
    };
    selectedFirst = (index: string): void => {
        console.log(index);
        if (index === '01') {
            this.props.handleControlPanel(index);
            return;
        }
        const { isSelectedFirst } = this.state;
        if (!isSelectedFirst.includes(index)) {
            this.setState({ isSelectedFirst: [...isSelectedFirst, index] });
        } else {
            const getIndex: number = isSelectedFirst.indexOf(index);
            let newArray: string[] = [];
            if (getIndex === 0) {
                newArray = isSelectedFirst.slice(
                    getIndex + 1,
                    isSelectedFirst.length
                );
            } else if (getIndex === isSelectedFirst.length - 1) {
                newArray = isSelectedFirst.slice(0, getIndex);
            } else {
                newArray = isSelectedFirst.splice(getIndex, 1);
            }
            this.setState({ isSelectedFirst: newArray });
        }
    };
    selectedSecond = (e: any, index: string): void => {
        e.stopPropagation();
        const { isSelectedSecond } = this.state;
        if (!isSelectedSecond.includes(index)) {
            this.setState({ isSelectedSecond: [...isSelectedSecond, index] });
        } else {
            const getIndex: number = isSelectedSecond.indexOf(index);
            let newArray: string[] = [];
            if (getIndex === 0) {
                newArray = isSelectedSecond.slice(
                    getIndex + 1,
                    isSelectedSecond.length
                );
            } else if (getIndex === isSelectedSecond.length - 1) {
                newArray = isSelectedSecond.slice(0, getIndex);
            } else {
                newArray = isSelectedSecond.splice(getIndex, 1);
            }
            this.setState({ isSelectedSecond: newArray });
        }
    };
    render() {
        const { menu } = this.state;
        return (
            <div className="menu-list">
                <div className="logo-img">
                    <i className="iconfont icon-sty"></i>
                    <span title={'台风轨迹挖掘及风险分析'}>
                        台风轨迹挖掘及风险分析
                    </span>
                </div>
                <ul className="first-ul">
                    {Object.entries(menu).map(([keys, lists], index) => {
                        return (
                            <li key={index}>
                                <i className="iconfont icon-star"></i>
                                <span
                                    onClick={() => {
                                        this.selectedFirst(
                                            index.toString() + '1'
                                        );
                                    }}>
                                    {keys}
                                </span>
                                {this.generateChildren(
                                    lists,
                                    index.toString() + '1'
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }
}
