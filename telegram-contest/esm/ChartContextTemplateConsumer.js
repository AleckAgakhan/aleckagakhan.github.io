import { ChartContextConsumerElement } from "./ChartContext.js";
import { missingTemplateProviderMsg } from "./common.js";
import { getTemplateProvider } from "./TemplateProvider.js";
export class ChartContextTemplateConsumerElement extends ChartContextConsumerElement {
    get templateProvider() {
        let provider = this._templateProvider;
        if (provider)
            return provider;
        provider = getTemplateProvider(this);
        if (!provider)
            throw new Error(missingTemplateProviderMsg(this.localName));
        this._templateProvider = provider;
        return provider;
    }
}
//# sourceMappingURL=ChartContextTemplateConsumer.js.map