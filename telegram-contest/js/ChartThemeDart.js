import { registerTheme } from "./ChartTheme";
import { Color } from "./common";
export const chartThemeLight = {
    key: 'dark',
    title: 'Night mode',
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
        labelColor: new Color('#96A2AA'),
        yGridLineCount: 5,
        yGridLineColor: new Color('#f2f4f6'),
        xGridLineColor: new Color('#f2f4f6'),
        pointRadius: 5,
        pointTooltipWidth: 80,
    }
};
registerTheme(chartThemeLight);
//# sourceMappingURL=ChartThemeDart.js.map