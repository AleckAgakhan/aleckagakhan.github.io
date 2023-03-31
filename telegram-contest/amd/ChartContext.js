define(["require", "exports", "./common.js"], function (require, exports, common_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChartContextConsumerElement = exports.TagName = exports.ChartContextElement = exports.chartContextChangeHandlerKey = void 0;
    exports.chartContextChangeHandlerKey = Symbol('ChartContext::ChangeHandler');
    class ChartContextElement extends HTMLElement {
        constructor() {
            super();
            this.subscribers = new Set();
        }
        get chartModel() { return this._chartModel; }
        ;
        set chartModel(value) {
            this._chartModel = value;
            for (const subscriber of this.subscribers) {
                if (exports.chartContextChangeHandlerKey in subscriber)
                    subscriber[exports.chartContextChangeHandlerKey](this);
                else
                    subscriber(this);
            }
        }
        subscribe(subscriber) {
            this.subscribers.add(subscriber);
        }
        unsubscribe(subscriber) {
            this.subscribers.delete(subscriber);
        }
    }
    exports.ChartContextElement = ChartContextElement;
    exports.TagName = 'chart-context';
    customElements.define(exports.TagName, ChartContextElement);
    class ChartContextConsumerElement extends HTMLElement {
        connectedCallback() {
            const chartContext = this.findContextElement();
            chartContext.subscribe(this);
            this[exports.chartContextChangeHandlerKey](chartContext);
        }
        disconnectedCallback() {
            const chartContext = this.chartContext;
            if (chartContext) {
                chartContext.unsubscribe(this);
                this.chartContext = undefined;
            }
            const controller = this.controller;
            if (controller) {
                controller.disconnect();
                this.controller = undefined;
            }
        }
        [exports.chartContextChangeHandlerKey](chartContext) {
            let controller = this.controller;
            if (!controller) {
                const model = chartContext.chartModel;
                if (!model)
                    return;
                controller = this.createController(model);
                this.controller = controller;
            }
            else
                controller.model = chartContext.chartModel;
        }
        findContextElement() {
            const body = document.body;
            for (let parent = this.parentElement; parent != null && parent !== body; parent = parent.parentElement) {
                if (parent.localName === exports.TagName)
                    return parent;
            }
            throw new Error(`Invalid chart context: The element <${this.localName}> may only be placed as a discendent of <${exports.TagName}>.`);
        }
        getRequiredAttribute(name) {
            const value = this.getAttribute(name);
            if (!value)
                throw new Error((0, common_js_1.missingAttrMsg)(this.localName, name));
            return value;
        }
    }
    exports.ChartContextConsumerElement = ChartContextConsumerElement;
});
//# sourceMappingURL=ChartContext.js.map