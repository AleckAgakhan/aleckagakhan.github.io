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
define(["require", "exports", "./ChartModel", "./ChartContext", "./TemplateProvider", "./common", "./ChartTheme"], function (require, exports, ChartModel_1, ChartContext_1, TemplateProvider_1, common_1, ChartTheme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var createChartModel = function (data) {
        var e_1, _a, e_2, _b;
        var lineMap = new Map();
        var xKey;
        var xColumn;
        var types = data.types;
        for (var key in types) {
            switch (types[key]) {
                case 'x':
                    {
                        if (xKey)
                            throw new Error("Malformed chart data section 'type': too many names '" + key + "' of the type 'x'.");
                        xKey = key;
                        break;
                    }
                case 'line':
                    lineMap.set(key, { isPrevVisible: false, isCurrVisible: true });
                    break;
                default: throw new Error("Malformed chart data section 'type': unknown type '" + types[key] + "' for the name '" + key + "'.");
            }
        }
        if (!xKey)
            throw new Error("Malformed chart data section 'type': missing key of the type 'x'.");
        var lineOrder = [];
        try {
            for (var _c = __values(data.columns), _d = _c.next(); !_d.done; _d = _c.next()) {
                var column = _d.value;
                if (column[0] === xKey)
                    xColumn = column;
                else {
                    var key = column[0];
                    var chartLine = lineMap.get(key);
                    if (!chartLine)
                        throw new Error("Malformed chart data section 'columns': undefined key '" + key + "'.");
                    chartLine.column = column;
                    chartLine.key = key;
                    lineOrder.push(chartLine);
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
        if (!xColumn)
            throw new Error("Malformed chart data section 'columns': missing column for the key '" + xKey + "'.");
        var names = data.names;
        for (var key in names) {
            var chartLine = lineMap.get(key);
            if (!chartLine)
                throw new Error("Malformed chart data section 'names': undefined key '" + key + "'.");
            chartLine.name = names[key];
        }
        var colors = data.colors;
        for (var key in colors) {
            var chartLine = lineMap.get(key);
            if (!chartLine)
                throw new Error("Malformed chart data section 'colors': undefined key '" + key + "'.");
            chartLine.color = new common_1.Color(colors[key]);
        }
        try {
            for (var _e = __values(lineMap.values()), _f = _e.next(); !_f.done; _f = _e.next()) {
                var chartLine = _f.value;
                var key = chartLine.key;
                if (!chartLine.name)
                    throw new Error("Malformed chart data section 'names': missing name for the key '" + key + "'.");
                if (!chartLine.color)
                    throw new Error("Malformed chart data section 'colors': missing color for the key '" + key + "'.");
                var column = chartLine.column;
                if (!column)
                    throw new Error("Malformed chart data section 'columns': missing column for the key '" + key + "'.");
                var len = column.length;
                if (len != xColumn.length)
                    throw new Error("Malformed chart data section 'columns': the length of the column for the key '" + key + "' doesn't match the length of x-column.");
                for (var i = 1; i < len; i++) {
                    xColumn[i] = new Date(xColumn[i]);
                }
                var min = column[1];
                var max = min;
                for (var i = 2; i < len; i++) {
                    var value = column[i];
                    if (value < min)
                        min = value;
                    if (value > max)
                        max = value;
                }
                chartLine.min = min;
                chartLine.max = max;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return new ChartModel_1.ChartModel(xKey, xColumn, lineMap, lineOrder);
    };
    var ChartLoaderElement = (function (_super) {
        __extends(ChartLoaderElement, _super);
        function ChartLoaderElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ChartLoaderElement.prototype.connectedCallback = function () {
            _super.prototype.connectedCallback.call(this);
            this.attachShadow({ mode: 'open' });
            ChartTheme_1.addShadowRootContainer(this);
            var url = this.getRequiredAttribute("url");
            var chartTemplateKey = this.getRequiredAttribute("chart-key");
            this.loadData(url, chartTemplateKey);
        };
        ChartLoaderElement.prototype.loadData = function (url, chartTemplateKey) {
            return __awaiter(this, void 0, void 0, function () {
                var e_3, _a, response, dataList, dataList_1, dataList_1_1, data, model, chartElement, contextElement;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4, fetch(url)];
                        case 1:
                            response = _b.sent();
                            if (!response.ok)
                                throw new Error("Unable to retrieve chart data. Status code: " + response.status + " (" + response.statusText + ")");
                            return [4, (response).json()];
                        case 2:
                            dataList = _b.sent();
                            try {
                                for (dataList_1 = __values(dataList), dataList_1_1 = dataList_1.next(); !dataList_1_1.done; dataList_1_1 = dataList_1.next()) {
                                    data = dataList_1_1.value;
                                    model = createChartModel(data);
                                    model.setRange(Math.round(model.maxRangeLength / 3), model.maxRangeLength - Math.round(model.maxRangeLength / 3));
                                    chartElement = this.createElement(chartTemplateKey);
                                    contextElement = chartElement.querySelector(ChartContext_1.TagName);
                                    if (!contextElement)
                                        throw new Error("Unable to find the element <" + ChartContext_1.TagName + "> in the template '" + chartTemplateKey + "'.");
                                    this.shadowRoot.appendChild(contextElement);
                                    contextElement.chartModel = model;
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (dataList_1_1 && !dataList_1_1.done && (_a = dataList_1.return)) _a.call(dataList_1);
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                            return [2];
                    }
                });
            });
        };
        return ChartLoaderElement;
    }(TemplateProvider_1.TemplateProviderElement));
    exports.ChartLoaderElement = ChartLoaderElement;
    exports.TagName = 'chart-loader';
    customElements.define(exports.TagName, ChartLoaderElement);
});
//# sourceMappingURL=ChartLoader.js.map