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
define(["require", "exports", "./common", "./TemplateProvider"], function (require, exports, common_1, TemplateProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.boolValueChangeHandlerKey = Symbol('BoolValue::ChangeHandler');
    var ThemableCheckbox = (function (_super) {
        __extends(ThemableCheckbox, _super);
        function ThemableCheckbox() {
            var _this = _super.call(this) || this;
            _this._value = false;
            _this.subscribers = new Set();
            _this.onclick = _this.handleClick.bind(_this);
            return _this;
        }
        ThemableCheckbox.prototype.getRequiredAttribute = function (name) {
            var value = this.getAttribute(name);
            if (!value)
                throw new Error(common_1.missingAttrMsg(exports.TagName, name));
            return value;
        };
        ThemableCheckbox.prototype.connectedCallback = function () {
            var shadowRoot = this.attachShadow({ mode: 'open' });
            this.getRequiredAttribute("key");
            var mainColor = this.getRequiredAttribute("main-color");
            var styleElement = document.createElement('style');
            shadowRoot.appendChild(styleElement);
            var styleSheet = styleElement.sheet;
            styleSheet.insertRule(".LineColorFill { fill: " + mainColor + " }");
            var templateProvider = TemplateProvider_1.getTemplateProvider(this);
            if (!templateProvider)
                throw new Error(common_1.missingTemplateProviderMsg(exports.TagName));
            var iconKey = this.getRequiredAttribute("icon-key");
            var icon = templateProvider.createElementWithId(iconKey);
            shadowRoot.appendChild(icon);
            this.icon = icon;
            if (this.hasAttribute("default-checked"))
                this._value = true;
            if (this._value)
                this.initChecked();
            else
                this.initUnchecked();
            var labelKey = this.getRequiredAttribute("label-key");
            var label = templateProvider.createElement(labelKey);
            shadowRoot.appendChild(label);
            var labelId = this.getAttribute("label-id");
            var labelElement = labelId ? shadowRoot.getElementById(labelId) : label;
            if (!labelElement)
                throw new Error(common_1.missingTemplateElementMsg(exports.TagName, "label-id", labelId));
            labelElement.textContent = this.getAttribute("label-text");
        };
        Object.defineProperty(ThemableCheckbox.prototype, "value", {
            get: function () { return this._value; },
            set: function (value) {
                var e_1, _a;
                if (value === this._value)
                    return;
                this._value = value;
                var key = this.getRequiredAttribute("key");
                try {
                    for (var _b = __values(this.subscribers), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var subscriber = _c.value;
                        if (exports.boolValueChangeHandlerKey in subscriber)
                            subscriber[exports.boolValueChangeHandlerKey](value, key);
                        else
                            subscriber(value, key);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                if (value)
                    this.animateToChecked();
                else
                    this.animateToUnchecked();
            },
            enumerable: true,
            configurable: true
        });
        ThemableCheckbox.prototype.subscribe = function (subscriber) {
            this.subscribers.add(subscriber);
        };
        ThemableCheckbox.prototype.unsubscribe = function (subscriber) {
            this.subscribers.delete(subscriber);
        };
        ThemableCheckbox.prototype.handleClick = function () {
            this.value = !this._value;
        };
        ThemableCheckbox.prototype.animateToChecked = function () {
            this.icon.dispatchEvent(new Event('Check'));
        };
        ThemableCheckbox.prototype.animateToUnchecked = function () {
            this.icon.dispatchEvent(new Event('Uncheck'));
        };
        ThemableCheckbox.prototype.initChecked = function () {
            this.icon.dispatchEvent(new Event('InitCheck'));
        };
        ThemableCheckbox.prototype.initUnchecked = function () {
            this.icon.dispatchEvent(new Event('InitUncheck'));
        };
        return ThemableCheckbox;
    }(HTMLElement));
    exports.ThemableCheckbox = ThemableCheckbox;
    exports.TagName = 'themable-checkbox';
    customElements.define(exports.TagName, ThemableCheckbox);
});
//# sourceMappingURL=ThemableCheckbox.js.map