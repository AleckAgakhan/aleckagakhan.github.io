define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PIx2 = exports.getMonthDayString = exports.Color = exports.delay = exports.missingElementInsideTemplateMsg = exports.missingTemplateElementMsg = exports.missingTemplateProviderMsg = exports.missingAttrMsg = void 0;
    const missingAttrMsg = (tagName, attr) => `The required attribute <${tagName} ${attr}="..."> is missing or empty.`;
    exports.missingAttrMsg = missingAttrMsg;
    const missingTemplateProviderMsg = (tagName) => `Unable to find tempalte provider: <${tagName}> can only be placed within shadow tree of a template provider element or its shadow descendants.`;
    exports.missingTemplateProviderMsg = missingTemplateProviderMsg;
    const missingTemplateElementMsg = (tagName, attr, id) => `Unable to find the element specified by the reference <${tagName} ${attr}="${id}">`;
    exports.missingTemplateElementMsg = missingTemplateElementMsg;
    const missingElementInsideTemplateMsg = (tagName, templateKey, elementId) => `<${tagName}> requires the element with the id '${elementId}' inside the template '${templateKey}'.`;
    exports.missingElementInsideTemplateMsg = missingElementInsideTemplateMsg;
    const delay = (timemout = 0) => new Promise((resolve) => setTimeout(resolve, timemout));
    exports.delay = delay;
    class Color extends Uint8Array {
        constructor(value) {
            super(4);
            if (!value)
                return;
            if (typeof value === 'string') {
                const len = value.length;
                if (len !== 7 && len !== 9)
                    throw new Error(`Unable to parse color: invalid length (${len}).`);
                if (value[0] != '#')
                    throw new Error(`Unable to parse color: unknown prefix.`);
                const r = parseInt(value.substr(1, 2), 16);
                if (isNaN(r))
                    throw new Error(`Unable to parse color: invalid red component (${value.substr(1, 2)}).`);
                this[0] = r;
                const g = parseInt(value.substr(3, 2), 16);
                if (isNaN(g))
                    throw new Error(`Unable to parse color: invalid green component (${value.substr(3, 2)}).`);
                this[1] = g;
                const b = parseInt(value.substr(5, 2), 16);
                if (isNaN(b))
                    throw new Error(`Unable to parse color: invalid blue component (${value.substr(5, 2)}).`);
                this[2] = b;
                if (len === 9) {
                    const alpha = parseInt(value.substr(7, 2), 16);
                    if (isNaN(alpha))
                        throw new Error(`Unable to parse color: invalid alpha component (${value.substr(7, 2)}).`);
                    this[3] = alpha;
                }
                else
                    this[3] = 0xFF;
            }
            else if (value instanceof Color) {
                this[0] = value[0];
                this[1] = value[1];
                this[2] = value[2];
                this[3] = value[3];
                this.strCache = value.strCache;
            }
            else
                throw new Error("Invalid type of the parameter 'value'.");
        }
        get red() { return this[0]; }
        set red(value) {
            if (value === this[0])
                return;
            this[0] = value;
            this.strCache = undefined;
        }
        get green() { return this[1]; }
        set green(value) {
            if (value === this[1])
                return;
            this[1] = value;
            this.strCache = undefined;
        }
        get blue() { return this[2]; }
        set blue(value) {
            if (value === this[2])
                return;
            this[2] = value;
            this.strCache = undefined;
        }
        get alpha() { return this[3]; }
        set alpha(value) {
            if (value === this[3])
                return;
            this[3] = value;
            this.strCache = undefined;
        }
        assignFrom(color) {
            if (!(color instanceof Color))
                throw new Error("Invalid type of the parameter 'color'.");
            this[0] = color[0];
            this[1] = color[1];
            this[2] = color[2];
            this[3] = color[3];
            this.strCache = color.strCache;
        }
        toString() {
            let strCache = this.strCache;
            if (strCache !== undefined)
                return strCache;
            const a = ['#'];
            this.appendComponent(a, 0);
            this.appendComponent(a, 1);
            this.appendComponent(a, 2);
            this.appendComponent(a, 3);
            strCache = a.join('');
            this.strCache = strCache;
            return strCache;
        }
        appendComponent(a, index) {
            let c = this[index].toString(16);
            if (c.length < 2)
                a.push('0');
            a.push(c);
        }
    }
    exports.Color = Color;
    const getMonthDayString = (date) => months[date.getMonth()] + ' ' + date.getDate().toString();
    exports.getMonthDayString = getMonthDayString;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    exports.PIx2 = Math.PI * 2;
});
//# sourceMappingURL=common.js.map