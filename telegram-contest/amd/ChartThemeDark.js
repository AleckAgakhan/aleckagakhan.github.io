define(["require", "exports", "./ChartTheme.js", "./common.js"], function (require, exports, ChartTheme_js_1, common_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.chartThemeLight = void 0;
    exports.chartThemeLight = {
        key: 'dark',
        title: 'Night mode',
        textColor: '#FFFFFF',
        backgroundColor: '#242f3e',
        lineWidth: 2,
        gaugeColor: '',
        borderColor: '#344658',
        borderWidth: 1,
        animationDuration: 600,
        minAlpha: 3,
        animationProgressRatioE: 0,
        rangeSelector: {
            rangeBorderWidth: 8,
            rangeBorderColor: '#40566b',
            shadeColor: '#e0effc90',
        },
        view: {
            fontFamily: 'sans-serif',
            fontSize: 15,
            xLabelLineSpace: 5,
            labelColor: new common_js_1.Color('#546778'),
            yGridLineCount: 5,
            yGridLineColor: new common_js_1.Color('#293544'),
            xGridLineColor: new common_js_1.Color('#3b4a5a'),
            pointRadius: 5,
            pointTooltipWidth: 80,
        }
    };
    (0, ChartTheme_js_1.registerTheme)(exports.chartThemeLight);
});
//# sourceMappingURL=ChartThemeDark.js.map