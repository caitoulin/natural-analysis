import ImageLayer from 'ol/layer/Image';
import ImageCanvasSource from 'ol/source/ImageCanvas';
import React from 'react';
import { getTracksGrid } from '../../src/util/netRequets';
import { plotGrids } from '../../src/util/analysisProcess';
interface IState {
    grids: number[][];
}
let canvasLayer: any = null;
export default class TrackDensity extends React.Component<any, IState> {
    constructor(props: any) {
        super(props);
    }
    componentDidMount() {
        this.getGridsData();
    }
    getGridsData = async () => {
        if (!localStorage.getItem('trackGrids')) {
            const getGrids = await getTracksGrid();
            const grids = getGrids['data'];
            localStorage.setItem('influencedIndex', JSON.stringify(grids));
            this.setState({ grids });
        } else {
            const grids = JSON.parse(localStorage.getItem('trackGrids'));
            this.setState({ grids });
        }
    };
    showTrackDensity = () => {
        const { grids } = this.state;
        const renderExtent = [
            [98, 3],
            [178, 83],
        ];
        const grid = [0.1, 0.1];
        if (canvasLayer !== null) {
            if (!canvasLayer.getVisible()) {
                canvasLayer.setVisible(true);
            } else {
                canvasLayer.setVisible(false);
            }
        } else {
            canvasLayer = new ImageLayer({
                source: new ImageCanvasSource({
                    canvasFunction: (
                        extent,
                        resolution,
                        pixelRatio,
                        size,
                        projection
                    ) => {
                        const canvas = document.createElement('canvas');
                        canvas.width = size[0];
                        canvas.height = size[1];
                        canvas.style.display = 'block';
                        canvas.getContext('2d').globalAlpha = 0.75;
                        plotGrids(
                            canvas,
                            grids,
                            renderExtent,
                            grid,
                            [extent[0], extent[2]],
                            [extent[1], extent[3]]
                        );
                        return canvas;
                    },
                    projection: 'EPSG:4326',
                }),
            });
            window.LDmap.addLayer(canvasLayer);
        }
    };
    render() {
        return (
            <div className="cluster-groups">
                <button onClick={this.showTrackDensity}>轨迹可视化</button>
            </div>
        );
    }
}
