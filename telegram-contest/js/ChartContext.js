import { missingAttrMsg } from "./common";
export const chartContextChangeHandlerKey = Symbol('ChartContext::ChangeHandler');
export class ChartContextElement extends HTMLElement {
    constructor() {
        super();
        this.subscribers = new Set();
    }
    get chartModel() { return this._chartModel; }
    ;
    set chartModel(value) {
        this._chartModel = value;
        for (const subscriber of this.subscribers) {
            if (chartContextChangeHandlerKey in subscriber)
                subscriber[chartContextChangeHandlerKey](this);
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
export const TagName = 'chart-context';
customElements.define(TagName, ChartContextElement);
export class ChartContextConsumerElement extends HTMLElement {
    connectedCallback() {
        const chartContext = this.findContextElement();
        chartContext.subscribe(this);
        this[chartContextChangeHandlerKey](chartContext);
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
    [chartContextChangeHandlerKey](chartContext) {
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
            if (parent.localName === TagName)
                return parent;
        }
        throw new Error(`Invalid chart context: The element <${this.localName}> may only be placed as a discendent of <${TagName}>.`);
    }
    getRequiredAttribute(name) {
        const value = this.getAttribute(name);
        if (!value)
            throw new Error(missingAttrMsg(this.localName, name));
        return value;
    }
}
//# sourceMappingURL=ChartContext.js.map