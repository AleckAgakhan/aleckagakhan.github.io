define(["require", "exports", "./ChartTheme.js"], function (require, exports, ChartTheme_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TagName = void 0;
    class ChartThemeSwitchElement extends HTMLElement {
        constructor() {
            super();
            this.map = new Map();
            this.handleThemeItemClick = this.handleThemeItemClick.bind(this);
        }
        connectedCallback() {
            (0, ChartTheme_js_1.themeSubscribe)(this);
            const currTheme = (0, ChartTheme_js_1.getCurrentTheme)();
            this.currThemeKey = currTheme.key;
            for (const theme of (0, ChartTheme_js_1.getThemeList)()) {
                const element = document.createElement('div');
                element.textContent = theme.title;
                element.dataset.themeKey = theme.key;
                element.onclick = this.handleThemeItemClick;
                if (currTheme !== theme)
                    this.appendChild(element);
                this.map.set(theme.key, element);
            }
        }
        disconnectedCallback() {
            (0, ChartTheme_js_1.themeUnsubscribe)(this);
        }
        [ChartTheme_js_1.themeChangeHandler](timestamp, theme) {
            const element = this.map.get(theme.key);
            element.remove();
            if (this.currThemeKey) {
                const element = this.map.get(this.currThemeKey);
                this.appendChild(element);
            }
            this.currThemeKey = theme.key;
        }
        handleThemeItemClick(event) {
            const themeKey = event.target.dataset.themeKey;
            (0, ChartTheme_js_1.setCurrentTheme)(themeKey);
        }
    }
    exports.TagName = 'chart-theme-switch';
    customElements.define(exports.TagName, ChartThemeSwitchElement);
});
//# sourceMappingURL=ChartThemeSwitcher.js.map