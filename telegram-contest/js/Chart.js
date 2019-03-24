export class ChartData {
    constructor(xKey, xColumn, lines) {
        this.xKey = xKey;
        this.xColumn = xColumn;
        this.lines = lines;
    }
    getLinesMax(lineKeys) {
        const len = lineKeys.length;
        if (len === 0)
            return undefined;
        const lines = this.lines;
        let max = lines.get(lineKeys[0]).max;
        for (let i = 1; i < len; i++) {
            const lineMax = lines.get(lineKeys[i]).max;
            if (lineMax > max)
                max = lineMax;
        }
        return max;
    }
    drawChart(lineKeys, context) {
        const max = this.getLinesMax(lineKeys);
        if (max === undefined)
            return;
        const lines = this.lines;
        const len = this.xColumn.length;
        const height = context.canvas.height;
        const vScale = height / max;
        const hScale = context.canvas.width / (len - 2);
        for (const lineKey of lineKeys) {
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
//# sourceMappingURL=Chart.js.map