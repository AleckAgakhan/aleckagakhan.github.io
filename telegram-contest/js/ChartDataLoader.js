import { ChartModel } from "./ChartModel";
const createChartModel = (data) => {
    const lineMap = new Map();
    let xKey;
    let xColumn;
    const types = data.types;
    for (const key in types) {
        switch (types[key]) {
            case 'x':
                {
                    if (xKey)
                        throw new Error(`Malformed chart data section 'type': too many names '${key}' of the type 'x'.`);
                    xKey = key;
                    break;
                }
            case 'line':
                lineMap.set(key, { isPrevVisible: false, isCurrVisible: true });
                break;
            default: throw new Error(`Malformed chart data section 'type': unknown type '${types[key]}' for the name '${key}'.`);
        }
    }
    if (!xKey)
        throw new Error(`Malformed chart data section 'type': missing key of the type 'x'.`);
    const lineOrder = [];
    for (const column of data.columns) {
        if (column[0] === xKey)
            xColumn = column;
        else {
            const key = column[0];
            const chartLine = lineMap.get(key);
            if (!chartLine)
                throw new Error(`Malformed chart data section 'columns': undefined key '${key}'.`);
            chartLine.column = column;
            lineOrder.push(key);
        }
    }
    if (!xColumn)
        throw new Error(`Malformed chart data section 'columns': missing column for the key '${xKey}'.`);
    const names = data.names;
    for (const key in names) {
        const chartLine = lineMap.get(key);
        if (!chartLine)
            throw new Error(`Malformed chart data section 'names': undefined key '${key}'.`);
        chartLine.name = names[key];
    }
    const colors = data.colors;
    for (const key in colors) {
        const chartLine = lineMap.get(key);
        if (!chartLine)
            throw new Error(`Malformed chart data section 'colors': undefined key '${key}'.`);
        chartLine.color = colors[key];
    }
    for (const [key, chartLine] of lineMap.entries()) {
        if (!chartLine.name)
            throw new Error(`Malformed chart data section 'names': missing name for the key '${key}'.`);
        if (!chartLine.color)
            throw new Error(`Malformed chart data section 'colors': missing color for the key '${key}'.`);
        const column = chartLine.column;
        if (!column)
            throw new Error(`Malformed chart data section 'columns': missing column for the key '${key}'.`);
        const len = column.length;
        if (len != xColumn.length)
            throw new Error(`Malformed chart data section 'columns': the length of the column for the key '${key}' doesn't match the length of x-column.`);
        let min = column[1];
        let max = min;
        for (let i = 2; i < len; i++) {
            const value = column[i];
            if (value < min)
                min = value;
            if (value > max)
                max = value;
        }
        chartLine.min = min;
        chartLine.max = max;
    }
    return new ChartModel(xKey, xColumn, lineMap, lineOrder);
};
export class ChartDataLoader extends HTMLElement {
    connectedCallback() {
        if (!this.isConnected)
            return;
        this.attachShadow({ mode: 'open' });
        const url = this.getAttribute('url');
        if (!url)
            return;
        if (!this.initId)
            this.initId = setTimeout(ChartDataLoader.loadData, 0, this);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.isConnected)
            return;
        if (name != 'url') {
            console.warn(`Unknown attribute '${name}' in the element <${TagName}>.`);
            return;
        }
        if (!this.initId)
            this.initId = setTimeout(ChartDataLoader.loadData, 0, this);
    }
    static async loadData(element) {
        const response = await fetch(element.getAttribute('url'));
        if (!response.ok)
            throw new Error(`Unable to retrieve chart data. Status code: ${response.status} (${response.statusText})`);
        const dataList = await (response).json();
        for (const data of dataList) {
            const model = createChartModel(data);
            for (const lineKey of model.lineOrder)
                model.setVisibility(lineKey, true);
            model.currRangeStart = Math.round(model.maxRange / 3);
            model.currRangeEnd = model.maxRange - Math.round(model.maxRange / 3);
            const itemContextElement = element.firstElementChild.cloneNode(true);
            itemContextElement.init(model);
            element.shadowRoot.appendChild(itemContextElement);
        }
    }
}
ChartDataLoader.observedAttributes = ['url'];
export const TagName = 'chart-data-loader';
customElements.define(TagName, ChartDataLoader);
//# sourceMappingURL=ChartDataLoader.js.map