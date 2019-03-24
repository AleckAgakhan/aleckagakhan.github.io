import { ChartContextConsumerElement } from "./ChartContext";
import { missingAttrMsg, missingTemplateProviderMsg } from "./common";
import { getTemplateProvider } from "./TemplateProvider";
export class CustomChartContextConsumerElement extends ChartContextConsumerElement {
    getRequiredAttribute(name) {
        const value = this.getAttribute(name);
        if (!value)
            throw new Error(missingAttrMsg(this.localName, name));
        return value;
    }
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
//# sourceMappingURL=ChartContextTemplateConsumerElement.js.map