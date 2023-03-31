import { chartModelChangeHandlerKey, getChartLineVState } from "./ChartModel.js";
import { getCurrentTheme, addShadowRootContainer, removeShadowRootContainer } from "./ChartTheme.js";
import { Color, getMonthDayString, PIx2, missingTemplateElementMsg, missingElementInsideTemplateMsg } from "./common.js";
import { ChartContextTemplateConsumerElement } from "./ChartContextTemplateConsumer.js";
const calcProgressRatio = (state, timestamp, theme) => {
    const prevTimestamp = state.timestamp;
    if (prevTimestamp !== undefined) {
        const timeDiff = timestamp - prevTimestamp;
        let progressRatio = state.progressRatio;
        progressRatio += timeDiff / theme.animationDuration;
        if (progressRatio + theme.animationProgressRatioE >= 1)
            progressRatio = 1;
        state.progressRatio = progressRatio;
    }
    else if (state.progressRatio != 0)
        throw Error(`Unexpected behavior: AnimationState.progressRatio must be 0 but the current value is ${state.progressRatio} when AnimationState.timestamp is undefined.`);
    state.timestamp = timestamp;
};
class CanvasChartView {
    constructor(element, model, pointTooltip, pointTooltipContainer, dateContainer, templateProvider, pointInfoTemplateKey) {
        this.element = element;
        this.pointTooltip = pointTooltip;
        this.pointTooltipContainer = pointTooltipContainer;
        this.dateContainer = dateContainer;
        this.templateProvider = templateProvider;
        this.pointInfoTemplateKey = pointInfoTemplateKey;
        this.chartWidth = 0;
        this.chartLeftBorder = 0;
        this.chartRightBorder = 0;
        this.font = '';
        this.xLabelOptWidth = 0;
        this.xLabelOptCountPerView = 0;
        this.isPointToolTipUpdated = false;
        this.theme = getCurrentTheme();
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        this.element.shadowRoot.append(canvas);
        const styles = window.getComputedStyle(canvas);
        const width = parseInt(styles.width);
        canvas.width = width;
        this.width = width;
        const height = parseInt(styles.height);
        canvas.height = height;
        this.height = height;
        this.canvas = canvas;
        this.measureXLabel();
        this.animationState =
            {
                frameRequestId: undefined,
                timestamp: undefined,
                prevMax: 0,
                nextMax: 0,
                progressRatio: 0,
                changingLineCount: 0,
                lineInfoMap: new Map(),
                xLabels: new Map(),
                pixelsPerIndex: undefined,
                xGridLine: undefined,
            };
        this.renderAnimationFrame = this.renderAnimationFrame.bind(this);
        canvas.onmousemove = this.handlePointerMove.bind(this);
        canvas.onmouseenter = this.handlePointerEnter.bind(this);
        canvas.onmouseleave = this.handlePointerLeave.bind(this);
        this.model = model;
    }
    get model() { return this._model; }
    set model(newModel) {
        const oldModel = this._model;
        if (oldModel === newModel)
            return;
        const lineInfoList = this.animationState.lineInfoMap;
        if (oldModel) {
            oldModel.unsubscribe(this);
            lineInfoList.clear();
        }
        this._model = newModel;
        if (!newModel)
            return;
        newModel.subscribe(this);
    }
    disconnect() {
        this.model = undefined;
    }
    measureXLabel() {
        const context = this.canvas.getContext('2d', { alpha: false });
        const viewTheme = this.theme.view;
        const font = `${viewTheme.fontSize}px ${viewTheme.fontFamily}`;
        this.font = font;
        context.font = font;
        const xLabelOptWidth = context.measureText('Sept 00').width;
        this.xLabelOptWidth = xLabelOptWidth;
        const chartWidth = this.width - xLabelOptWidth;
        this.chartLeftBorder = xLabelOptWidth / 2;
        this.chartRightBorder = this.chartLeftBorder;
        this.xLabelOptCountPerView = Math.floor(chartWidth / xLabelOptWidth);
        this.chartWidth = chartWidth;
    }
    [chartModelChangeHandlerKey](model, timestamp) {
        const animationState = this.animationState;
        if (animationState.timestamp === undefined) {
            animationState.prevMax = model.prevRangeMax;
        }
        else {
            if (animationState.nextMax != model.prevRangeMax)
                console.log('animationState.nextMax != model.prevRangeMax', animationState.nextMax, model.prevRangeMax);
            animationState.prevMax += (animationState.nextMax - animationState.prevMax) * animationState.progressRatio;
        }
        animationState.nextMax = model.currRangeMax;
        animationState.progressRatio = 0;
        animationState.timestamp = undefined;
        let changingLineCount = 0;
        const lineInfoMap = animationState.lineInfoMap;
        for (const line of model.orderedLines) {
            let lineInfo = lineInfoMap.get(line.key);
            switch (getChartLineVState(line)) {
                case 2:
                    {
                        if (lineInfo) {
                            lineInfo.line = line;
                            lineInfo.vState = 2;
                            if (lineInfo.pointInfoElement)
                                lineInfo.pointInfoElement.remove();
                        }
                        else {
                            lineInfo =
                                {
                                    line,
                                    vState: 2,
                                };
                            lineInfoMap.set(line.key, lineInfo);
                        }
                        changingLineCount++;
                        break;
                    }
                case 3:
                    {
                        if (lineInfo) {
                            lineInfo.line = line;
                            lineInfo.vState = 3;
                            if (lineInfo.pointInfoElement) {
                                lineInfo.pointInfoElement.remove();
                                lineInfo.pointInfoElement = undefined;
                                lineInfo.pointValueElement = undefined;
                                lineInfo.lineNameElement = undefined;
                            }
                        }
                        else {
                            lineInfo =
                                {
                                    line,
                                    vState: 3,
                                };
                            lineInfoMap.set(line.key, lineInfo);
                        }
                        changingLineCount++;
                        break;
                    }
                case 1:
                    {
                        if (lineInfo) {
                            lineInfo.line = line;
                            lineInfo.vState = 1;
                            if (lineInfo.pointInfoElement)
                                lineInfo.pointInfoElement.remove();
                        }
                        else {
                            lineInfo =
                                {
                                    line,
                                    vState: 1,
                                };
                            lineInfoMap.set(line.key, lineInfo);
                        }
                        break;
                    }
                case 0:
                    {
                        if (lineInfo) {
                            if (lineInfo.pointInfoElement) {
                                lineInfo.pointInfoElement.remove();
                                lineInfo.pointInfoElement = undefined;
                                lineInfo.pointValueElement = undefined;
                                lineInfo.lineNameElement = undefined;
                            }
                            lineInfoMap.delete(line.key);
                        }
                    }
            }
        }
        animationState.changingLineCount = changingLineCount;
        this.isPointToolTipUpdated = false;
        const { chartWidth, xLabelOptCountPerView } = this;
        const xLabelPrevMap = animationState.xLabels;
        const xLabelNewMap = new Map();
        const { currRangeStart, currRangeEnd, xColumn, maxRangeLength } = model;
        const currRangeLength = currRangeEnd - currRangeStart;
        const context = this.canvas.getContext('2d', { alpha: false });
        context.font = this.font;
        const limitWidth = chartWidth + this.xLabelOptWidth / 2;
        if (currRangeLength > 0.5) {
            let pack = Math.pow(2, Math.ceil(Math.log2(currRangeLength / xLabelOptCountPerView)));
            if (pack < 1)
                pack = 1;
            const pixelsPerIndex = chartWidth / currRangeLength;
            animationState.pixelsPerIndex = pixelsPerIndex;
            const startPackNum = currRangeStart / pack;
            let index = Math.trunc(startPackNum) * pack;
            while (true) {
                const left = (index - currRangeStart) * pixelsPerIndex;
                const date = xColumn[index + 1];
                if (date === undefined)
                    console.log(`[${currRangeStart} : ${currRangeEnd}] ${index} ${Math.round(index) + 1}`);
                const text = getMonthDayString(date);
                const pixelWidth = context.measureText(text).width;
                const xTextOffset = left - pixelWidth / 2;
                if (xTextOffset + pixelWidth <= 0) {
                    index += pack;
                    continue;
                }
                if (xTextOffset >= limitWidth)
                    break;
                let xLabel = xLabelPrevMap.get(index);
                if (xLabel) {
                    xLabel.isVisible = true;
                    xLabel.left = xTextOffset;
                    xLabelNewMap.set(index, xLabel);
                    xLabelPrevMap.delete(index);
                }
                else {
                    xLabel =
                        {
                            index: index,
                            left: xTextOffset,
                            isVisible: true,
                            text,
                            pixelWidth,
                            progressRatio: 0,
                            timestamp: undefined,
                        };
                    xLabelNewMap.set(index, xLabel);
                }
                index += pack;
                if (index > maxRangeLength) {
                    break;
                }
            }
            for (const xLabel of xLabelPrevMap.values()) {
                const newLeft = (xLabel.index - currRangeStart) * pixelsPerIndex - xLabel.pixelWidth / 2;
                if (newLeft + xLabel.pixelWidth > 0 && newLeft < limitWidth) {
                    xLabel.left = newLeft;
                    if (xLabel.isVisible) {
                        xLabel.isVisible = false;
                        xLabel.progressRatio = 0;
                        xLabel.timestamp = undefined;
                    }
                    xLabelNewMap.set(xLabel.index, xLabel);
                }
            }
        }
        else {
            animationState.pixelsPerIndex = undefined;
            const index = Math.round(currRangeStart);
            const date = xColumn[index + 1];
            const text = getMonthDayString(date);
            const pixelWidth = context.measureText(text).width;
            const left = chartWidth / 2;
            const xTextOffset = left - pixelWidth / 2;
            let xLabel = xLabelPrevMap.get(index);
            if (xLabel) {
                xLabel.isVisible = true;
                xLabel.left = xTextOffset;
                xLabelNewMap.set(index, xLabel);
                xLabelPrevMap.delete(index);
            }
            else {
                xLabel =
                    {
                        index: index,
                        left: xTextOffset,
                        isVisible: true,
                        text,
                        pixelWidth,
                        progressRatio: 0,
                        timestamp: undefined,
                    };
                xLabelNewMap.set(index, xLabel);
            }
        }
        animationState.xLabels = xLabelNewMap;
        if (animationState.frameRequestId === undefined)
            this.renderAnimationFrame(timestamp);
    }
    renderAnimationFrame(timestamp) {
        const { animationState, theme, width, chartWidth, height, chartLeftBorder, chartRightBorder } = this;
        const { prevMax, nextMax, changingLineCount, lineInfoMap: lineInfoList, xGridLine, pixelsPerIndex } = animationState;
        const { minAlpha, backgroundColor, view: viewTheme } = theme;
        const context = this.canvas.getContext('2d', { alpha: false });
        context.beginPath();
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, width, height);
        context.fill();
        if (animationState.lineInfoMap.size === 0)
            return;
        const color = new Color();
        const model = this._model;
        if (!model)
            return;
        calcProgressRatio(animationState, timestamp, theme);
        const progressRatio = animationState.progressRatio;
        const { currRangeStart, currRangeEnd } = model;
        const { yGridLineColor, labelColor: themeLabelColor, yGridLineCount } = viewTheme;
        const currRangeLength = currRangeEnd - currRangeStart;
        const xAxisHeight = viewTheme.xLabelLineSpace + viewTheme.fontSize;
        const graphHeight = height - xAxisHeight;
        context.textBaseline = 'top';
        const textBaseline = graphHeight + viewTheme.xLabelLineSpace;
        context.font = this.font;
        let isXLabelAnimation = false;
        let leftOffset = chartLeftBorder;
        for (const xLabel of animationState.xLabels.values()) {
            calcProgressRatio(xLabel, timestamp, theme);
            const progressRatio = xLabel.progressRatio;
            color.assignFrom(themeLabelColor);
            if (progressRatio < 1) {
                if (xLabel.isVisible) {
                    color.alpha = Math.round(color.alpha * progressRatio);
                }
                else {
                    color.alpha = Math.round(color.alpha * (1 - progressRatio));
                }
                isXLabelAnimation = true;
                context.beginPath();
                context.fillStyle = color.toString();
                context.fillText(xLabel.text, Math.round(leftOffset + xLabel.left), textBaseline);
                context.stroke();
            }
            else {
                if (!xLabel.isVisible) {
                    animationState.xLabels.delete(xLabel.index);
                }
                else {
                    context.beginPath();
                    context.fillStyle = color.toString();
                    context.fillText(xLabel.text, Math.round(leftOffset + xLabel.left), textBaseline);
                    context.stroke();
                    renderVertLine(context, leftOffset + xLabel.left + xLabel.pixelWidth / 2, graphHeight, 4, yGridLineColor.toString());
                }
            }
        }
        this.renderHorisontalGridLine(context, graphHeight, yGridLineColor.toString(), '0', themeLabelColor.toString());
        let startIndex;
        let endIndex;
        const maxRangeLength = model.maxRangeLength;
        leftOffset = 0;
        let visibleWidth = width;
        if (pixelsPerIndex != undefined) {
            startIndex = currRangeStart - chartLeftBorder / pixelsPerIndex;
            if (startIndex < 0) {
                leftOffset = -Math.round(startIndex * pixelsPerIndex);
                startIndex = 0;
            }
            else
                startIndex = Math.round(startIndex);
            endIndex = currRangeEnd + chartRightBorder / pixelsPerIndex;
            if (endIndex > maxRangeLength) {
                endIndex = maxRangeLength;
            }
            else
                endIndex = Math.round(endIndex);
        }
        else {
            startIndex = Math.round(currRangeStart);
            endIndex = Math.round(currRangeEnd);
            if (startIndex == 0)
                leftOffset = chartLeftBorder;
            if (endIndex == 0)
                visibleWidth = width - chartRightBorder;
        }
        const xStep = currRangeLength < 1 ? chartWidth : chartWidth / (currRangeEnd - currRangeStart);
        const maxDiff = nextMax - prevMax;
        const isMaxAnimation = Math.abs(maxDiff) >= 1;
        const hScale = isMaxAnimation ? graphHeight / (prevMax + (maxDiff) * progressRatio) : graphHeight / nextMax;
        const yGridHeight = graphHeight / (yGridLineCount + 1);
        if (isMaxAnimation && progressRatio < 1) {
            const labelColor = new Color(themeLabelColor);
            labelColor.alpha = themeLabelColor.alpha * (1 - progressRatio);
            color.assignFrom(yGridLineColor);
            color.alpha = yGridLineColor.alpha * (1 - progressRatio);
            const currMax = prevMax + maxDiff * progressRatio;
            const yGridDistance = prevMax / (yGridLineCount + 1);
            let yValue = yGridDistance;
            const prevK = currMax / prevMax;
            let y = graphHeight - yGridHeight;
            for (let i = 0; i < yGridLineCount; i++) {
                this.renderHorisontalGridLine(context, Math.round(y * prevK), color.toString(), Math.round(yValue).toString(), labelColor.toString());
                y -= yGridHeight;
                yValue += yGridDistance;
            }
            if (progressRatio > 0) {
                const yGridDistance = nextMax / (yGridLineCount + 1);
                labelColor.alpha = themeLabelColor.alpha * progressRatio;
                color.alpha = yGridLineColor.alpha * progressRatio;
                let yValue = yGridDistance;
                let y = graphHeight - yGridHeight;
                const nextK = currMax / nextMax;
                for (let i = 0; i < yGridLineCount; i++) {
                    this.renderHorisontalGridLine(context, Math.round(y * nextK), color.toString(), Math.round(yValue).toString(), labelColor.toString());
                    y -= yGridHeight;
                    yValue += yGridDistance;
                }
            }
        }
        else {
            let y = graphHeight - yGridHeight;
            const yGridDistance = nextMax / (yGridLineCount + 1);
            let yValue = yGridDistance;
            for (let i = 0; i < yGridLineCount; i++) {
                this.renderHorisontalGridLine(context, Math.round(y), yGridLineColor.toString(), Math.round(yValue).toString(), themeLabelColor.toString());
                y -= yGridHeight;
                yValue += yGridDistance;
            }
        }
        for (const line of model.orderedLines) {
            const lineInfo = lineInfoList.get(line.key);
            if (!lineInfo)
                continue;
            switch (lineInfo.vState) {
                case 0: continue;
                case 2:
                    {
                        color.assignFrom(line.color);
                        color.alpha = Math.round(color.alpha * progressRatio);
                        if (color.alpha <= minAlpha)
                            continue;
                        break;
                    }
                case 3:
                    {
                        color.assignFrom(line.color);
                        color.alpha = Math.round(color.alpha * (1 - progressRatio));
                        if (color.alpha <= minAlpha)
                            continue;
                        break;
                    }
                case 1:
                    {
                        hScale;
                        color.assignFrom(line.color);
                        break;
                    }
                default: throw new Error(`Invalid ChartLineVState: ${lineInfo.vState}.`);
            }
            renderLine(context, line.column, startIndex, maxRangeLength, color.toString(), theme.lineWidth, leftOffset, visibleWidth, xStep, graphHeight, hScale);
            if (xGridLine !== undefined) {
                const index = Math.round(pixelsPerIndex !== undefined ? currRangeStart + (xGridLine - this.chartLeftBorder) / pixelsPerIndex : currRangeStart);
                if (index >= 0) {
                    const xGridLineInt = Math.round(xGridLine);
                    context.beginPath();
                    context.strokeStyle = viewTheme.xGridLineColor.toString();
                    context.lineWidth = 1;
                    context.moveTo(xGridLineInt, 0);
                    context.lineTo(xGridLineInt, graphHeight);
                    context.stroke();
                    const y = line.column[index + 1];
                    const cy = Math.round(graphHeight - y * hScale);
                    context.beginPath();
                    context.fillStyle = theme.backgroundColor;
                    context.strokeStyle = color.toString();
                    context.lineWidth = theme.lineWidth;
                    context.arc(xGridLineInt, cy, viewTheme.pointRadius, 0, PIx2);
                    context.fill();
                    context.stroke();
                }
            }
        }
        if ((changingLineCount > 0 || isMaxAnimation || isXLabelAnimation) && progressRatio < 1) {
            animationState.progressRatio = progressRatio;
            animationState.timestamp = timestamp;
            animationState.frameRequestId = requestAnimationFrame(this.renderAnimationFrame);
        }
        else
            animationState.frameRequestId = undefined;
    }
    renderHorisontalGridLine(context, y, lineColor, text, textColor) {
        context.beginPath();
        context.strokeStyle = lineColor;
        context.lineWidth = 1;
        context.moveTo(0, y);
        context.lineTo(this.width, y);
        context.stroke();
        context.textBaseline = 'bottom';
        context.font = this.font;
        context.fillStyle = textColor;
        context.fillText(text, 0, y);
        context.stroke();
    }
    handlePointerMove(event) {
        if (event.buttons != 0)
            this.resetXGridLine();
        else
            this.setXGridLine(event.x, event.y, event.offsetX);
    }
    handlePointerEnter(event) {
        if (event.buttons != 0)
            this.resetXGridLine();
        else
            this.setXGridLine(event.x, event.y, event.offsetX);
    }
    handlePointerLeave() {
        this.resetXGridLine();
    }
    setXGridLine(x, y, offsetX) {
        const model = this._model;
        if (!model)
            return;
        const state = this.animationState;
        const prev = state.xGridLine;
        state.xGridLine = offsetX;
        if (prev === undefined || prev != offsetX) {
            if (state.frameRequestId === undefined)
                state.frameRequestId = requestAnimationFrame(this.renderAnimationFrame);
        }
        if (state.pixelsPerIndex === undefined)
            throw new Error();
        const index = Math.round(model.currRangeStart + (offsetX - this.chartLeftBorder) / state.pixelsPerIndex);
        if (index >= 0 && index <= model.maxRangeLength)
            this.showPointToolTip(x, y, index);
    }
    resetXGridLine() {
        const state = this.animationState;
        const prev = state.xGridLine;
        state.xGridLine = undefined;
        if (prev !== undefined) {
            if (state.frameRequestId === undefined)
                state.frameRequestId = requestAnimationFrame(this.renderAnimationFrame);
        }
        this.hidePointToolTip();
    }
    showPointToolTip(x, y, index) {
        const model = this._model;
        if (!model)
            return;
        this.updatePointToolTip();
        this.dateContainer.textContent = getMonthDayString(model.xColumn[index + 1]);
        const lineInfoMap = this.animationState.lineInfoMap;
        for (const lineInfo of lineInfoMap.values()) {
            if (lineInfo.vState === 1 || lineInfo.vState === 2) {
                lineInfo.pointValueElement.textContent = lineInfo.line.column[index + 1].toString();
            }
        }
        const style = this.pointTooltip.style;
        style.display = '';
        setTimeout(setPointToolTipPos, 0, this.pointTooltip, x, y);
    }
    hidePointToolTip() {
        this.pointTooltip.style.display = 'none';
    }
    updatePointToolTip() {
        if (this.isPointToolTipUpdated)
            return;
        this.isPointToolTipUpdated = true;
        const lineInfoMap = this.animationState.lineInfoMap;
        for (const line of this._model.currVisibleLines) {
            const lineInfo = lineInfoMap.get(line.key);
            if (!lineInfo)
                throw new Error(`The line '${line.key}' is visible but its animation state was not found.`);
            let pointInfoElement = lineInfo.pointInfoElement;
            if (!pointInfoElement) {
                const pointInfoFragment = this.templateProvider.createElementFromTemplate(this.pointInfoTemplateKey);
                pointInfoElement = pointInfoFragment.firstElementChild;
                if (!pointInfoElement)
                    throw new Error(`The template '${this.pointInfoTemplateKey}' doesn't contain child element.`);
                pointInfoElement.style.color = line.color.toString();
                lineInfo.pointInfoElement = pointInfoElement;
                const lineNameElement = pointInfoFragment.getElementById("LineName");
                if (!lineNameElement)
                    throw new Error(missingTemplateElementMsg(TagName, this.pointInfoTemplateKey, "LineName"));
                lineNameElement.textContent = line.name;
                lineInfo.lineNameElement = lineNameElement;
                const pointValueElement = pointInfoFragment.getElementById("PointValue");
                if (!pointValueElement)
                    throw new Error(missingTemplateElementMsg(TagName, this.pointInfoTemplateKey, "PointValue"));
                lineInfo.pointValueElement = pointValueElement;
            }
            this.pointTooltipContainer.appendChild(pointInfoElement);
        }
    }
}
const setPointToolTipPos = (element, x, y) => {
    const style = element.style;
    const computed = getComputedStyle(element);
    const width = parseInt(computed.width);
    const height = parseInt(computed.height);
    style.top = (y - height - 20) + 'px';
    style.left = Math.round(x - (width / 2)) + 'px';
};
const renderVertLine = (context, x, y, height, color) => {
    context.beginPath();
    context.strokeStyle = color;
    context.moveTo(x, y);
    context.lineTo(x, y + height);
};
const renderLine = (context, column, start, end, color, lineWidth, x, x2, xStep, height, hScale) => {
    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    start++;
    end++;
    let currX = x;
    context.moveTo(currX, Math.round(height - column[start] * hScale));
    if (start == end) {
        currX += xStep;
        context.lineTo(Math.round(currX), Math.round(height - column[start] * hScale));
    }
    else {
        let i = start + 1;
        currX += xStep;
        for (; i <= end && currX < x2; i++, currX += xStep) {
            context.lineTo(Math.round(currX), Math.round(height - column[i] * hScale));
        }
        if (i <= end) {
            context.lineTo(Math.round(currX), Math.round(height - column[i] * hScale));
        }
    }
    context.stroke();
};
export class CanvasChartViewElement extends ChartContextTemplateConsumerElement {
    createController(model) {
        const pointTooltipTemplatekey = this.getRequiredAttribute("point-tooltip-templatekey");
        const templateProvider = this.templateProvider;
        const pointTooltipFragment = templateProvider.createElementFromTemplate(pointTooltipTemplatekey);
        const pointTooltip = pointTooltipFragment.firstElementChild;
        if (!pointTooltip)
            throw new Error(`The template '${pointTooltipTemplatekey}' doesn't contain a child element.`);
        pointTooltip.style.position = 'fixed';
        const dateContainer = pointTooltipFragment.getElementById("DateContainer");
        if (!dateContainer)
            throw new Error(missingElementInsideTemplateMsg(TagName, pointTooltipTemplatekey, "DateContainer"));
        const pointTooltipContainer = pointTooltipFragment.getElementById("PointTooltipContainer");
        if (!pointTooltipContainer)
            throw new Error(missingElementInsideTemplateMsg(TagName, pointTooltipTemplatekey, "PointTooltipContainer"));
        const pointInfoTemplateKey = this.getRequiredAttribute("point-info-templatekey");
        this.shadowRoot.appendChild(pointTooltip);
        return new CanvasChartView(this, model, pointTooltip, pointTooltipContainer, dateContainer, templateProvider, pointInfoTemplateKey);
    }
    connectedCallback() {
        super.connectedCallback();
        this.style.position = 'relative';
        this.attachShadow({ mode: 'open' });
        addShadowRootContainer(this);
    }
    disconnectedCallback() {
        removeShadowRootContainer(this);
    }
}
export const TagName = 'canvas-chart-view';
customElements.define(TagName, CanvasChartViewElement);
//# sourceMappingURL=CanvasChartView.js.map