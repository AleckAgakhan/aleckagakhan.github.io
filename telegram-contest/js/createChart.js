import { ChartModel } from "./ChartModel";
export const createChartData = (data) => {
    const initLineMap = new Map();
    let xKey;
    let initXColumn;
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
                initLineMap.set(key, { isVisible: true });
                break;
            default: throw new Error(`Malformed chart data section 'type': unknown type '${types[key]}' for the name '${key}'.`);
        }
    }
    if (!xKey)
        throw new Error(`Malformed chart data section 'type': missing key of the type 'x'.`);
    for (const column of data.columns) {
        if (column[0] === xKey)
            initXColumn = column;
        else {
            const key = column[0];
            const chartLine = initLineMap.get(key);
            if (!chartLine)
                throw new Error(`Malformed chart data section 'columns': undefined key '${key}'.`);
            chartLine.column = column;
        }
    }
    if (!initXColumn)
        throw new Error(`Malformed chart data section 'columns': missing column for the key '${xKey}'.`);
    const names = data.names;
    for (const key in names) {
        const chartLine = initLineMap.get(key);
        if (!chartLine)
            throw new Error(`Malformed chart data section 'names': undefined key '${key}'.`);
        chartLine.name = names[key];
    }
    const colors = data.colors;
    for (const key in colors) {
        const chartLine = initLineMap.get(key);
        if (!chartLine)
            throw new Error(`Malformed chart data section 'colors': undefined key '${key}'.`);
        chartLine.color = colors[key];
    }
    const lineOrder = [];
    for (const [key, chartLine] of initLineMap.entries()) {
        if (!chartLine.name)
            throw new Error(`Malformed chart data section 'names': missing name for the key '${key}'.`);
        if (!chartLine.color)
            throw new Error(`Malformed chart data section 'colors': missing color for the key '${key}'.`);
        const column = chartLine.column;
        if (!column)
            throw new Error(`Malformed chart data section 'columns': missing column for the key '${key}'.`);
        lineOrder.push(key);
        const len = column.length;
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
    return new ChartModel(xKey, initXColumn, initLineMap, lineOrder);
};
//# sourceMappingURL=createChart.js.map