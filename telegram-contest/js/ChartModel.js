define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getChartLineVState = (line) => line.isCurrVisible
        ? (line.isPrevVisible ? 1 : 2)
        : (line.isPrevVisible ? 3 : 0);
    const calcLineMinMax = (line) => {
        const column = line.column;
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
        line.min = min;
        line.max = max;
    };
    const updateLineRangeMinMax = (line, from, to) => {
        const column = line.column;
        from++;
        to++;
        let min = column[from];
        let max = column[from];
        from++;
        for (; from <= to; from++) {
            const value = column[from];
            if (min > value)
                min = value;
            if (max < value)
                max = value;
        }
        line.rangeMin = min;
        line.rangeMax = max;
    };
    exports.chartModelChangeHandlerKey = Symbol('ChartModel::ChangeHandler');
    class ChartModel {
        constructor(xKey, xColumn, lines, orderedLines, currRangeStart = 0, currRangeEnd = 0) {
            this.xKey = xKey;
            this.xColumn = xColumn;
            this.lines = lines;
            this.orderedLines = orderedLines;
            this.currRangeStart = currRangeStart;
            this.currRangeEnd = currRangeEnd;
            this.isUpdated = true;
            const keySet = new Set(this.lines.keys());
            for (const line of orderedLines) {
                if (!keySet.delete(line.key))
                    throw new Error(`The line key '${line.key}' is not defined.`);
            }
            if (keySet.size > 0)
                throw new Error(`The order for the line key(s): ${[...keySet].join(', ')} is not specified.`);
            const maxRange = xColumn.length - 2;
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
            for (const line of this.lines.values()) {
                calcLineMinMax(line);
            }
            this.subscribers = new Set();
            this.animationCallback = this.animationCallback.bind(this);
            this.isUpdated = true;
        }
        animationCallback(timestamp) {
            if (!this.isUpdated || this.currRangeStart != this.prevRangeStart || this.currRangeEnd != this.prevRangeEnd)
                this.update();
            this.isUpdated = true;
            this.animationRegistrationId = undefined;
            for (const subscriber of this.subscribers) {
                if (exports.chartModelChangeHandlerKey in subscriber)
                    subscriber[exports.chartModelChangeHandlerKey](this, timestamp);
                else
                    subscriber(this, timestamp);
            }
            this.flush();
        }
        subscribe(subscriber) {
            this.subscribers.add(subscriber);
        }
        unsubscribe(subscriber) {
            this.subscribers.delete(subscriber);
        }
        get isCurrRangeEmpty() { return this.currRangeStart === this.currRangeEnd; }
        setVisibility(lineKey, value) {
            const line = this.lines.get(lineKey);
            if (line === undefined)
                throw new Error(`The line key '${lineKey}' is not defined.`);
            if (line.isCurrVisible === value)
                return;
            line.isCurrVisible = value;
            if (!this.animationRegistrationId) {
                this.isUpdated = false;
                this.animationRegistrationId = requestAnimationFrame(this.animationCallback);
            }
        }
        setRangeStart(rangeStart) {
            if (rangeStart === this.prevRangeStart)
                return;
            if (rangeStart < 0 || rangeStart > this.maxRangeLength)
                throw new Error('Invalid range start value: 0 <= rangeStart <= maxRange is not satisfied.');
            this.currRangeStart = rangeStart;
            if (!this.animationRegistrationId)
                this.animationRegistrationId = requestAnimationFrame(this.animationCallback);
        }
        setRangeEnd(rangeEnd) {
            if (rangeEnd === this.prevRangeEnd)
                return;
            if (this.currRangeStart > rangeEnd)
                throw new Error('Invalid range end value: rangeStart <= rangeEnd is not satisfied.');
            if (rangeEnd > this.maxRangeLength)
                throw new Error('Invalid range end value: rangeEnd <= maxRange is not satisfied.');
            this.currRangeEnd = rangeEnd;
            if (!this.animationRegistrationId)
                this.animationRegistrationId = requestAnimationFrame(this.animationCallback);
        }
        setRange(rangeStart, rangeEnd) {
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
        }
        moveRangeStartBy(offset) {
            let rangeStart = this.currRangeStart;
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
        }
        moveRangeEndBy(offset) {
            let rangeEnd = this.currRangeEnd;
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
        }
        moveRangeBy(offset) {
            let rangeStart = this.currRangeStart;
            let rangeEnd = this.currRangeEnd;
            const d = rangeEnd - rangeStart;
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
        }
        update() {
            const { lines, currVisibleLines } = this;
            const currRangeStart = Math.round(this.currRangeStart);
            const currRangeEnd = Math.round(this.currRangeEnd);
            currVisibleLines.length = 0;
            for (const line of this.orderedLines) {
                if (line.isCurrVisible)
                    currVisibleLines.push(line);
            }
            if (currVisibleLines.length == 0)
                return;
            const line = currVisibleLines[0];
            const isMinMaxUpdate = Math.round(this.prevRangeStart) != currRangeStart || Math.round(this.prevRangeEnd) != currRangeEnd;
            if (isMinMaxUpdate || !line.isPrevVisible)
                updateLineRangeMinMax(line, currRangeStart, currRangeEnd);
            let { min, rangeMin, max, rangeMax } = line;
            const len = currVisibleLines.length;
            for (let i = 1; i < len; i++) {
                const line = currVisibleLines[i];
                if (isMinMaxUpdate || !line.isPrevVisible)
                    updateLineRangeMinMax(line, currRangeStart, currRangeEnd);
                if (line.rangeMin < rangeMin)
                    rangeMin = line.rangeMin;
                if (line.min < min)
                    min = line.min;
                if (line.rangeMax > rangeMax)
                    rangeMax = line.rangeMax;
                if (line.max > max)
                    max = line.max;
            }
            this.currMin = min;
            this.currMax = max;
            this.currRangeMin = rangeMin;
            this.currRangeMax = rangeMax;
        }
        flush() {
            for (const line of this.lines.values()) {
                line.isPrevVisible = line.isCurrVisible;
            }
            this.prevRangeStart = this.currRangeStart;
            this.prevRangeEnd = this.currRangeEnd;
            this.prevRangeMin = this.currRangeMin;
            this.prevRangeMax = this.currRangeMax;
            this.prevMin = this.currMin;
            this.prevMax = this.currMax;
        }
    }
    exports.ChartModel = ChartModel;
});
//# sourceMappingURL=ChartModel.js.map