import { chartModelChangeHandlerKey, getChartLineVState } from './ChartModel';
import { getCurrentTheme } from './ChartTheme';
import { ChartContextConsumerElement } from './ChartContext';
import { Color } from './common';
class CanvasChartRangeSelector {
    constructor(element, model) {
        this.element = element;
        this.rangePerPixel = 0;
        this.isPointerAction = false;
        this.pointerActionX = 0;
        this.theme = getCurrentTheme();
        const canvas = document.createElement('canvas');
        canvas.style.border = 'solid black 1px';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        element.onmousedown = this.handlePointerDown.bind(this);
        element.onmouseup = this.handlePointerUp.bind(this);
        element.onmousemove = this.handlePointerMove.bind(this);
        element.onmouseenter = this.handlePointerEnter.bind(this);
        element.onmouseleave = this.handlePointerLeave.bind(this);
        element.attachShadow({ mode: 'open' }).append(canvas);
        const styles = window.getComputedStyle(canvas);
        const width = parseInt(styles.width);
        canvas.width = width;
        const height = parseInt(styles.height);
        canvas.height = height;
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.animationState =
            {
                frameRequestId: undefined,
                timestamp: undefined,
                prevMax: 0,
                nextMax: 0,
                progressRatio: 0,
                lineCount: 0,
                changingLineCount: 0,
                lineInfoList: [],
            };
        this.renderAnimationFrame = this.renderAnimationFrame.bind(this);
        this.model = model;
    }
    get model() { return this._model; }
    set model(newModel) {
        const oldModel = this._model;
        if (oldModel === newModel)
            return;
        const lineInfoList = this.animationState.lineInfoList;
        if (oldModel) {
            oldModel.unsubscribe(this);
            for (const lineInfo of lineInfoList)
                lineInfo[0] = undefined;
        }
        this._model = newModel;
        if (!newModel)
            return;
        for (let i = newModel.lines.size - lineInfoList.length; i > 0; i--)
            lineInfoList.push([undefined, 0]);
        this.rangePerPixel = newModel.maxRangeLength / (this.width - this.theme.rangeSelector.rangeBorderWidth * 2);
        newModel.subscribe(this);
    }
    disconnect() {
        this.model = undefined;
    }
    getRegionName(x) {
        if (!this._model)
            throw Error(`Invalid state for the operation 'getRegionName': the model is empty.`);
        const { currRangeStart: start, currRangeEnd: end, maxRangeLength: maxRange } = this._model;
        const rangeBorderWidth = this.theme.rangeSelector.rangeBorderWidth;
        const rangeStep = (this.width - rangeBorderWidth * 2) / maxRange;
        const rangeStartLeft = start * rangeStep;
        if (x < 0)
            return undefined;
        if (x < rangeStartLeft)
            return 0;
        if (x <= rangeStartLeft + rangeBorderWidth)
            return 1;
        const rangeEndLeft = end * rangeStep + rangeBorderWidth;
        if (x < rangeEndLeft)
            return 2;
        if (x <= rangeEndLeft + rangeBorderWidth)
            return 3;
        if (x < this.width)
            return 4;
        return undefined;
    }
    setPointerCursor(region) {
        const style = this.element.style;
        switch (region) {
            case 1:
            case 3:
                {
                    style.cursor = 'ew-resize';
                    break;
                }
            case 2:
                {
                    style.cursor = this.isPointerAction ? 'grabbing' : 'grab';
                    break;
                }
            case 0:
            case 4:
                {
                    style.cursor = 'pointer';
                    break;
                }
            default: style.cursor = '';
        }
    }
    handlePointerDown(event) {
        if (event.buttons !== 1 || event.button !== 0) {
            this.element.style.cursor = '';
            this.isPointerAction = false;
            return;
        }
        const region = this.getRegionName(event.offsetX);
        this.currRegion = region;
        switch (region) {
            case undefined:
                this.isPointerAction = false;
                break;
            default:
                this.isPointerAction = true;
                this.pointerActionX = event.offsetX;
        }
        this.setPointerCursor(region);
    }
    handlePointerUp(event) {
        if (event.buttons !== 0 || event.button !== 0) {
            this.element.style.cursor = '';
            this.isPointerAction = false;
            return;
        }
        if (this.isPointerAction) {
            this.isPointerAction = false;
        }
        const region = this.getRegionName(event.offsetX);
        this.setPointerCursor(region);
    }
    handlePointerMove(event) {
        if (this.isPointerAction) {
            const model = this._model;
            if (!model)
                return;
            const x = event.offsetX;
            const rangeOffset = (x - this.pointerActionX) * this.rangePerPixel;
            this.pointerActionX = x;
            switch (this.currRegion) {
                case 1:
                    model.moveRangeStartBy(rangeOffset);
                    break;
                case 2:
                    model.moveRangeBy(rangeOffset);
                    break;
                case 3:
                    model.moveRangeEndBy(rangeOffset);
                    break;
            }
        }
        else {
            if (event.buttons !== 0)
                return;
            const region = this.getRegionName(event.offsetX);
            this.setPointerCursor(region);
        }
    }
    handlePointerEnter(event) {
        if (event.buttons !== 0)
            return;
        const region = this.getRegionName(event.offsetX);
        this.setPointerCursor(region);
    }
    handlePointerLeave() {
        this.element.style.cursor = '';
        this.isPointerAction = false;
    }
    renderAnimationFrame(timestamp) {
        const animationState = this.animationState;
        const { prevMax, nextMax, lineCount, timestamp: prevTs, changingLineCount, lineInfoList } = animationState;
        const { theme, width, height } = this;
        const context = this.canvas.getContext('2d', { alpha: false });
        context.fillStyle = theme.backgroundColor;
        context.fillRect(0, 0, width, height);
        if (lineCount === 0)
            return;
        const model = this._model;
        if (!model)
            return;
        let progressRatio = animationState.progressRatio;
        let timeDiff;
        if (prevTs !== undefined) {
            timeDiff = timestamp - prevTs;
            progressRatio += timeDiff / theme.animationDuration;
            if (progressRatio + theme.animationProgressRatioE >= 1)
                progressRatio = 1;
        }
        else if (progressRatio != 0)
            throw Error(`Unexpected behavior: AnimationState.progressRatio must be 0 but the current value is ${progressRatio} when AnimationState.timestamp is undefined.`);
        const { currRangeStart: start, currRangeEnd: end, maxRangeLength: maxRange } = model;
        const rangeSelectorTheme = theme.rangeSelector;
        const rangeBorderWidth = rangeSelectorTheme.rangeBorderWidth;
        context.fillStyle = rangeSelectorTheme.rangeBorderColor;
        const xStep = (width - rangeBorderWidth * 2) / maxRange;
        const rangeStartPixelOffset = start * xStep;
        const rangeEndPixelOffset = end * xStep + rangeBorderWidth;
        context.fillRect(rangeStartPixelOffset, 0, rangeBorderWidth, height);
        context.fillRect(rangeEndPixelOffset, 0, rangeBorderWidth, height);
        const color = new Color();
        for (let i = 0; i < lineCount; i++) {
            const lineInfo = lineInfoList[i];
            const line = lineInfo[0];
            let hScale;
            switch (lineInfo[1]) {
                case 0: continue;
                case 2:
                    {
                        hScale = height / nextMax;
                        color.assignFrom(line.color);
                        color.alpha = Math.round(color.alpha * progressRatio);
                        break;
                    }
                case 3:
                    {
                        hScale = height / prevMax;
                        color.assignFrom(line.color);
                        color.alpha = Math.round(color.alpha * (1 - progressRatio));
                        break;
                    }
                case 1:
                    {
                        hScale = height / (prevMax + (nextMax - prevMax) * progressRatio);
                        color.assignFrom(line.color);
                        break;
                    }
                default: throw new Error(`Invalid ChartLineVState: ${lineInfo[1]}.`);
            }
            renderLine(context, line.column, color.toString(), theme.lineWidth, rangeBorderWidth, xStep, height, hScale);
        }
        context.fillStyle = rangeSelectorTheme.shadeColor;
        const leftShadeWidth = rangeStartPixelOffset - rangeBorderWidth;
        if (leftShadeWidth > 0)
            context.fillRect(rangeBorderWidth, 0, leftShadeWidth, height);
        const rightShadeWidth = width - (rangeEndPixelOffset + rangeBorderWidth * 2);
        if (rightShadeWidth > 0)
            context.fillRect(rangeEndPixelOffset + rangeBorderWidth, 0, rightShadeWidth, height);
        if (changingLineCount > 0 && progressRatio < 1) {
            animationState.progressRatio = progressRatio;
            animationState.timestamp = timestamp;
            animationState.frameRequestId = requestAnimationFrame(this.renderAnimationFrame);
        }
        else
            animationState.frameRequestId = undefined;
    }
    [chartModelChangeHandlerKey](model, timestamp) {
        const animationState = this.animationState;
        animationState.prevMax = model.prevMax;
        animationState.nextMax = model.currMax;
        animationState.progressRatio = 0;
        animationState.timestamp = undefined;
        let lineCount = 0;
        let changingLineCount = 0;
        const lineInfoList = animationState.lineInfoList;
        for (const line of model.lines.values()) {
            switch (getChartLineVState(line)) {
                case 2:
                    {
                        const lineInfo = lineInfoList[lineCount];
                        lineInfo[0] = line;
                        lineInfo[1] = 2;
                        changingLineCount++;
                        lineCount++;
                        break;
                    }
                case 3:
                    {
                        const lineInfo = lineInfoList[lineCount];
                        lineInfo[0] = line;
                        lineInfo[1] = 3;
                        changingLineCount++;
                        lineCount++;
                        break;
                    }
                case 1:
                    {
                        const lineInfo = lineInfoList[lineCount];
                        lineInfo[0] = line;
                        lineInfo[1] = 1;
                        lineCount++;
                        break;
                    }
            }
        }
        animationState.lineCount = lineCount;
        animationState.changingLineCount = changingLineCount;
        if (animationState.frameRequestId === undefined)
            this.renderAnimationFrame(timestamp);
    }
}
const renderLine = (context, column, color, lineWidth, x, xStep, height, hScale) => {
    const columnLen = column.length;
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.moveTo(x, height - column[1] * hScale);
    for (let i = 2; i < columnLen; i++) {
        x += xStep;
        context.lineTo(x, height - column[i] * hScale);
    }
    context.stroke();
};
export const TagName = 'canvas-chart-range-selector';
export class CanvasChartRangeSelectorElement extends ChartContextConsumerElement {
    createController(model) {
        return new CanvasChartRangeSelector(this, model);
    }
}
customElements.define(TagName, CanvasChartRangeSelectorElement);
//# sourceMappingURL=CanvasChartRangeSelector.js.map