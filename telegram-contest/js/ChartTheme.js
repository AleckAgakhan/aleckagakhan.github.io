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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var varPrefix = '.theme-';
    var chartThemeMap = [
        {
            valueGetter: function (t) { return t.textColor; },
            className: 'textColor',
            styleName: 'color',
        },
        {
            valueGetter: function (t) { return t.backgroundColor; },
            className: 'backgroundColor',
            styleName: 'background-color',
        },
        {
            valueGetter: function (t) { return t.borderColor; },
            className: 'borderColor',
            styleName: 'border-color',
        },
        {
            valueGetter: function (t) { return t.borderWidth; },
            className: 'borderWidth',
            styleName: 'border-width',
        },
    ];
    var currentTheme;
    var themeMap = new Map();
    exports.registerTheme = function (theme) {
        theme.animationProgressRatioE = 1000 / (theme.animationDuration * 120 * 2);
        if (themeMap.size == 0)
            currentTheme = theme;
        themeMap.set(theme.key, theme);
    };
    exports.getCurrentTheme = function () {
        if (!currentTheme)
            throw new Error('Theme is not initialized.');
        return currentTheme;
    };
    exports.setCurrentTheme = function (key) {
        var theme = themeMap.get(key);
        if (!theme)
            throw new Error("The theme for the key '{key}' was not found.");
        currentTheme = theme;
        if (requestId === undefined)
            requestId = requestAnimationFrame(runSubscribers);
    };
    var requestId;
    var runSubscribers = function (timestamp) {
        var e_1, _a, e_2, _b;
        requestId = undefined;
        var sb = [];
        try {
            for (var _c = __values(shadowRootContainerMap.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var styleElement = _d.value;
                var styleSheet = styleElement.sheet;
                for (var index = styleSheet.rules.length - 1; index >= 0; index--) {
                    styleSheet.removeRule(index);
                }
                fillThemeStyleSheet(styleSheet, currentTheme, sb);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var subscribers_1 = __values(subscribers), subscribers_1_1 = subscribers_1.next(); !subscribers_1_1.done; subscribers_1_1 = subscribers_1.next()) {
                var subscriber = subscribers_1_1.value;
                if (exports.themeChangeHandler in subscriber)
                    subscriber[exports.themeChangeHandler](timestamp, currentTheme);
                else
                    subscriber(timestamp, currentTheme);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (subscribers_1_1 && !subscribers_1_1.done && (_b = subscribers_1.return)) _b.call(subscribers_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    exports.getThemeList = function () { return themeMap.values(); };
    exports.themeChangeHandler = Symbol('ChartThemeChangeHandler');
    var subscribers = new Set();
    exports.themeSubscribe = function (subscriber) {
        subscribers.add(subscriber);
    };
    exports.themeUnsubscribe = function (subscriber) {
        subscribers.delete(subscriber);
    };
    var shadowRootContainerMap = new Map();
    exports.addShadowRootContainer = function (element) {
        if (shadowRootContainerMap.has(element))
            throw new Error("Attempt to add the same element to theme as a shadow root container twice.");
        var shadowRoot = element.shadowRoot;
        if (!shadowRoot)
            throw new Error("Attempt to add the element to theme as a shadow root container that does't contain a shadow root.");
        var style = createThemeStyleElement(shadowRoot, exports.getCurrentTheme());
        shadowRootContainerMap.set(element, style);
    };
    exports.removeShadowRootContainer = function (element) {
        var style = shadowRootContainerMap.get(element);
        if (style) {
            style.remove();
            shadowRootContainerMap.delete(element);
        }
    };
    var createThemeStyleElement = function (parent, theme) {
        var styleElement = document.createElement('style');
        parent.appendChild(styleElement);
        var styleSheet = styleElement.sheet;
        var sb = [];
        fillThemeStyleSheet(styleSheet, theme, sb);
        return styleElement;
    };
    var fillThemeStyleSheet = function (styleSheet, theme, sb) {
        var e_3, _a;
        try {
            for (var chartThemeMap_1 = __values(chartThemeMap), chartThemeMap_1_1 = chartThemeMap_1.next(); !chartThemeMap_1_1.done; chartThemeMap_1_1 = chartThemeMap_1.next()) {
                var item = chartThemeMap_1_1.value;
                sb.push(varPrefix);
                sb.push(item.className);
                sb.push(' { ');
                sb.push(item.styleName);
                sb.push(': ');
                var value = item.valueGetter(theme);
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
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (chartThemeMap_1_1 && !chartThemeMap_1_1.done && (_a = chartThemeMap_1.return)) _a.call(chartThemeMap_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
});
//# sourceMappingURL=ChartTheme.js.map