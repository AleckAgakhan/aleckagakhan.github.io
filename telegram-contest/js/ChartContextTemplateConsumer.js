define(["require", "exports", "./ChartContext", "./common", "./TemplateProvider"], function (require, exports, ChartContext_1, common_1, TemplateProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ChartContextTemplateConsumerElement extends ChartContext_1.ChartContextConsumerElement {
        get templateProvider() {
            let provider = this._templateProvider;
            if (provider)
                return provider;
            provider = TemplateProvider_1.getTemplateProvider(this);
            if (!provider)
                throw new Error(common_1.missingTemplateProviderMsg(this.localName));
            this._templateProvider = provider;
            return provider;
        }
    }
    exports.ChartContextTemplateConsumerElement = ChartContextTemplateConsumerElement;
});
//# sourceMappingURL=ChartContextTemplateConsumer.js.map