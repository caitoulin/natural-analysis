import React, { Component } from 'react';
import './menu.less';
import '../../src/assets/fonts/iconfont.css';
import classNames from 'classnames';

export default class Menu extends Component<any, any> {
    state: any = {
        menu: {
            firstChapter: [
                { SpatialAnalysis: ['影响力指数', '统计分析'] },
                { netAnalysis: ['登陆划分', '起源划分'] },
            ],
            secondChapter: [
                { trackDensity: ['轨迹可视化'] },
                { trackDevelopment: ['轨迹聚类'] },
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
    };
    selectedFirst = (index: string): void => {
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
