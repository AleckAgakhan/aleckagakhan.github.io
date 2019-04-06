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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getChartLineVState = function (line) { return line.isCurrVisible
        ? (line.isPrevVisible ? 1 : 2)
        : (line.isPrevVisible ? 3 : 0); };
    var calcLineMinMax = function (line) {
        var column = line.column;
        var len = column.length;
        var min = column[1];
        var max = min;
        for (var i = 2; i < len; i++) {
            var value = column[i];
            if (value < min)
                min = value;
            if (value > max)
                max = value;
        }
        line.min = min;
        line.max = max;
    };
    var updateLineRangeMinMax = function (line, from, to) {
        var column = line.column;
        from++;
        to++;
        var min = column[from];
        var max = column[from];
        from++;
        for (; from <= to; from++) {
            var value = column[from];
            if (min > value)
                min = value;
            if (max < value)
                max = value;
        }
        line.rangeMin = min;
        line.rangeMax = max;
    };
    exports.chartModelChangeHandlerKey = Symbol('ChartModel::ChangeHandler');
    var ChartModel = (function () {
        function ChartModel(xKey, xColumn, lines, orderedLines, currRangeStart, currRangeEnd) {
            var e_1, _a, e_2, _b;
            if (currRangeStart === void 0) { currRangeStart = 0; }
            if (currRangeEnd === void 0) { currRangeEnd = 0; }
            this.xKey = xKey;
            this.xColumn = xColumn;
            this.lines = lines;
            this.orderedLines = orderedLines;
            this.currRangeStart = currRangeStart;
            this.currRangeEnd = currRangeEnd;
            this.isUpdated = true;
            var keySet = new Set(this.lines.keys());
            try {
                for (var orderedLines_1 = __values(orderedLines), orderedLines_1_1 = orderedLines_1.next(); !orderedLines_1_1.done; orderedLines_1_1 = orderedLines_1.next()) {
                    var line = orderedLines_1_1.value;
                    if (!keySet.delete(line.key))
                        throw new Error("The line key '" + line.key + "' is not defined.");
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (orderedLines_1_1 && !orderedLines_1_1.done && (_a = orderedLines_1.return)) _a.call(orderedLines_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (keySet.size > 0)
                throw new Error("The order for the line key(s): " + __spread(keySet).join(', ') + " is not specified.");
            var maxRange = xColumn.length - 2;
            if (currRangeStart < 0 || currRangeStart > maxRange)
                throw new Error('Invalid range start value: 0 <= rangeStart <= maxRange is not satisfied.');
            if (currRangeStart > currRangeEnd)
                throw new Error('Invalid range end value: rangeStart <= rangeEnd is not satisfied.');
            if (currRangeEnd > maxRange)
                throw new Error('Invalid range end value: rangeEnd <= maxRange is not satisfied.');
            this.maxRangeLength = maxRange;
            this.prevRangeStart = 0;
            this.prevRangeEnd = 0;
            this.prevRangeMin = 0;
            this.currRangeMin = 0;
            this.prevRangeMax = 0;
            this.currRangeMax = 0;
            this.prevMin = 0;
            this.currMin = 0;
            this.prevMax = 0;
            this.currMax = 0;
            this.currVisibleLines = [];
            try {
                for (var _c = __values(this.lines.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var line = _d.value;
                    calcLineMinMax(line);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_2) throw e_2.error; }
            }
            this.subscribers = new Set();
            this.animationCallback = this.animationCallback.bind(this);
            this.isUpdated = true;
        }
        ChartModel.prototype.animationCallback = function (timestamp) {
            var e_3, _a;
            if (!this.isUpdated || this.currRangeStart != this.prevRangeStart || this.currRangeEnd != this.prevRangeEnd)
                this.update();
            this.isUpdated = true;
            this.animationRegistrationId = undefined;
            try {
                for (var _b = __values(this.subscribers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var subscriber = _c.value;
                    if (exports.chartModelChangeHandlerKey in subscriber)
                        subscriber[exports.chartModelChangeHandlerKey](this, timestamp);
                    else
                        subscriber(this, timestamp);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            this.flush();
        };
        ChartModel.prototype.subscribe = function (subscriber) {
            this.subscribers.add(subscriber);
        };
        ChartModel.prototype.unsubscribe = function (subscriber) {
            this.subscribers.delete(subscriber);
        };
        Object.defineProperty(ChartModel.prototype, "isCurrRangeEmpty", {
            get: function () { return this.currRangeStart === this.currRangeEnd; },
            enumerable: true,
            configurable: true
        });
        ChartModel.prototype.setVisibility = function (lineKey, value) {
            var line = this.lines.get(lineKey);
            if (line === undefined)
                throw new Error("The line key '" + lineKey + "' is not defined.");
            if (line.isCurrVisible === value)
                return;
            line.isCurrVisible = value;
            if (!this.animationRegistrationId) {
                this.isUpdated = false;
                this.animationRegistrationId = requestAnimationFrame(this.animationCallback);
            }
        };
        ChartModel.prototype.setRangeStart = function (rangeStart) {
            if (rangeStart === this.prevRangeStart)
                return;
            if (rangeStart < 0 || rangeStart > this.maxRangeLength)
                throw new Error('Invalid range start value: 0 <= rangeStart <= maxRange is not satisfied.');
            this.currRangeStart = rangeStart;
            if (!this.animationRegistrationId)
                this.animationRegistrationId = requestAnimationFrame(this.animationCallback);
        };
        ChartModel.prototype.setRangeEnd = function (rangeEnd) {
            if (rangeEnd === this.prevRangeEnd)
                return;
            if (this.currRangeStart > rangeEnd)
                throw new Error('Invalid range end value: rangeStart <= rangeEnd is not satisfied.');
            if (rangeEnd > this.maxRangeLength)
                throw new Error('Invalid range end value: rangeEnd <= maxRange is not satisfied.');
            this.currRangeEnd = rangeEnd;
            if (!this.animationRegistrationId)
                this.animationRegistrationId = requestAnimationFrame(this.animationCallback);
        };
        ChartModel.prototype.setRange = function (rangeStart, rangeEnd) {
            if (rangeStart === this.prevRangeStart && rangeEnd === this.prevRangeEnd)
                return;
            if (rangeStart < 0 || rangeStart > this.maxRangeLength)
                throw new Error('Invalid range start value: 0 <= rangeStart <= maxRange is not satisfied.');
            if (rangeStart > rangeEnd)
                throw new Error('Invalid range end value: rangeStart <= rangeEnd is not satisfied.');
            if (rangeEnd > this.maxRangeLength)
                throw new Error('Invalid range end value: rangeEnd <= maxRange is not satisfied.');
            this.currRangeStart = rangeStart;
            this.currRangeEnd = rangeEnd;
            if (!this.animationRegistrationId)
                this.animationRegistrationId = requestAnimationFrame(this.animationCallback);
        };
        ChartModel.prototype.moveRangeStartBy = function (offset) {
            var rangeStart = this.currRangeStart;
            rangeStart += offset;
            if (offset < 0) {
                if (rangeStart < 0)
                    rangeStart = 0;
            }
            else if (rangeStart > this.currRangeEnd)
                rangeStart = this.currRangeEnd;
            this.currRangeStart = rangeStart;
            if (rangeStart != this.prevRangeStart) {
                if (!this.animationRegistrationId)
                    this.animationRegistrationId = requestAnimationFrame(this.animationCallback);
            }
        };
        ChartModel.prototype.moveRangeEndBy = function (offset) {
            var rangeEnd = this.currRangeEnd;
            rangeEnd += offset;
            if (rangeEnd < this.currRangeStart)
                rangeEnd = this.currRangeStart;
            else if (rangeEnd > this.maxRangeLength)
                rangeEnd = this.maxRangeLength;
            this.currRangeEnd = rangeEnd;
            if (rangeEnd != this.prevRangeEnd) {
                if (!this.animationRegistrationId)
                    this.animationRegistrationId = requestAnimationFrame(this.animationCallback);
            }
        };
        ChartModel.prototype.moveRangeBy = function (offset) {
            var rangeStart = this.currRangeStart;
            var rangeEnd = this.currRangeEnd;
            var d = rangeEnd - rangeStart;
            if (offset < 0) {
                rangeStart += offset;
                if (rangeStart < 0) {
                    rangeStart = 0;
                    rangeEnd = d;
                }
                else
                    rangeEnd += offset;
            }
            else {
                rangeEnd += offset;
                if (rangeEnd > this.maxRangeLength) {
                    rangeEnd = this.maxRangeLength;
                    rangeStart = rangeEnd - d;
                }
                else
                    rangeStart += offset;
            }
            this.currRangeStart = rangeStart;
            this.currRangeEnd = rangeEnd;
            if (rangeStart != this.prevRangeStart || rangeEnd != this.prevRangeEnd) {
                if (!this.animationRegistrationId)
                    this.animationRegistrationId = requestAnimationFrame(this.animationCallback);
            }
        };
        ChartModel.prototype.update = function () {
            var e_4, _a;
            var _b = this, lines = _b.lines, currVisibleLines = _b.currVisibleLines;
            var currRangeStart = Math.round(this.currRangeStart);
            var currRangeEnd = Math.round(this.currRangeEnd);
            currVisibleLines.length = 0;
            try {
                for (var _c = __values(this.orderedLines), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var line_1 = _d.value;
                    if (line_1.isCurrVisible)
                        currVisibleLines.push(line_1);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_4) throw e_4.error; }
            }
            if (currVisibleLines.length == 0)
                return;
            var line = currVisibleLines[0];
            var isMinMaxUpdate = Math.round(this.prevRangeStart) != currRangeStart || Math.round(this.prevRangeEnd) != currRangeEnd;
            if (isMinMaxUpdate || !line.isPrevVisible)
                updateLineRangeMinMax(line, currRangeStart, currRangeEnd);
            var min = line.min, rangeMin = line.rangeMin, max = line.max, rangeMax = line.rangeMax;
            var len = currVisibleLines.length;
            for (var i = 1; i < len; i++) {
                var line_2 = currVisibleLines[i];
                if (isMinMaxUpdate || !line_2.isPrevVisible)
                    updateLineRangeMinMax(line_2, currRangeStart, currRangeEnd);
                if (line_2.rangeMin < rangeMin)
                    rangeMin = line_2.rangeMin;
                if (line_2.min < min)
                    min = line_2.min;
                if (line_2.rangeMax > rangeMax)
                    rangeMax = line_2.rangeMax;
                if (line_2.max > max)
                    max = line_2.max;
            }
            this.currMin = min;
            this.currMax = max;
            this.currRangeMin = rangeMin;
            this.currRangeMax = rangeMax;
        };
        ChartModel.prototype.flush = function () {
            var e_5, _a;
            try {
                for (var _b = __values(this.lines.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var line = _c.value;
                    line.isPrevVisible = line.isCurrVisible;
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            this.prevRangeStart = this.currRangeStart;
            this.prevRangeEnd = this.currRangeEnd;
            this.prevRangeMin = this.currRangeMin;
            this.prevRangeMax = this.currRangeMax;
            this.prevMin = this.currMin;
            this.prevMax = this.currMax;
        };
        return ChartModel;
    }());
    exports.ChartModel = ChartModel;
});
//# sourceMappingURL=ChartModel.js.map