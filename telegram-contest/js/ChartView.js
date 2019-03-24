import { ChartContextConsumerElement } from "./ChartContext";
import { chartModelChangeHandlerKey } from "./ChartModel";
class CanvasChartView {
    constructor(element, model, theme) {
        this.element = element;
        this.animationState = {};
    }
    get model() { return this._model; }
    set model(newModel) {
        const oldModel = this._model;
        if (oldModel === newModel)
            return;
        if (oldModel) {
            oldModel.unsubscribe(this);
        }
        this._model = newModel;
        if (!newModel)
            return;
        newModel.subscribe(this);
    }
    disconnect() {
    }
    [chartModelChangeHandlerKey](model, timestamp) {
    }
    renderAnimationFrame(timestamp) {
    }
}
export class CanvasChartViewElement extends ChartContextConsumerElement {
    createController(element, model, theme) {
        return new CanvasChartView(this, model, theme);
    }
}
export const TagName = 'canvas-chart-view';
customElements.define(TagName, CanvasChartViewElement);
//# sourceMappingURL=ChartView.js.map