import ImageLayer from 'ol/layer/Image';
import ImageCanvasSource from 'ol/source/ImageCanvas';
import { plotRiskAssessmentGrids } from './riskAssement';

export default class CanvasLayrs {
    canvasArrays: any;
    constructor() {
        this.canvasArrays = [];
    }
    createCanvasLayer(
        getIndex: string,
        index: string,
        grids: number[][],
        boundaryLat: number[][]
    ) {
        const { canvasArrays } = this;
        canvasArrays.forEach((element: any) => {
            const layer: any = Object.values(element)[0];
            if (layer.getVisible()) {
                layer.setVisible(false);
            }
        });
        const canvasLayer = new ImageLayer({
            source: new ImageCanvasSource({
                canvasFunction: plotRiskAssessmentGrids(
                    { grids, renderExtent: boundaryLat },
                    index
                ),
                projection: 'EPSG:4326',
            }),
        });
        this.canvasArrays.push({ [getIndex]: canvasLayer });
        window.LDmap.addLayer(canvasLayer);
        return canvasLayer;
    }
    getLayerByIndex(getIndex: string) {
        const { canvasArrays } = this;
        if (canvasArrays.length === 0) {
            return null;
        } else {
            for (let i = 0; i < canvasArrays.length; i++) {
                if (canvasArrays[i][getIndex]) {
                    return canvasArrays[i][getIndex];
                }
            }
        }
    }
}
