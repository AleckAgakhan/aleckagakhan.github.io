var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
define(["require", "exports", "./ChartModel", "./ChartTheme", "./common", "./ChartContextTemplateConsumer"], function (require, exports, ChartModel_1, ChartTheme_1, common_1, ChartContextTemplateConsumer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var calcProgressRatio = function (state, timestamp, theme) {
        var prevTimestamp = state.timestamp;
        if (prevTimestamp !== undefined) {
            var timeDiff = timestamp - prevTimestamp;
            var progressRatio = state.progressRatio;
            progressRatio += timeDiff / theme.animationDuration;
            if (progressRatio + theme.animationProgressRatioE >= 1)
                progressRatio = 1;
            state.progressRatio = progressRatio;
        }
        else if (state.progressRatio != 0)
            throw Error("Unexpected behavior: AnimationState.progressRatio must be 0 but the current value is " + state.progressRatio + " when AnimationState.timestamp is undefined.");
        state.timestamp = timestamp;
    };
    var CanvasChartView = (function () {
        function CanvasChartView(element, model, pointTooltip, pointTooltipContainer, dateContainer, templateProvider, pointInfoTemplateKey) {
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
            this.theme = ChartTheme_1.getCurrentTheme();
            var canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            this.element.shadowRoot.append(canvas);
            var styles = window.getComputedStyle(canvas);
            var width = parseInt(styles.width);
            canvas.width = width;
            this.width = width;
            var height = parseInt(styles.height);
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
        Object.defineProperty(CanvasChartView.prototype, "model", {
            get: function () { return this._model; },
            set: function (newModel) {
                var oldModel = this._model;
                if (oldModel === newModel)
                    return;
                var lineInfoList = this.animationState.lineInfoMap;
                if (oldModel) {
                    oldModel.unsubscribe(this);
                    lineInfoList.clear();
                }
                this._model = newModel;
                if (!newModel)
                    return;
                newModel.subscribe(this);
            },
            enumerable: true,
            configurable: true
        });
        CanvasChartView.prototype.disconnect = function () {
            this.model = undefined;
        };
        CanvasChartView.prototype.measureXLabel = function () {
            var context = this.canvas.getContext('2d', { alpha: false });
            var viewTheme = this.theme.view;
            var font = viewTheme.fontSize + "px " + viewTheme.fontFamily;
            this.font = font;
            context.font = font;
            var xLabelOptWidth = context.measureText('Sept 00').width;
            this.xLabelOptWidth = xLabelOptWidth;
            var chartWidth = this.width - xLabelOptWidth;
            this.chartLeftBorder = xLabelOptWidth / 2;
            this.chartRightBorder = this.chartLeftBorder;
            this.xLabelOptCountPerView = Math.floor(chartWidth / xLabelOptWidth);
            this.chartWidth = chartWidth;
        };
        CanvasChartView.prototype[ChartModel_1.chartModelChangeHandlerKey] = function (model, timestamp) {
            var e_1, _a, e_2, _b;
            var animationState = this.animationState;
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
            var changingLineCount = 0;
            var lineInfoMap = animationState.lineInfoMap;
            try {
                for (var _c = __values(model.orderedLines), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var line = _d.value;
                    var lineInfo = lineInfoMap.get(line.key);
                    switch (ChartModel_1.getChartLineVState(line)) {
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
                                            line: line,
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
                                            line: line,
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
                                            line: line,
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
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            animationState.changingLineCount = changingLineCount;
            this.isPointToolTipUpdated = false;
            var _e = this, chartWidth = _e.chartWidth, xLabelOptCountPerView = _e.xLabelOptCountPerView;
            var xLabelPrevMap = animationState.xLabels;
            var xLabelNewMap = new Map();
            var currRangeStart = model.currRangeStart, currRangeEnd = model.currRangeEnd, xColumn = model.xColumn, maxRangeLength = model.maxRangeLength;
            var currRangeLength = currRangeEnd - currRangeStart;
            var context = this.canvas.getContext('2d', { alpha: false });
            context.font = this.font;
            var limitWidth = chartWidth + this.xLabelOptWidth / 2;
            if (currRangeLength > 0.5) {
                var pack = Math.pow(2, Math.ceil(Math.log2(currRangeLength / xLabelOptCountPerView)));
                if (pack < 1)
                    pack = 1;
                var pixelsPerIndex = chartWidth / currRangeLength;
                animationState.pixelsPerIndex = pixelsPerIndex;
                var startPackNum = currRangeStart / pack;
                var index = Math.trunc(startPackNum) * pack;
                while (true) {
                    var left = (index - currRangeStart) * pixelsPerIndex;
                    var date = xColumn[index + 1];
                    if (date === undefined)
                        console.log("[" + currRangeStart + " : " + currRangeEnd + "] " + index + " " + (Math.round(index) + 1));
                    var text = common_1.getMonthDayString(date);
                    var pixelWidth = context.measureText(text).width;
                    var xTextOffset = left - pixelWidth / 2;
                    if (xTextOffset + pixelWidth <= 0) {
                        index += pack;
                        continue;
                    }
                    if (xTextOffset >= limitWidth)
                        break;
                    var xLabel = xLabelPrevMap.get(index);
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
                                text: text,
                                pixelWidth: pixelWidth,
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
                try {
                    for (var _f = __values(xLabelPrevMap.values()), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var xLabel = _g.value;
                        var newLeft = (xLabel.index - currRangeStart) * pixelsPerIndex - xLabel.pixelWidth / 2;
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
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            else {
                animationState.pixelsPerIndex = undefined;
                var index = Math.round(currRangeStart);
                var date = xColumn[index + 1];
                var text = common_1.getMonthDayString(date);
                var pixelWidth = context.measureText(text).width;
                var left = chartWidth / 2;
                var xTextOffset = left - pixelWidth / 2;
                var xLabel = xLabelPrevMap.get(index);
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
                            text: text,
                            pixelWidth: pixelWidth,
                            progressRatio: 0,
                            timestamp: undefined,
                        };
                    xLabelNewMap.set(index, xLabel);
                }
            }
            animationState.xLabels = xLabelNewMap;
            if (animationState.frameRequestId === undefined)
                this.renderAnimationFrame(timestamp);
        };
        CanvasChartView.prototype.renderAnimationFrame = function (timestamp) {
            var e_3, _a, e_4, _b;
            var _c = this, animationState = _c.animationState, theme = _c.theme, width = _c.width, chartWidth = _c.chartWidth, height = _c.height, chartLeftBorder = _c.chartLeftBorder, chartRightBorder = _c.chartRightBorder;
            var prevMax = animationState.prevMax, nextMax = animationState.nextMax, changingLineCount = animationState.changingLineCount, lineInfoList = animationState.lineInfoMap, xGridLine = animationState.xGridLine, pixelsPerIndex = animationState.pixelsPerIndex;
            var minAlpha = theme.minAlpha, backgroundColor = theme.backgroundColor, viewTheme = theme.view;
            var context = this.canvas.getContext('2d', { alpha: false });
            context.beginPath();
            context.fillStyle = backgroundColor;
            context.fillRect(0, 0, width, height);
            context.fill();
            if (animationState.lineInfoMap.size === 0)
                return;
            var color = new common_1.Color();
            var model = this._model;
            if (!model)
                return;
            calcProgressRatio(animationState, timestamp, theme);
            var progressRatio = animationState.progressRatio;
            var currRangeStart = model.currRangeStart, currRangeEnd = model.currRangeEnd;
            var yGridLineColor = viewTheme.yGridLineColor, themeLabelColor = viewTheme.labelColor, yGridLineCount = viewTheme.yGridLineCount;
            var currRangeLength = currRangeEnd - currRangeStart;
            var xAxisHeight = viewTheme.xLabelLineSpace + viewTheme.fontSize;
            var graphHeight = height - xAxisHeight;
            context.textBaseline = 'top';
            var textBaseline = graphHeight + viewTheme.xLabelLineSpace;
            context.font = this.font;
            var isXLabelAnimation = false;
            var leftOffset = chartLeftBorder;
            try {
                for (var _d = __values(animationState.xLabels.values()), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var xLabel = _e.value;
                    calcProgressRatio(xLabel, timestamp, theme);
                    var progressRatio_1 = xLabel.progressRatio;
                    color.assignFrom(themeLabelColor);
                    if (progressRatio_1 < 1) {
                        if (xLabel.isVisible) {
                            color.alpha = Math.round(color.alpha * progressRatio_1);
                        }
                        else {
                            color.alpha = Math.round(color.alpha * (1 - progressRatio_1));
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
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_3) throw e_3.error; }
            }
            this.renderHorisontalGridLine(context, graphHeight, yGridLineColor.toString(), '0', themeLabelColor.toString());
            var startIndex;
            var endIndex;
            var maxRangeLength = model.maxRangeLength;
            leftOffset = 0;
            var visibleWidth = width;
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
            var xStep = currRangeLength < 1 ? chartWidth : chartWidth / (currRangeEnd - currRangeStart);
            var maxDiff = nextMax - prevMax;
            var isMaxAnimation = Math.abs(maxDiff) >= 1;
            var hScale = isMaxAnimation ? graphHeight / (prevMax + (maxDiff) * progressRatio) : graphHeight / nextMax;
            var yGridHeight = graphHeight / (yGridLineCount + 1);
            if (isMaxAnimation && progressRatio < 1) {
                var labelColor = new common_1.Color(themeLabelColor);
                labelColor.alpha = themeLabelColor.alpha * (1 - progressRatio);
                color.assignFrom(yGridLineColor);
                color.alpha = yGridLineColor.alpha * (1 - progressRatio);
                var currMax = prevMax + maxDiff * progressRatio;
                var yGridDistance = prevMax / (yGridLineCount + 1);
                var yValue = yGridDistance;
                var prevK = currMax / prevMax;
                var y = graphHeight - yGridHeight;
                for (var i = 0; i < yGridLineCount; i++) {
                    this.renderHorisontalGridLine(context, Math.round(y * prevK), color.toString(), Math.round(yValue).toString(), labelColor.toString());
                    y -= yGridHeight;
                    yValue += yGridDistance;
                }
                if (progressRatio > 0) {
                    var yGridDistance_1 = nextMax / (yGridLineCount + 1);
                    labelColor.alpha = themeLabelColor.alpha * progressRatio;
                    color.alpha = yGridLineColor.alpha * progressRatio;
                    var yValue_1 = yGridDistance_1;
                    var y_1 = graphHeight - yGridHeight;
                    var nextK = currMax / nextMax;
                    for (var i = 0; i < yGridLineCount; i++) {
                        this.renderHorisontalGridLine(context, Math.round(y_1 * nextK), color.toString(), Math.round(yValue_1).toString(), labelColor.toString());
                        y_1 -= yGridHeight;
                        yValue_1 += yGridDistance_1;
                    }
                }
            }
            else {
                var y = graphHeight - yGridHeight;
                var yGridDistance = nextMax / (yGridLineCount + 1);
                var yValue = yGridDistance;
                for (var i = 0; i < yGridLineCount; i++) {
                    this.renderHorisontalGridLine(context, Math.round(y), yGridLineColor.toString(), Math.round(yValue).toString(), themeLabelColor.toString());
                    y -= yGridHeight;
                    yValue += yGridDistance;
                }
            }
            try {
                for (var _f = __values(model.orderedLines), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var line = _g.value;
                    var lineInfo = lineInfoList.get(line.key);
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
                        default: throw new Error("Invalid ChartLineVState: " + lineInfo.vState + ".");
                    }
                    renderLine(context, line.column, startIndex, maxRangeLength, color.toString(), theme.lineWidth, leftOffset, visibleWidth, xStep, graphHeight, hScale);
                    if (xGridLine !== undefined) {
                        var index = Math.round(pixelsPerIndex !== undefined ? currRangeStart + (xGridLine - this.chartLeftBorder) / pixelsPerIndex : currRangeStart);
                        if (index >= 0) {
                            var xGridLineInt = Math.round(xGridLine);
                            context.beginPath();
                            context.strokeStyle = viewTheme.xGridLineColor.toString();
                            context.lineWidth = 1;
                            context.moveTo(xGridLineInt, 0);
                            context.lineTo(xGridLineInt, graphHeight);
                            context.stroke();
                            var y = line.column[index + 1];
                            var cy = Math.round(graphHeight - y * hScale);
                            context.beginPath();
                            context.fillStyle = theme.backgroundColor;
                            context.strokeStyle = color.toString();
                            context.lineWidth = theme.lineWidth;
                            context.arc(xGridLineInt, cy, viewTheme.pointRadius, 0, common_1.PIx2);
                            context.fill();
                            context.stroke();
                        }
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_4) throw e_4.error; }
            }
            if ((changingLineCount > 0 || isMaxAnimation || isXLabelAnimation) && progressRatio < 1) {
                animationState.progressRatio = progressRatio;
                animationState.timestamp = timestamp;
                animationState.frameRequestId = requestAnimationFrame(this.renderAnimationFrame);
            }
            else
                animationState.frameRequestId = undefined;
        };
        CanvasChartView.prototype.renderHorisontalGridLine = function (context, y, lineColor, text, textColor) {
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
        };
        CanvasChartView.prototype.handlePointerMove = function (event) {
            if (event.buttons != 0)
                this.resetXGridLine();
            else
                this.setXGridLine(event.x, event.y, event.offsetX);
        };
        CanvasChartView.prototype.handlePointerEnter = function (event) {
            if (event.buttons != 0)
                this.resetXGridLine();
            else
                this.setXGridLine(event.x, event.y, event.offsetX);
        };
        CanvasChartView.prototype.handlePointerLeave = function () {
            this.resetXGridLine();
        };
        CanvasChartView.prototype.setXGridLine = function (x, y, offsetX) {
            var model = this._model;
            if (!model)
                return;
            var state = this.animationState;
            var prev = state.xGridLine;
            state.xGridLine = offsetX;
            if (prev === undefined || prev != offsetX) {
                if (state.frameRequestId === undefined)
                    state.frameRequestId = requestAnimationFrame(this.renderAnimationFrame);
            }
            if (state.pixelsPerIndex === undefined)
                throw new Error();
            var index = Math.round(model.currRangeStart + (offsetX - this.chartLeftBorder) / state.pixelsPerIndex);
            if (index >= 0 && index <= model.maxRangeLength)
                this.showPointToolTip(x, y, index);
        };
        CanvasChartView.prototype.resetXGridLine = function () {
            var state = this.animationState;
            var prev = state.xGridLine;
            state.xGridLine = undefined;
            if (prev !== undefined) {
                if (state.frameRequestId === undefined)
                    state.frameRequestId = requestAnimationFrame(this.renderAnimationFrame);
            }
            this.hidePointToolTip();
        };
        CanvasChartView.prototype.showPointToolTip = function (x, y, index) {
            var e_5, _a;
            var model = this._model;
            if (!model)
                return;
            this.updatePointToolTip();
            this.dateContainer.textContent = common_1.getMonthDayString(model.xColumn[index + 1]);
            var lineInfoMap = this.animationState.lineInfoMap;
            try {
                for (var _b = __values(lineInfoMap.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var lineInfo = _c.value;
                    if (lineInfo.vState === 1 || lineInfo.vState === 2) {
                        lineInfo.pointValueElement.textContent = lineInfo.line.column[index + 1].toString();
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            var style = this.pointTooltip.style;
            style.display = '';
            setTimeout(setPointToolTipPos, 0, this.pointTooltip, x, y);
        };
        CanvasChartView.prototype.hidePointToolTip = function () {
            this.pointTooltip.style.display = 'none';
        };
        CanvasChartView.prototype.updatePointToolTip = function () {
            var e_6, _a;
            if (this.isPointToolTipUpdated)
                return;
            this.isPointToolTipUpdated = true;
            var lineInfoMap = this.animationState.lineInfoMap;
            try {
                for (var _b = __values(this._model.currVisibleLines), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var line = _c.value;
                    var lineInfo = lineInfoMap.get(line.key);
                    if (!lineInfo)
                        throw new Error("The line '" + line.key + "' is visible but its animation state was not found.");
                    var pointInfoElement = lineInfo.pointInfoElement;
                    if (!pointInfoElement) {
                        var pointInfoFragment = this.templateProvider.createElementFromTemplate(this.pointInfoTemplateKey);
                        pointInfoElement = pointInfoFragment.firstElementChild;
                        if (!pointInfoElement)
                            throw new Error("The template '" + this.pointInfoTemplateKey + "' doesn't contain child element.");
                        pointInfoElement.style.color = line.color.toString();
                        lineInfo.pointInfoElement = pointInfoElement;
                        var lineNameElement = pointInfoFragment.getElementById("LineName");
                        if (!lineNameElement)
                            throw new Error(common_1.missingTemplateElementMsg(exports.TagName, this.pointInfoTemplateKey, "LineName"));
                        lineNameElement.textContent = line.name;
                        lineInfo.lineNameElement = lineNameElement;
                        var pointValueElement = pointInfoFragment.getElementById("PointValue");
                        if (!pointValueElement)
                            throw new Error(common_1.missingTemplateElementMsg(exports.TagName, this.pointInfoTemplateKey, "PointValue"));
                        lineInfo.pointValueElement = pointValueElement;
                    }
                    this.pointTooltipContainer.appendChild(pointInfoElement);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_6) throw e_6.error; }
            }
        };
        return CanvasChartView;
    }());
    var setPointToolTipPos = function (element, x, y) {
        var style = element.style;
        var computed = getComputedStyle(element);
        var width = parseInt(computed.width);
        var height = parseInt(computed.height);
        style.top = (y - height - 20) + 'px';
        style.left = Math.round(x - (width / 2)) + 'px';
    };
    var renderVertLine = function (context, x, y, height, color) {
        context.beginPath();
        context.strokeStyle = color;
        context.moveTo(x, y);
        context.lineTo(x, y + height);
    };
    var renderLine = function (context, column, start, end, color, lineWidth, x, x2, xStep, height, hScale) {
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        start++;
        end++;
        var currX = x;
        context.moveTo(currX, Math.round(height - column[start] * hScale));
        if (start == end) {
            currX += xStep;
            context.lineTo(Math.round(currX), Math.round(height - column[start] * hScale));
        }
        else {
            var i = start + 1;
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
    var CanvasChartViewElement = (function (_super) {
        __extends(CanvasChartViewElement, _super);
        function CanvasChartViewElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CanvasChartViewElement.prototype.createController = function (model) {
            var pointTooltipTemplatekey = this.getRequiredAttribute("point-tooltip-templatekey");
            var templateProvider = this.templateProvider;
            var pointTooltipFragment = templateProvider.createElementFromTemplate(pointTooltipTemplatekey);
            var pointTooltip = pointTooltipFragment.firstElementChild;
            if (!pointTooltip)
                throw new Error("The template '" + pointTooltipTemplatekey + "' doesn't contain a child element.");
            pointTooltip.style.position = 'fixed';
            var dateContainer = pointTooltipFragment.getElementById("DateContainer");
            if (!dateContainer)
                throw new Error(common_1.missingElementInsideTemplateMsg(exports.TagName, pointTooltipTemplatekey, "DateContainer"));
            var pointTooltipContainer = pointTooltipFragment.getElementById("PointTooltipContainer");
            if (!pointTooltipContainer)
                throw new Error(common_1.missingElementInsideTemplateMsg(exports.TagName, pointTooltipTemplatekey, "PointTooltipContainer"));
            var pointInfoTemplateKey = this.getRequiredAttribute("point-info-templatekey");
            this.shadowRoot.appendChild(pointTooltip);
            return new CanvasChartView(this, model, pointTooltip, pointTooltipContainer, dateContainer, templateProvider, pointInfoTemplateKey);
        };
        CanvasChartViewElement.prototype.connectedCallback = function () {
            _super.prototype.connectedCallback.call(this);
            this.style.position = 'relative';
            this.attachShadow({ mode: 'open' });
            ChartTheme_1.addShadowRootContainer(this);
        };
        CanvasChartViewElement.prototype.disconnectedCallback = function () {
            ChartTheme_1.removeShadowRootContainer(this);
        };
        return CanvasChartViewElement;
    }(ChartContextTemplateConsumer_1.ChartContextTemplateConsumerElement));
    exports.CanvasChartViewElement = CanvasChartViewElement;
    exports.TagName = 'canvas-chart-view';
    customElements.define(exports.TagName, CanvasChartViewElement);
});
//# sourceMappingURL=CanvasChartView.js.map