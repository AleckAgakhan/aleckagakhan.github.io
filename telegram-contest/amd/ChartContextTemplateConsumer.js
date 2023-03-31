define(["require", "exports", "./ChartContext.js", "./common.js", "./TemplateProvider.js"], function (require, exports, ChartContext_js_1, common_js_1, TemplateProvider_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChartContextTemplateConsumerElement = void 0;
    class ChartContextTemplateConsumerElement extends ChartContext_js_1.ChartContextConsumerElement {
        get templateProvider() {
            let provider = this._templateProvider;
            if (provider)
                return provider;
            provider = (0, TemplateProvider_js_1.getTemplateProvider)(this);
            if (!provider)
                throw new Error((0, common_js_1.missingTemplateProviderMsg)(this.localName));
            this._templateProvider = provider;
            return provider;
        }
    }
    exports.ChartContextTemplateConsumerElement = ChartContextTemplateConsumerElement;
});
//# sourceMappingURL=ChartContextTemplateConsumer.js.map