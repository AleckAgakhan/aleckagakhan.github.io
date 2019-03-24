define(["require", "exports", "./ChartModel", "./ChartContext", "./TemplateProvider", "./common", "./ChartTheme"], function (require, exports, ChartModel_1, ChartContext_1, TemplateProvider_1, common_1, ChartTheme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
                chartLine.key = key;
                lineOrder.push(chartLine);
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
            chartLine.color = new common_1.Color(colors[key]);
        }
        for (const chartLine of lineMap.values()) {
            const key = chartLine.key;
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
            for (let i = 1; i < len; i++) {
                xColumn[i] = new Date(xColumn[i]);
            }
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
        return new ChartModel_1.ChartModel(xKey, xColumn, lineMap, lineOrder);
    };
    class ChartLoaderElement extends TemplateProvider_1.TemplateProviderElement {
        connectedCallback() {
            super.connectedCallback();
            this.attachShadow({ mode: 'open' });
            ChartTheme_1.addShadowRootContainer(this);
            const url = this.getRequiredAttribute("url");
            const chartTemplateKey = this.getRequiredAttribute("chart-key");
            this.loadData(url, chartTemplateKey);
        }
        async loadData(url, chartTemplateKey) {
            const response = await fetch(url);
            if (!response.ok)
                throw new Error(`Unable to retrieve chart data. Status code: ${response.status} (${response.statusText})`);
            const dataList = await (response).json();
            for (const data of dataList) {
                const model = createChartModel(data);
                model.setRange(Math.round(model.maxRangeLength / 3), model.maxRangeLength - Math.round(model.maxRangeLength / 3));
                const chartElement = this.createElement(chartTemplateKey);
                const contextElement = chartElement.querySelector(ChartContext_1.TagName);
                if (!contextElement)
                    throw new Error(`Unable to find the element <${ChartContext_1.TagName}> in the template '${chartTemplateKey}'.`);
                this.shadowRoot.appendChild(contextElement);
                contextElement.chartModel = model;
            }
        }
    }
    exports.ChartLoaderElement = ChartLoaderElement;
    exports.TagName = 'chart-loader';
    customElements.define(exports.TagName, ChartLoaderElement);
});
//# sourceMappingURL=ChartLoader.js.map