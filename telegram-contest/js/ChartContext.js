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
define(["require", "exports", "./common"], function (require, exports, common_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.chartContextChangeHandlerKey = Symbol('ChartContext::ChangeHandler');
    var ChartContextElement = (function (_super) {
        __extends(ChartContextElement, _super);
        function ChartContextElement() {
            var _this = _super.call(this) || this;
            _this.subscribers = new Set();
            return _this;
        }
        Object.defineProperty(ChartContextElement.prototype, "chartModel", {
            get: function () { return this._chartModel; },
            set: function (value) {
                var e_1, _a;
                this._chartModel = value;
                try {
                    for (var _b = __values(this.subscribers), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var subscriber = _c.value;
                        if (exports.chartContextChangeHandlerKey in subscriber)
                            subscriber[exports.chartContextChangeHandlerKey](this);
                        else
                            subscriber(this);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            },
            enumerable: true,
            configurable: true
        });
        ;
        ChartContextElement.prototype.subscribe = function (subscriber) {
            this.subscribers.add(subscriber);
        };
        ChartContextElement.prototype.unsubscribe = function (subscriber) {
            this.subscribers.delete(subscriber);
        };
        return ChartContextElement;
    }(HTMLElement));
    exports.ChartContextElement = ChartContextElement;
    exports.TagName = 'chart-context';
    customElements.define(exports.TagName, ChartContextElement);
    var ChartContextConsumerElement = (function (_super) {
        __extends(ChartContextConsumerElement, _super);
        function ChartContextConsumerElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ChartContextConsumerElement.prototype.connectedCallback = function () {
            var chartContext = this.findContextElement();
            chartContext.subscribe(this);
            this[exports.chartContextChangeHandlerKey](chartContext);
        };
        ChartContextConsumerElement.prototype.disconnectedCallback = function () {
            var chartContext = this.chartContext;
            if (chartContext) {
                chartContext.unsubscribe(this);
                this.chartContext = undefined;
            }
            var controller = this.controller;
            if (controller) {
                controller.disconnect();
                this.controller = undefined;
            }
        };
        ChartContextConsumerElement.prototype[exports.chartContextChangeHandlerKey] = function (chartContext) {
            var controller = this.controller;
            if (!controller) {
                var model = chartContext.chartModel;
                if (!model)
                    return;
                controller = this.createController(model);
                this.controller = controller;
            }
            else
                controller.model = chartContext.chartModel;
        };
        ChartContextConsumerElement.prototype.findContextElement = function () {
            var body = document.body;
            for (var parent_1 = this.parentElement; parent_1 != null && parent_1 !== body; parent_1 = parent_1.parentElement) {
                if (parent_1.localName === exports.TagName)
                    return parent_1;
            }
            throw new Error("Invalid chart context: The element <" + this.localName + "> may only be placed as a discendent of <" + exports.TagName + ">.");
        };
        ChartContextConsumerElement.prototype.getRequiredAttribute = function (name) {
            var value = this.getAttribute(name);
            if (!value)
                throw new Error(common_1.missingAttrMsg(this.localName, name));
            return value;
        };
        return ChartContextConsumerElement;
    }(HTMLElement));
    exports.ChartContextConsumerElement = ChartContextConsumerElement;
});
//# sourceMappingURL=ChartContext.js.map