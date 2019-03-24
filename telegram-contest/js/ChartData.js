export class ChartData {
    constructor(xKey, xColumn, lines, lineOrder) {
        this.xKey = xKey;
        this.xColumn = xColumn;
        this.lines = lines;
        this.lineOrder = lineOrder;
        const keySet = new Set(this.lines.keys());
        for (const lineKey of lineOrder) {
            if (!keySet.delete(lineKey))
                throw new Error(`The line key '${lineKey}' is not defined in the ChartData.`);
        }
        if (keySet.size > 0)
            throw new Error(`The order for the line key(s): ${[...keySet].join(', ')} is not specified.`);
        this.rangeStart = 1;
        this.rangeEnd = xColumn.length;
        this.visibleLineCount = this.countVisibleLines();
    }
    setLineVisibility(lineKey, value) {
        const line = this.lines.get(lineKey);
        if (!line)
            throw new Error(`The line key '${lineKey}' is not defined in the ChartData.`);
        if (line.isVisible !== value) {
            line.isVisible = value;
            this.rangeMax = undefined;
            this.rangeMin = undefined;
        }
    }
    countVisibleLines() {
        let visibleLineCount = 0;
        for (const line of this.lines.values()) {
            if (line.isVisible)
                visibleLineCount++;
        }
        return visibleLineCount;
    }
    calcRangeMinMax() {
        let min = 0;
        let max = 0;
        const lineIterator = this.lines.values();
        for (const line of lineIterator) {
            if (line.isVisible) {
                max = line.max;
                min = line.min;
            }
        }
        if (this.visibleLineCount === 1)
            return;
        for (const line of lineIterator) {
            if (line.isVisible) {
            }
        }
        this.rangeMin = min;
        this.rangeMax = max;
    }
    draw(context) {
        if (this.visibleLineCount === 0)
            return;
        if (this.rangeMax === undefined)
            this.calcRangeMinMax();
        const lines = this.lines;
        const len = this.xColumn.length;
        const height = context.canvas.height;
        const vScale = height / this.rangeMax;
        const hScale = context.canvas.width / (len - 2);
        for (const lineKey of this.lineOrder) {
            const line = lines.get(lineKey);
            const column = line.column;
            context.beginPath();
            context.strokeStyle = line.color;
            context.moveTo(0, height - column[1] * vScale);
            let x = 0;
            for (let i = 2; i < len; i++) {
                x += hScale;
                context.lineTo(x, height - column[i] * vScale);
            }
            context.stroke();
        }
    }
}
//# sourceMappingURL=ChartData.js.map