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
define(["require", "exports", "./ChartContext", "./common", "./TemplateProvider"], function (require, exports, ChartContext_1, common_1, TemplateProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ChartContextTemplateConsumerElement = (function (_super) {
        __extends(ChartContextTemplateConsumerElement, _super);
        function ChartContextTemplateConsumerElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(ChartContextTemplateConsumerElement.prototype, "templateProvider", {
            get: function () {
                var provider = this._templateProvider;
                if (provider)
                    return provider;
                provider = TemplateProvider_1.getTemplateProvider(this);
                if (!provider)
                    throw new Error(common_1.missingTemplateProviderMsg(this.localName));
                this._templateProvider = provider;
                return provider;
            },
            enumerable: true,
            configurable: true
        });
        return ChartContextTemplateConsumerElement;
    }(ChartContext_1.ChartContextConsumerElement));
    exports.ChartContextTemplateConsumerElement = ChartContextTemplateConsumerElement;
});
//# sourceMappingURL=ChartContextTemplateConsumer.js.map