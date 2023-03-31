define(["require", "exports", "./common.js"], function (require, exports, common_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TemplateProviderElement = exports.getTemplateProvider = void 0;
    const getTemplateProvider = (element) => {
        if (element instanceof TemplateProviderElement)
            return element;
        let current = element;
        while (true) {
            current = element.getRootNode();
            if (!(current instanceof ShadowRoot))
                return undefined;
            current = current.host;
            if (current instanceof TemplateProviderElement)
                return current;
        }
    };
    exports.getTemplateProvider = getTemplateProvider;
    class TemplateProviderElement extends HTMLElement {
        createElement(templateKey) {
            const newElement = this.createElementWithId(templateKey);
            newElement.removeAttribute('id');
            return newElement;
        }
        createElementWithId(templateKey) {
            const template = this.templateMap.content.getElementById(templateKey);
            if (!template)
                throw new Error(`Unable to find the template with the key '${templateKey}'.`);
            const newElement = template.cloneNode(true);
            return newElement;
        }
        createElementFromTemplate(templateKey) {
            const template = this.templateMap.content.getElementById(templateKey);
            if (!template)
                throw new Error(`Unable to find the template with the key '${templateKey}'.`);
            const newElement = template.content.cloneNode(true);
            return newElement;
        }
        connectedCallback() {
            this.setTemplateMapElement();
        }
        setTemplateMapElement() {
            const templateMap = this.firstElementChild;
            if (!(templateMap instanceof HTMLTemplateElement))
                throw new Error(`Provide template map as the first child or override the method setTemplateElement().`);
            this.templateMap = templateMap;
        }
        getRequiredAttribute(name) {
            const value = this.getAttribute(name);
            if (!value)
                throw new Error((0, common_js_1.missingAttrMsg)(this.localName, name));
            return value;
        }
    }
    exports.TemplateProviderElement = TemplateProviderElement;
});
//# sourceMappingURL=TemplateProvider.js.map