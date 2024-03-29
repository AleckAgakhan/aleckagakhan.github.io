define(["require", "exports", "./ChartTheme.js", "./common.js"], function (require, exports, ChartTheme_js_1, common_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.chartThemeLight = void 0;
    exports.chartThemeLight = {
        key: 'light',
        title: 'Day mode',
        textColor: '#000000',
        backgroundColor: '#FFFFFF',
        lineWidth: 2,
        gaugeColor: '',
        borderColor: '#E6ECF0',
        borderWidth: 1,
        animationDuration: 600,
        minAlpha: 3,
        animationProgressRatioE: 0,
        rangeSelector: {
            rangeBorderWidth: 8,
            rangeBorderColor: '#b0cee8FF',
            shadeColor: '#e0effc90',
        },
        view: {
            fontFamily: 'sans-serif',
            fontSize: 15,
            xLabelLineSpace: 5,
            labelColor: new common_js_1.Color('#96A2AA'),
            yGridLineCount: 5,
            yGridLineColor: new common_js_1.Color('#f2f4f6'),
            xGridLineColor: new common_js_1.Color('#f2f4f6'),
            pointRadius: 5,
            pointTooltipWidth: 80,
        }
    };
    (0, ChartTheme_js_1.registerTheme)(exports.chartThemeLight);
});
//# sourceMappingURL=ChartThemeLight.js.map