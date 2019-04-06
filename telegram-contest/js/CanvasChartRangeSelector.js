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
define(["require", "exports", "./ChartModel", "./ChartTheme", "./ChartContext", "./common"], function (require, exports, ChartModel_1, ChartTheme_1, ChartContext_1, common_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CanvasChartRangeSelector = (function () {
        function CanvasChartRangeSelector(element, model) {
            this.element = element;
            this.rangePerPixel = 0;
            this.isPointerAction = false;
            this.pointerActionX = 0;
            this.theme = ChartTheme_1.getCurrentTheme();
            var canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            element.onmousedown = this.handlePointerDown.bind(this);
            element.onmouseup = this.handlePointerUp.bind(this);
            element.onmousemove = this.handlePointerMove.bind(this);
            element.onmouseenter = this.handlePointerEnter.bind(this);
            element.onmouseleave = this.handlePointerLeave.bind(this);
            element.attachShadow({ mode: 'open' }).append(canvas);
            var styles = window.getComputedStyle(canvas);
            var width = parseInt(styles.width);
            canvas.width = width;
            var height = parseInt(styles.height);
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
        Object.defineProperty(CanvasChartRangeSelector.prototype, "model", {
            get: function () { return this._model; },
            set: function (newModel) {
                var e_1, _a;
                var oldModel = this._model;
                if (oldModel === newModel)
                    return;
                var lineInfoList = this.animationState.lineInfoList;
                if (oldModel) {
                    oldModel.unsubscribe(this);
                    try {
                        for (var lineInfoList_1 = __values(lineInfoList), lineInfoList_1_1 = lineInfoList_1.next(); !lineInfoList_1_1.done; lineInfoList_1_1 = lineInfoList_1.next()) {
                            var lineInfo = lineInfoList_1_1.value;
                            lineInfo[0] = undefined;
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (lineInfoList_1_1 && !lineInfoList_1_1.done && (_a = lineInfoList_1.return)) _a.call(lineInfoList_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                this._model = newModel;
                if (!newModel)
                    return;
                for (var i = newModel.lines.size - lineInfoList.length; i > 0; i--)
                    lineInfoList.push([undefined, 0]);
                this.rangePerPixel = newModel.maxRangeLength / (this.width - this.theme.rangeSelector.rangeBorderWidth * 2);
                newModel.subscribe(this);
            },
            enumerable: true,
            configurable: true
        });
        CanvasChartRangeSelector.prototype.disconnect = function () {
            this.model = undefined;
        };
        CanvasChartRangeSelector.prototype.getRegionName = function (x) {
            if (!this._model)
                throw Error("Invalid state for the operation 'getRegionName': the model is empty.");
            var _a = this._model, start = _a.currRangeStart, end = _a.currRangeEnd, maxRange = _a.maxRangeLength;
            var rangeBorderWidth = this.theme.rangeSelector.rangeBorderWidth;
            var rangeStep = (this.width - rangeBorderWidth * 2) / maxRange;
            var rangeStartLeft = start * rangeStep;
            if (x < 0)
                return undefined;
            if (x < rangeStartLeft)
                return 0;
            if (x <= rangeStartLeft + rangeBorderWidth)
                return 1;
            var rangeEndLeft = end * rangeStep + rangeBorderWidth;
            if (x < rangeEndLeft)
                return 2;
            if (x <= rangeEndLeft + rangeBorderWidth)
                return 3;
            if (x < this.width)
                return 4;
            return undefined;
        };
        CanvasChartRangeSelector.prototype.setPointerCursor = function (region) {
            var style = this.element.style;
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
        };
        CanvasChartRangeSelector.prototype.handlePointerDown = function (event) {
            if (event.buttons !== 1 || event.button !== 0) {
                this.element.style.cursor = '';
                this.isPointerAction = false;
                return;
            }
            var region = this.getRegionName(event.offsetX);
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
        };
        CanvasChartRangeSelector.prototype.handlePointerUp = function (event) {
            if (event.buttons !== 0 || event.button !== 0) {
                this.element.style.cursor = '';
                this.isPointerAction = false;
                return;
            }
            if (this.isPointerAction) {
                this.isPointerAction = false;
            }
            var region = this.getRegionName(event.offsetX);
            this.setPointerCursor(region);
        };
        CanvasChartRangeSelector.prototype.handlePointerMove = function (event) {
            if (this.isPointerAction) {
                var model = this._model;
                if (!model)
                    return;
                var x = event.offsetX;
                var rangeOffset = (x - this.pointerActionX) * this.rangePerPixel;
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
                var region = this.getRegionName(event.offsetX);
                this.setPointerCursor(region);
            }
        };
        CanvasChartRangeSelector.prototype.handlePointerEnter = function (event) {
            if (event.buttons !== 0)
                return;
            var region = this.getRegionName(event.offsetX);
            this.setPointerCursor(region);
        };
        CanvasChartRangeSelector.prototype.handlePointerLeave = function () {
            this.element.style.cursor = '';
            this.isPointerAction = false;
        };
        CanvasChartRangeSelector.prototype.renderAnimationFrame = function (timestamp) {
            var animationState = this.animationState;
            var prevMax = animationState.prevMax, nextMax = animationState.nextMax, lineCount = animationState.lineCount, prevTs = animationState.timestamp, changingLineCount = animationState.changingLineCount, lineInfoList = animationState.lineInfoList;
            var _a = this, theme = _a.theme, width = _a.width, height = _a.height;
            var context = this.canvas.getContext('2d', { alpha: false });
            context.fillStyle = theme.backgroundColor;
            context.fillRect(0, 0, width, height);
            if (lineCount === 0)
                return;
            var model = this._model;
            if (!model)
                return;
            var progressRatio = animationState.progressRatio;
            var timeDiff;
            if (prevTs !== undefined) {
                timeDiff = timestamp - prevTs;
                progressRatio += timeDiff / theme.animationDuration;
                if (progressRatio + theme.animationProgressRatioE >= 1)
                    progressRatio = 1;
            }
            else if (progressRatio != 0)
                throw Error("Unexpected behavior: AnimationState.progressRatio must be 0 but the current value is " + progressRatio + " when AnimationState.timestamp is undefined.");
            var start = model.currRangeStart, end = model.currRangeEnd, maxRange = model.maxRangeLength;
            var rangeSelectorTheme = theme.rangeSelector;
            var rangeBorderWidth = rangeSelectorTheme.rangeBorderWidth;
            context.fillStyle = rangeSelectorTheme.rangeBorderColor;
            var xStep = (width - rangeBorderWidth * 2) / maxRange;
            var rangeStartPixelOffset = start * xStep;
            var rangeEndPixelOffset = end * xStep + rangeBorderWidth;
            context.fillRect(rangeStartPixelOffset, 0, rangeBorderWidth, height);
            context.fillRect(rangeEndPixelOffset, 0, rangeBorderWidth, height);
            var color = new common_1.Color();
            for (var i = 0; i < lineCount; i++) {
                var lineInfo = lineInfoList[i];
                var line = lineInfo[0];
                var hScale = void 0;
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
                    default: throw new Error("Invalid ChartLineVState: " + lineInfo[1] + ".");
                }
                renderLine(context, line.column, color.toString(), theme.lineWidth, rangeBorderWidth, xStep, height, hScale);
            }
            context.fillStyle = rangeSelectorTheme.shadeColor;
            var leftShadeWidth = rangeStartPixelOffset - rangeBorderWidth;
            if (leftShadeWidth > 0)
                context.fillRect(rangeBorderWidth, 0, leftShadeWidth, height);
            var rightShadeWidth = width - (rangeEndPixelOffset + rangeBorderWidth * 2);
            if (rightShadeWidth > 0)
                context.fillRect(rangeEndPixelOffset + rangeBorderWidth, 0, rightShadeWidth, height);
            if (changingLineCount > 0 && progressRatio < 1) {
                animationState.progressRatio = progressRatio;
                animationState.timestamp = timestamp;
                animationState.frameRequestId = requestAnimationFrame(this.renderAnimationFrame);
            }
            else
                animationState.frameRequestId = undefined;
        };
        CanvasChartRangeSelector.prototype[ChartModel_1.chartModelChangeHandlerKey] = function (model, timestamp) {
            var e_2, _a;
            var animationState = this.animationState;
            animationState.prevMax = model.prevMax;
            animationState.nextMax = model.currMax;
            animationState.progressRatio = 0;
            animationState.timestamp = undefined;
            var lineCount = 0;
            var changingLineCount = 0;
            var lineInfoList = animationState.lineInfoList;
            try {
                for (var _b = __values(model.lines.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var line = _c.value;
                    switch (ChartModel_1.getChartLineVState(line)) {
                        case 2:
                            {
                                var lineInfo = lineInfoList[lineCount];
                                lineInfo[0] = line;
                                lineInfo[1] = 2;
                                changingLineCount++;
                                lineCount++;
                                break;
                            }
                        case 3:
                            {
                                var lineInfo = lineInfoList[lineCount];
                                lineInfo[0] = line;
                                lineInfo[1] = 3;
                                changingLineCount++;
                                lineCount++;
                                break;
                            }
                        case 1:
                            {
                                var lineInfo = lineInfoList[lineCount];
                                lineInfo[0] = line;
                                lineInfo[1] = 1;
                                lineCount++;
                                break;
                            }
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            animationState.lineCount = lineCount;
            animationState.changingLineCount = changingLineCount;
            if (animationState.frameRequestId === undefined)
                this.renderAnimationFrame(timestamp);
        };
        return CanvasChartRangeSelector;
    }());
    var renderLine = function (context, column, color, lineWidth, x, xStep, height, hScale) {
        var columnLen = column.length;
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.moveTo(x, height - column[1] * hScale);
        for (var i = 2; i < columnLen; i++) {
            x += xStep;
            context.lineTo(x, height - column[i] * hScale);
        }
        context.stroke();
    };
    exports.TagName = 'canvas-chart-range-selector';
    var CanvasChartRangeSelectorElement = (function (_super) {
        __extends(CanvasChartRangeSelectorElement, _super);
        function CanvasChartRangeSelectorElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CanvasChartRangeSelectorElement.prototype.createController = function (model) {
            return new CanvasChartRangeSelector(this, model);
        };
        return CanvasChartRangeSelectorElement;
    }(ChartContext_1.ChartContextConsumerElement));
    exports.CanvasChartRangeSelectorElement = CanvasChartRangeSelectorElement;
    customElements.define(exports.TagName, CanvasChartRangeSelectorElement);
});
//# sourceMappingURL=CanvasChartRangeSelector.js.map