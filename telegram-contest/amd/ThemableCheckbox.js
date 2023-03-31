define(["require", "exports", "./common.js", "./TemplateProvider.js"], function (require, exports, common_js_1, TemplateProvider_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TagName = exports.ThemableCheckbox = exports.boolValueChangeHandlerKey = void 0;
    exports.boolValueChangeHandlerKey = Symbol('BoolValue::ChangeHandler');
    class ThemableCheckbox extends HTMLElement {
        getRequiredAttribute(name) {
            const value = this.getAttribute(name);
            if (!value)
                throw new Error((0, common_js_1.missingAttrMsg)(exports.TagName, name));
            return value;
        }
        constructor() {
            super();
            this._value = false;
            this.subscribers = new Set();
            this.onclick = this.handleClick.bind(this);
        }
        connectedCallback() {
            const shadowRoot = this.attachShadow({ mode: 'open' });
            this.getRequiredAttribute("key");
            const mainColor = this.getRequiredAttribute("main-color");
            const styleElement = document.createElement('style');
            shadowRoot.appendChild(styleElement);
            const styleSheet = styleElement.sheet;
            styleSheet.insertRule(`.LineColorFill { fill: ${mainColor} }`);
            const templateProvider = (0, TemplateProvider_js_1.getTemplateProvider)(this);
            if (!templateProvider)
                throw new Error((0, common_js_1.missingTemplateProviderMsg)(exports.TagName));
            const iconKey = this.getRequiredAttribute("icon-key");
            const icon = templateProvider.createElementWithId(iconKey);
            shadowRoot.appendChild(icon);
            this.icon = icon;
            if (this.hasAttribute("default-checked"))
                this._value = true;
            if (this._value)
                this.initChecked();
            else
                this.initUnchecked();
            const labelKey = this.getRequiredAttribute("label-key");
            const label = templateProvider.createElement(labelKey);
            shadowRoot.appendChild(label);
            const labelId = this.getAttribute("label-id");
            const labelElement = labelId ? shadowRoot.getElementById(labelId) : label;
            if (!labelElement)
                throw new Error((0, common_js_1.missingTemplateElementMsg)(exports.TagName, "label-id", labelId));
            labelElement.textContent = this.getAttribute("label-text");
        }
        get value() { return this._value; }
        set value(value) {
            if (value === this._value)
                return;
            this._value = value;
            const key = this.getRequiredAttribute("key");
            for (const subscriber of this.subscribers) {
                if (exports.boolValueChangeHandlerKey in subscriber)
                    subscriber[exports.boolValueChangeHandlerKey](value, key);
                else
                    subscriber(value, key);
            }
            if (value)
                this.animateToChecked();
            else
                this.animateToUnchecked();
        }
        subscribe(subscriber) {
            this.subscribers.add(subscriber);
        }
        unsubscribe(subscriber) {
            this.subscribers.delete(subscriber);
        }
        handleClick() {
            this.value = !this._value;
        }
        animateToChecked() {
            this.icon.dispatchEvent(new Event('Check'));
        }
        animateToUnchecked() {
            this.icon.dispatchEvent(new Event('Uncheck'));
        }
        initChecked() {
            this.icon.dispatchEvent(new Event('InitCheck'));
        }
        initUnchecked() {
            this.icon.dispatchEvent(new Event('InitUncheck'));
        }
    }
    exports.ThemableCheckbox = ThemableCheckbox;
    exports.TagName = 'themable-checkbox';
    customElements.define(exports.TagName, ThemableCheckbox);
});
//# sourceMappingURL=ThemableCheckbox.js.map