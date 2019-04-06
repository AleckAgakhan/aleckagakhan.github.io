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
define(["require", "exports", "./common"], function (require, exports, common_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTemplateProvider = function (element) {
        if (element instanceof TemplateProviderElement)
            return element;
        var current = element;
        while (true) {
            current = element.getRootNode();
            if (!(current instanceof ShadowRoot))
                return undefined;
            current = current.host;
            if (current instanceof TemplateProviderElement)
                return current;
        }
    };
    var TemplateProviderElement = (function (_super) {
        __extends(TemplateProviderElement, _super);
        function TemplateProviderElement() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TemplateProviderElement.prototype.createElement = function (templateKey) {
            var newElement = this.createElementWithId(templateKey);
            newElement.removeAttribute('id');
            return newElement;
        };
        TemplateProviderElement.prototype.createElementWithId = function (templateKey) {
            var template = this.templateMap.content.getElementById(templateKey);
            if (!template)
                throw new Error("Unable to find the template with the key '" + templateKey + "'.");
            var newElement = template.cloneNode(true);
            return newElement;
        };
        TemplateProviderElement.prototype.createElementFromTemplate = function (templateKey) {
            var template = this.templateMap.content.getElementById(templateKey);
            if (!template)
                throw new Error("Unable to find the template with the key '" + templateKey + "'.");
            var newElement = template.content.cloneNode(true);
            return newElement;
        };
        TemplateProviderElement.prototype.connectedCallback = function () {
            this.setTemplateMapElement();
        };
        TemplateProviderElement.prototype.setTemplateMapElement = function () {
            var templateMap = this.firstElementChild;
            if (!(templateMap instanceof HTMLTemplateElement))
                throw new Error("Provide template map as the first child or override the method setTemplateElement().");
            this.templateMap = templateMap;
        };
        TemplateProviderElement.prototype.getRequiredAttribute = function (name) {
            var value = this.getAttribute(name);
            if (!value)
                throw new Error(common_1.missingAttrMsg(this.localName, name));
            return value;
        };
        return TemplateProviderElement;
    }(HTMLElement));
    exports.TemplateProviderElement = TemplateProviderElement;
});
//# sourceMappingURL=TemplateProvider.js.map