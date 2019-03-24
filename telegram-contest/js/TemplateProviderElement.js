import { CustomElement } from "./CustomElement";
export class TemplateProviderElement extends CustomElement {
    createElement(id) {
        const template = this.templateMap.content.getElementById(id);
        if (!template)
            throw new Error(`Unable to find the template with the id '${id}'.`);
        return template.cloneNode(true);
    }
    connectedCallback() {
        super.connectedCallback();
        this.setTemplateElement();
    }
    setTemplateElement() {
        const templateMap = this.firstElementChild;
        if (!(templateMap instanceof HTMLTemplateElement))
            throw new Error(`Provide template map as the first child or override the method setTemplateElement().`);
        this.templateMap = templateMap;
    }
}
//# sourceMappingURL=TemplateProviderElement.js.map