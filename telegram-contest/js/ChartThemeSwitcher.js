import { themeChangeHandler, themeSubscribe, themeUnsubscribe, getThemeList, setCurrentTheme, getCurrentTheme } from "./ChartTheme";
class ChartThemeSwitchElement extends HTMLElement {
    constructor() {
        super();
        this.map = new Map();
        this.handleThemeItemClick = this.handleThemeItemClick.bind(this);
    }
    connectedCallback() {
        themeSubscribe(this);
        const currTheme = getCurrentTheme();
        this.currThemeKey = currTheme.key;
        for (const theme of getThemeList()) {
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
        themeUnsubscribe(this);
    }
    [themeChangeHandler](timestamp, theme) {
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
        setCurrentTheme(themeKey);
    }
}
export const TagName = 'chart-theme-switch';
customElements.define(TagName, ChartThemeSwitchElement);
//# sourceMappingURL=ChartThemeSwitcher.js.map