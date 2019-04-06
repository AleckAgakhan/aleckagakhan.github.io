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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.missingAttrMsg = function (tagName, attr) {
        return "The required attribute <" + tagName + " " + attr + "=\"...\"> is missing or empty.";
    };
    exports.missingTemplateProviderMsg = function (tagName) {
        return "Unable to find tempalte provider: <" + tagName + "> can only be placed within shadow tree of a template provider element or its shadow descendants.";
    };
    exports.missingTemplateElementMsg = function (tagName, attr, id) {
        return "Unable to find the element specified by the reference <" + tagName + " " + attr + "=\"" + id + "\">";
    };
    exports.missingElementInsideTemplateMsg = function (tagName, templateKey, elementId) {
        return "<" + tagName + "> requires the element with the id '" + elementId + "' inside the template '" + templateKey + "'.";
    };
    exports.delay = function (timemout) {
        if (timemout === void 0) { timemout = 0; }
        return new Promise(function (resolve) { return setTimeout(resolve, timemout); });
    };
    var Color = (function (_super) {
        __extends(Color, _super);
        function Color(value) {
            var _this = _super.call(this, 4) || this;
            if (!value)
                return _this;
            if (typeof value === 'string') {
                var len = value.length;
                if (len !== 7 && len !== 9)
                    throw new Error("Unable to parse color: invalid length (" + len + ").");
                if (value[0] != '#')
                    throw new Error("Unable to parse color: unknown prefix.");
                var r = parseInt(value.substr(1, 2), 16);
                if (isNaN(r))
                    throw new Error("Unable to parse color: invalid red component (" + value.substr(1, 2) + ").");
                _this[0] = r;
                var g = parseInt(value.substr(3, 2), 16);
                if (isNaN(g))
                    throw new Error("Unable to parse color: invalid green component (" + value.substr(3, 2) + ").");
                _this[1] = g;
                var b = parseInt(value.substr(5, 2), 16);
                if (isNaN(b))
                    throw new Error("Unable to parse color: invalid blue component (" + value.substr(5, 2) + ").");
                _this[2] = b;
                if (len === 9) {
                    var alpha = parseInt(value.substr(7, 2), 16);
                    if (isNaN(alpha))
                        throw new Error("Unable to parse color: invalid alpha component (" + value.substr(7, 2) + ").");
                    _this[3] = alpha;
                }
                else
                    _this[3] = 0xFF;
            }
            else if (value instanceof Color) {
                _this[0] = value[0];
                _this[1] = value[1];
                _this[2] = value[2];
                _this[3] = value[3];
                _this.strCache = value.strCache;
            }
            else
                throw new Error("Invalid type of the parameter 'value'.");
            return _this;
        }
        Object.defineProperty(Color.prototype, "red", {
            get: function () { return this[0]; },
            set: function (value) {
                if (value === this[0])
                    return;
                this[0] = value;
                this.strCache = undefined;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "green", {
            get: function () { return this[1]; },
            set: function (value) {
                if (value === this[1])
                    return;
                this[1] = value;
                this.strCache = undefined;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "blue", {
            get: function () { return this[2]; },
            set: function (value) {
                if (value === this[2])
                    return;
                this[2] = value;
                this.strCache = undefined;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Color.prototype, "alpha", {
            get: function () { return this[3]; },
            set: function (value) {
                if (value === this[3])
                    return;
                this[3] = value;
                this.strCache = undefined;
            },
            enumerable: true,
            configurable: true
        });
        Color.prototype.assignFrom = function (color) {
            if (!(color instanceof Color))
                throw new Error("Invalid type of the parameter 'color'.");
            this[0] = color[0];
            this[1] = color[1];
            this[2] = color[2];
            this[3] = color[3];
            this.strCache = color.strCache;
        };
        Color.prototype.toString = function () {
            var strCache = this.strCache;
            if (strCache !== undefined)
                return strCache;
            var a = ['#'];
            this.appendComponent(a, 0);
            this.appendComponent(a, 1);
            this.appendComponent(a, 2);
            this.appendComponent(a, 3);
            strCache = a.join('');
            this.strCache = strCache;
            return strCache;
        };
        Color.prototype.appendComponent = function (a, index) {
            var c = this[index].toString(16);
            if (c.length < 2)
                a.push('0');
            a.push(c);
        };
        return Color;
    }(Uint8Array));
    exports.Color = Color;
    exports.getMonthDayString = function (date) { return months[date.getMonth()] + ' ' + date.getDate().toString(); };
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    exports.PIx2 = Math.PI * 2;
});
//# sourceMappingURL=common.js.map