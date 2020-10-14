import React from 'react';
import { connect } from 'react-redux';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Fill, Circle, Style, Stroke } from 'ol/style';
import { EachTyphoon } from '../../src/util/handleIndexDB';
import { TyphoonOrigin, ssDbscan } from '../../src/util/clusterOrigin';
import { Point } from 'ol/geom';
import { Feature } from 'ol';

const colors = [
    'rgb(220,20,60)',
    'rgb(255,0,255)',
    'rgb(0,0,205)',
    'rgb(0,191,255)',
    'rgb(0,255,0)',
    'rgb(255,215,0)',
    'rgb(255,69,0)',
    'rgb(255,0,0)',
    'rgb(105,105,105)',
    'rgb(138,43,226)',
];

const vectorGridSource = new VectorSource();
const vectorGridLayer = new VectorLayer({
    source: vectorGridSource,
    style: new Style({
        image: new Circle({
            fill: new Fill({
                color: 'rgb(255,255,0)',
            }),
            radius: 2,
        }),
        stroke: new Stroke({
            //边界样式
            color: '#319FD3',
            width: 1,
        }),
    }),
});

function OriginGrid({ tyLists }: { tyLists: Array<EachTyphoon> }) {
    const handleGetGrid = (): void => {
        if (vectorGridSource.getFeatures().length !== 0) {
            if (vectorGridLayer.getVisible()) {
                vectorGridLayer.setVisible(false);
            } else {
                vectorGridLayer.setVisible(true);
            }
        } else {
            const getOriginInfo: Array<TyphoonOrigin> = tyLists.map((item) => {
                const { tfbh, tfdl, maxfspeed: maxSpeed, listInfo } = item;
                const position = [
                    listInfo[0]['positon']['Lng'],
                    listInfo[0]['positon']['Lat'],
                ];
                return { tfdl, tfbh, maxSpeed, position };
            });
            const getClusterResult = ssDbscan(
                getOriginInfo,
                2.5,
                20,
                20,
                0.08,
                0.08
            );
        }
    };
    const gridAnalysis = (): void => {};
    return (
        <div className="cluster-groups">
            <button onClick={handleGetGrid}>起源点格网</button>
            <button onClick={gridAnalysis}>网络分析</button>
        </div>
    );
}

function mapStateToProps(state: any) {
    const { typhoonLists } = state.typhoonInfo;
    return { tyLists: typhoonLists };
}

export default connect(mapStateToProps)(OriginGrid);
