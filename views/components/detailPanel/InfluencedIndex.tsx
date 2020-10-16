import React from 'react';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import * as turf from '@turf/turf';
import {
    BBox,
    Units,
    Feature as turfFeature,
    Polygon,
    MultiPolygon,
    Properties,
} from '@turf/turf';

import { LANDTRACK } from '../../src/middleware/reducer/typhoonInfo';

import { connect } from 'react-redux';

interface Option {
    units?: Units;
    properties?: Properties;
    mask?: turfFeature<Polygon | MultiPolygon> | Polygon | MultiPolygon;
}
const indexSource = new VectorSource();
const indexLayer = new VectorLayer({ source: indexSource });
function InfluencedIndex({ landedTracks }: { landedTracks: Array<LANDTRACK> }) {
    const defaultGrids = (): void => {
        if (indexSource.getFeatures().length !== 0) {
            if (indexLayer.getVisible()) {
                indexLayer.setVisible(false);
            } else {
                indexLayer.setVisible(true);
            }
        } else {
            const bbox: BBox = [98, 17.5, 124, 46];
            const cellSide = 150;
            const options: Option = { units: 'miles' };
            const squareGrid = turf.squareGrid(bbox, cellSide, options);
            const format = new GeoJSON();
            const allFeatures = format
                .readFeatures(squareGrid)
                .map((feature, index) => {
                    feature.setId(index);
                    return feature;
                });
            indexSource.addFeatures(allFeatures);
            window.LDmap.addLayer(indexLayer);
        }
    };
    const getRaster = () => {
        defaultGrids();
    };
    const handlecomputeIndex = () => {};
    return (
        <div className="cluster-groups">
            <button onClick={getRaster}>栅格化</button>
            <button onClick={handlecomputeIndex}>影响力指数</button>
        </div>
    );
}

function mapStateToProps(state: any) {
    const { landedTracks } = state.typhoonInfo;
    return { landedTracks };
}

export default connect(mapStateToProps)(InfluencedIndex);
