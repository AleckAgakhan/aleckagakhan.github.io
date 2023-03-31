define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.removeShadowRootContainer = exports.addShadowRootContainer = exports.themeUnsubscribe = exports.themeSubscribe = exports.themeChangeHandler = exports.getThemeList = exports.setCurrentTheme = exports.getCurrentTheme = exports.registerTheme = void 0;
    const varPrefix = '.theme-';
    const chartThemeMap = [
        {
            valueGetter: t => t.textColor,
            className: 'textColor',
            styleName: 'color',
        },
        {
            valueGetter: t => t.backgroundColor,
            className: 'backgroundColor',
            styleName: 'background-color',
        },
        {
            valueGetter: t => t.borderColor,
            className: 'borderColor',
            styleName: 'border-color',
        },
        {
            valueGetter: t => t.borderWidth,
            className: 'borderWidth',
            styleName: 'border-width',
        },
    ];
    let currentTheme;
    const themeMap = new Map();
    const registerTheme = (theme) => {
        theme.animationProgressRatioE = 1000 / (theme.animationDuration * 120 * 2);
        if (themeMap.size == 0)
            currentTheme = theme;
        themeMap.set(theme.key, theme);
    };
    exports.registerTheme = registerTheme;
    const getCurrentTheme = () => {
        if (!currentTheme)
            throw new Error('Theme is not initialized.');
        return currentTheme;
    };
    exports.getCurrentTheme = getCurrentTheme;
    const setCurrentTheme = (key) => {
        const theme = themeMap.get(key);
        if (!theme)
            throw new Error(`The theme for the key '{key}' was not found.`);
        currentTheme = theme;
        if (requestId === undefined)
            requestId = requestAnimationFrame(runSubscribers);
    };
    exports.setCurrentTheme = setCurrentTheme;
    let requestId;
    const runSubscribers = (timestamp) => {
        requestId = undefined;
        const sb = [];
        for (const styleElement of shadowRootContainerMap.values()) {
            const styleSheet = styleElement.sheet;
            for (let index = styleSheet.rules.length - 1; index >= 0; index--) {
                styleSheet.removeRule(index);
            }
            fillThemeStyleSheet(styleSheet, currentTheme, sb);
        }
        for (const subscriber of subscribers) {
            if (exports.themeChangeHandler in subscriber)
                subscriber[exports.themeChangeHandler](timestamp, currentTheme);
            else
                subscriber(timestamp, currentTheme);
        }
    };
    const getThemeList = () => themeMap.values();
    exports.getThemeList = getThemeList;
    exports.themeChangeHandler = Symbol('ChartThemeChangeHandler');
    const subscribers = new Set();
    const themeSubscribe = (subscriber) => {
        subscribers.add(subscriber);
    };
    exports.themeSubscribe = themeSubscribe;
    const themeUnsubscribe = (subscriber) => {
        subscribers.delete(subscriber);
    };
    exports.themeUnsubscribe = themeUnsubscribe;
    const shadowRootContainerMap = new Map();
    const addShadowRootContainer = (element) => {
        if (shadowRootContainerMap.has(element))
            throw new Error(`Attempt to add the same element to theme as a shadow root container twice.`);
        const shadowRoot = element.shadowRoot;
        if (!shadowRoot)
            throw new Error(`Attempt to add the element to theme as a shadow root container that does't contain a shadow root.`);
        const style = createThemeStyleElement(shadowRoot, (0, exports.getCurrentTheme)());
        shadowRootContainerMap.set(element, style);
    };
    exports.addShadowRootContainer = addShadowRootContainer;
    const removeShadowRootContainer = (element) => {
        const style = shadowRootContainerMap.get(element);
        if (style) {
            style.remove();
            shadowRootContainerMap.delete(element);
        }
    };
    exports.removeShadowRootContainer = removeShadowRootContainer;
    const createThemeStyleElement = (parent, theme) => {
        const styleElement = document.createElement('style');
        parent.appendChild(styleElement);
        const styleSheet = styleElement.sheet;
        const sb = [];
        fillThemeStyleSheet(styleSheet, theme, sb);
        return styleElement;
    };
    const fillThemeStyleSheet = (styleSheet, theme, sb) => {
        for (const item of chartThemeMap) {
            sb.push(varPrefix);
            sb.push(item.className);
            sb.push(' { ');
            sb.push(item.styleName);
            sb.push(': ');
            const value = item.valueGetter(theme);
            if (typeof value === 'number') {
                sb.push(value.toString());
                sb.push('px; ');
            }
            else {
                sb.push(value);
                sb.push('; ');
            }
            ;
            sb.push(' }');
            styleSheet.insertRule(sb.join(''));
            sb.length = 0;
        }
    };
});
//# sourceMappingURL=ChartTheme.js.map