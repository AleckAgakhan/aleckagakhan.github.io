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
define(["require", "exports", "./ChartTheme"], function (require, exports, ChartTheme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ChartThemeSwitchElement = (function (_super) {
        __extends(ChartThemeSwitchElement, _super);
        function ChartThemeSwitchElement() {
            var _this = _super.call(this) || this;
            _this.map = new Map();
            _this.handleThemeItemClick = _this.handleThemeItemClick.bind(_this);
            return _this;
        }
        ChartThemeSwitchElement.prototype.connectedCallback = function () {
            var e_1, _a;
            ChartTheme_1.themeSubscribe(this);
            var currTheme = ChartTheme_1.getCurrentTheme();
            this.currThemeKey = currTheme.key;
            try {
                for (var _b = __values(ChartTheme_1.getThemeList()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var theme = _c.value;
                    var element = document.createElement('div');
                    element.textContent = theme.title;
                    element.dataset.themeKey = theme.key;
                    element.onclick = this.handleThemeItemClick;
                    if (currTheme !== theme)
                        this.appendChild(element);
                    this.map.set(theme.key, element);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        ChartThemeSwitchElement.prototype.disconnectedCallback = function () {
            ChartTheme_1.themeUnsubscribe(this);
        };
        ChartThemeSwitchElement.prototype[ChartTheme_1.themeChangeHandler] = function (timestamp, theme) {
            var element = this.map.get(theme.key);
            element.remove();
            if (this.currThemeKey) {
                var element_1 = this.map.get(this.currThemeKey);
                this.appendChild(element_1);
            }
            this.currThemeKey = theme.key;
        };
        ChartThemeSwitchElement.prototype.handleThemeItemClick = function (event) {
            var themeKey = event.target.dataset.themeKey;
            ChartTheme_1.setCurrentTheme(themeKey);
        };
        return ChartThemeSwitchElement;
    }(HTMLElement));
    exports.TagName = 'chart-theme-switch';
    customElements.define(exports.TagName, ChartThemeSwitchElement);
});
//# sourceMappingURL=ChartThemeSwitcher.js.map