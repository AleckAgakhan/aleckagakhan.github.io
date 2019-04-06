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
define(["require", "exports", "./ThemableCheckbox", "./ChartModel", "./ChartContextTemplateConsumer"], function (require, exports, ThemableCheckbox_1, ChartModel_1, ChartContextTemplateConsumer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ChartLineSelector = (function () {
        function ChartLineSelector(element, model, checkboxTemplateKey, templateProvider) {
            this.checkboxList = [];
            this.element = element;
            this.checkboxTemplateKey = checkboxTemplateKey;
            this.templateProvider = templateProvider;
            this.model = model;
        }
        Object.defineProperty(ChartLineSelector.prototype, "model", {
            get: function () { return this._model; },
            set: function (newModel) {
                var e_1, _a, e_2, _b;
                var checkboxList = this.checkboxList;
                var prevModel = this._model;
                if (prevModel) {
                    prevModel.unsubscribe(this);
                    try {
                        for (var checkboxList_1 = __values(checkboxList), checkboxList_1_1 = checkboxList_1.next(); !checkboxList_1_1.done; checkboxList_1_1 = checkboxList_1.next()) {
                            var checkbox = checkboxList_1_1.value;
                            checkbox.unsubscribe(this);
                            checkbox.remove();
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (checkboxList_1_1 && !checkboxList_1_1.done && (_a = checkboxList_1.return)) _a.call(checkboxList_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    checkboxList.length = 0;
                }
                this._model = newModel;
                if (newModel) {
                    var _c = this, element = _c.element, checkboxTemplateKey = _c.checkboxTemplateKey, templateProvider = _c.templateProvider;
                    try {
                        for (var _d = __values(newModel.orderedLines), _e = _d.next(); !_e.done; _e = _d.next()) {
                            var line = _e.value;
                            var checkbox = templateProvider.createElement(checkboxTemplateKey);
                            checkbox.setAttribute("key", line.key);
                            checkbox.setAttribute("label-text", line.name);
                            checkbox.setAttribute("main-color", line.color.toString());
                            if (line.isCurrVisible)
                                checkbox.toggleAttribute("default-checked");
                            element.appendChild(checkbox);
                            checkbox.subscribe(this);
                            checkboxList.push(checkbox);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    newModel.subscribe(this);
                }
            },
            enumerable: true,
            configurable: true
        });
        ChartLineSelector.prototype.disconnect = function () {
            var e_3, _a;
            this.templateProvider = undefined;
            var model = this._model;
            if (!model)
                return;
            model.unsubscribe(this);
            this.model = undefined;
            var checkboxList = this.checkboxList;
            try {
                for (var checkboxList_2 = __values(checkboxList), checkboxList_2_1 = checkboxList_2.next(); !checkboxList_2_1.done; checkboxList_2_1 = checkboxList_2.next()) {
                    var checkbox = checkboxList_2_1.value;
                    checkbox.unsubscribe(this);
                    checkbox.remove();
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (checkboxList_2_1 && !checkboxList_2_1.done && (_a = checkboxList_2.return)) _a.call(checkboxList_2);
                }
                finally { if (e_3) throw e_3.error; }
            }
            checkboxList.length = 0;
        };
        ChartLineSelector.prototype[ThemableCheckbox_1.boolValueChangeHandlerKey] = function (value, lineKey) {
            var model = this._model;
            if (!model)
                return;
            model.setVisibility(lineKey, value);
        };
        ChartLineSelector.prototype[ChartModel_1.chartModelChangeHandlerKey] = function (model) {
            var e_4, _a;
            var index = 0;
            var checkboxList = this.checkboxList;
            try {
                for (var _b = __values(model.orderedLines), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var line = _c.value;
                    if (line.isCurrVisible != line.isPrevVisible)
                        checkboxList[index].value = line.isCurrVisible;
                    index++;
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
        };
        return ChartLineSelector;
    }());
    var ChartLineSelectorElement = (function (_super) {
        __extends(ChartLineSelectorElement, _super);
        function ChartLineSelectorElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ChartLineSelectorElement.prototype.createController = function (model) {
            return new ChartLineSelector(this, model, this.getRequiredAttribute("checkbox-key"), this.templateProvider);
        };
        return ChartLineSelectorElement;
    }(ChartContextTemplateConsumer_1.ChartContextTemplateConsumerElement));
    exports.ChartLineSelectorElement = ChartLineSelectorElement;
    exports.TagName = 'chart-line-selector';
    customElements.define(exports.TagName, ChartLineSelectorElement);
});
//# sourceMappingURL=ChartLineSelector.js.map