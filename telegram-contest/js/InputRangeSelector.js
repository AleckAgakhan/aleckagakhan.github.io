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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
define(["require", "exports", "./ChartModel", "./ChartContextTemplateConsumer", "./common"], function (require, exports, ChartModel_1, ChartContextTemplateConsumer_1, common_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var InputChartRangeSelector = (function () {
        function InputChartRangeSelector(element, model, templateProvider, rangeStartInput, rangeEndInput, applyButton, itemKey, itemContainer) {
            this.element = element;
            this.templateProvider = templateProvider;
            this.rangeStartInput = rangeStartInput;
            this.rangeEndInput = rangeEndInput;
            this.applyButton = applyButton;
            this.itemKey = itemKey;
            this.itemContainer = itemContainer;
            this.rangeStart = 0;
            this.rangeEnd = 0;
            this.itemList = new Set();
            this.handleApply = this.handleApply.bind(this);
            applyButton.onclick = this.handleApply;
            this.handleKeyPress = this.handleKeyPress.bind(this);
            rangeStartInput.onkeypress = this.handleKeyPress;
            rangeEndInput.onkeypress = this.handleKeyPress;
            this.handleItemClick = this.handleItemClick.bind(this);
            this.model = model;
        }
        Object.defineProperty(InputChartRangeSelector.prototype, "model", {
            get: function () { return this._model; },
            set: function (newModel) {
                var oldModel = this._model;
                if (oldModel === newModel)
                    return;
                var _a = this, rangeStartInput = _a.rangeStartInput, rangeEndInput = _a.rangeEndInput;
                if (oldModel) {
                    oldModel.unsubscribe(this);
                    rangeStartInput.value = '';
                    rangeStartInput.readOnly = true;
                    rangeEndInput.value = '';
                    rangeEndInput.readOnly = true;
                }
                this._model = newModel;
                if (!newModel)
                    return;
                var currRangeStart = newModel.currRangeStart, currRangeEnd = newModel.currRangeEnd;
                this.rangeStart = currRangeStart;
                rangeStartInput.readOnly = false;
                rangeStartInput.value = currRangeStart.toString();
                this.rangeEnd = currRangeEnd;
                rangeEndInput.readOnly = false;
                rangeEndInput.value = currRangeEnd.toString();
                newModel.subscribe(this);
            },
            enumerable: true,
            configurable: true
        });
        InputChartRangeSelector.prototype.disconnect = function () {
            this.model = undefined;
        };
        InputChartRangeSelector.prototype[ChartModel_1.chartModelChangeHandlerKey] = function (model) {
            var currRangeStart = model.currRangeStart, currRangeEnd = model.currRangeEnd;
            if (currRangeStart != this.rangeStart) {
                this.rangeStart = currRangeStart;
                this.rangeStartInput.value = currRangeStart.toString();
            }
            if (currRangeEnd != this.rangeEnd) {
                this.rangeEnd = currRangeEnd;
                this.rangeEndInput.value = currRangeEnd.toString();
            }
        };
        InputChartRangeSelector.prototype.handleApply = function () {
            var e_1, _a;
            var model = this._model;
            if (!model)
                return;
            var maxRange = model.maxRangeLength;
            var _b = this, rangeStartInput = _b.rangeStartInput, rangeEndInput = _b.rangeEndInput;
            var rangeStart = parseFloat(rangeStartInput.value);
            if (isNaN(rangeStart)) {
                rangeStart = this.rangeStart;
                rangeStartInput.value = rangeStart.toString();
            }
            else if (rangeStart < 0) {
                rangeStart = 0;
                this.rangeStart = 0;
            }
            else if (rangeStart > maxRange) {
                rangeStart = maxRange;
                this.rangeStart = maxRange;
            }
            else
                rangeStart = Math.floor(rangeStart * 10) / 10;
            var rangeEnd = parseFloat(rangeEndInput.value);
            if (isNaN(rangeEnd))
                rangeEndInput.value = this.rangeEnd.toString();
            else if (rangeEnd < rangeStart) {
                rangeEnd = rangeStart;
                this.rangeEnd = rangeStart;
            }
            else if (rangeEnd > maxRange) {
                rangeEnd = maxRange;
                this.rangeEnd = maxRange;
            }
            else
                rangeEnd = Math.floor(rangeEnd * 10) / 10;
            var itemExists = false;
            try {
                for (var _c = __values(this.itemList), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var itemElement = _d.value;
                    var itemRageStart = parseFloat(itemElement.getAttribute("range-start"));
                    if (itemRageStart !== rangeStart)
                        continue;
                    var itemRangeEnd = parseFloat(itemElement.getAttribute("range-end"));
                    if (itemRangeEnd !== rangeEnd)
                        continue;
                    itemExists = true;
                    break;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (!itemExists) {
                var rangeStartStr = rangeStart.toString();
                var rangeEndStr = rangeEnd.toString();
                var itemFragment = this.templateProvider.createElementFromTemplate(this.itemKey);
                var applyButton = itemFragment.getElementById("ApplyRange");
                applyButton.textContent = rangeStartStr + " : " + rangeEndStr;
                var itemElement = itemFragment.firstElementChild;
                itemElement.setAttribute("range-start", rangeStartStr);
                itemElement.setAttribute("range-end", rangeEndStr);
                itemElement.onclick = this.handleItemClick;
                this.itemList.add(itemElement);
                this.itemContainer.prepend(itemElement);
            }
            model.setRange(rangeStart, rangeEnd);
        };
        InputChartRangeSelector.prototype.handleKeyPress = function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.handleApply();
            }
        };
        InputChartRangeSelector.prototype.handleItemClick = function (event) {
            return __awaiter(this, void 0, void 0, function () {
                var button, model, itemElement, rangeStart, rangeEnd, itemElement;
                return __generator(this, function (_a) {
                    button = event.target;
                    switch (button.id) {
                        case "ApplyRange":
                            {
                                model = this._model;
                                if (!model)
                                    return [2];
                                itemElement = event.currentTarget;
                                rangeStart = parseFloat(itemElement.getAttribute("range-start"));
                                rangeEnd = parseFloat(itemElement.getAttribute("range-end"));
                                model.setRange(rangeStart, rangeEnd);
                                return [2];
                            }
                        case "RemoveRange":
                            {
                                itemElement = event.currentTarget;
                                this.itemList.delete(itemElement);
                                itemElement.remove();
                                return [2];
                            }
                    }
                    return [2];
                });
            });
        };
        return InputChartRangeSelector;
    }());
    exports.TagName = 'input-chart-range-selector';
    var InputChartRangeSelectorElement = (function (_super) {
        __extends(InputChartRangeSelectorElement, _super);
        function InputChartRangeSelectorElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        InputChartRangeSelectorElement.prototype.createController = function (model) {
            var templateProvider = this.templateProvider;
            var itemKey = this.getRequiredAttribute("item-key");
            var contentKey = this.getRequiredAttribute("content-key");
            var contentFragment = templateProvider.createElementFromTemplate(contentKey);
            var rangeStartInput = contentFragment.getElementById("RangeStart");
            if (!rangeStartInput)
                throw new Error(common_1.missingElementInsideTemplateMsg(exports.TagName, contentKey, "RangeStart"));
            rangeStartInput.setAttribute('min', '0');
            rangeStartInput.setAttribute('max', model.maxRangeLength.toString());
            var rangeEndInput = contentFragment.getElementById("RangeEnd");
            if (!rangeEndInput)
                throw new Error(common_1.missingElementInsideTemplateMsg(exports.TagName, contentKey, "RangeEnd"));
            rangeEndInput.setAttribute('min', '0');
            rangeEndInput.setAttribute('max', model.maxRangeLength.toString());
            var applyButton = contentFragment.getElementById("RangeApply");
            if (!applyButton)
                throw new Error(common_1.missingElementInsideTemplateMsg(exports.TagName, contentKey, "RangeApply"));
            var itemContainer = contentFragment.getElementById("RangeItemContainer");
            if (!itemContainer)
                throw new Error(common_1.missingElementInsideTemplateMsg(exports.TagName, contentKey, "RangeItemContainer"));
            this.attachShadow({ mode: 'open' }).append(contentFragment);
            return new InputChartRangeSelector(this, model, templateProvider, rangeStartInput, rangeEndInput, applyButton, itemKey, itemContainer);
        };
        return InputChartRangeSelectorElement;
    }(ChartContextTemplateConsumer_1.ChartContextTemplateConsumerElement));
    exports.InputChartRangeSelectorElement = InputChartRangeSelectorElement;
    customElements.define(exports.TagName, InputChartRangeSelectorElement);
});
//# sourceMappingURL=InputRangeSelector.js.map