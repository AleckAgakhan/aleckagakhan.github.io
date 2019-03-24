export class ChartCanvasRendererImpl {
    render(model, theme, context) {
        const width = context.canvas.width;
        const height = context.canvas.height;
        context.fillStyle = theme.backgroundColor;
        context.fillRect(0, 0, width, height);
        const { currVisibleLines: lines, currMax: max, currRangeStart: start, currRangeEnd: end, maxRange } = model;
        if (lines.length > 0) {
            const vScale = height / max;
            const rangeBorderWidth = theme.rangeBorderWidth;
            context.fillStyle = theme.rangeBorderColor;
            const step = (width - rangeBorderWidth * 2) / (maxRange - 1);
            const rangeStep = (width - rangeBorderWidth * 2) / maxRange;
            const rangeStartPixelOffset = start * rangeStep;
            const rangeEndPixelOffset = end * rangeStep + rangeBorderWidth;
            context.fillRect(rangeStartPixelOffset, 0, rangeBorderWidth, height);
            context.fillRect(rangeEndPixelOffset, 0, rangeBorderWidth, height);
            for (const line of lines) {
                const column = line.column;
                const columnLen = column.length;
                context.beginPath();
                context.strokeStyle = line.color;
                context.lineWidth = theme.lineWidth;
                let x = rangeBorderWidth;
                context.moveTo(x, height - column[1] * vScale);
                for (let i = 2; i < columnLen; i++) {
                    x += step;
                    context.lineTo(x, height - column[i] * vScale);
                }
                context.stroke();
            }
            context.fillStyle = theme.shadeColor;
            const leftShadeWidth = rangeStartPixelOffset - rangeBorderWidth;
            if (leftShadeWidth > 0)
                context.fillRect(rangeBorderWidth, 0, leftShadeWidth, height);
            const rightShadeWidth = width - (rangeEndPixelOffset + rangeBorderWidth * 2);
            if (rightShadeWidth > 0)
                context.fillRect(rangeEndPixelOffset + rangeBorderWidth, 0, rightShadeWidth, height);
        }
    }
}
//# sourceMappingURL=ChartCanvasRenderer.js.map