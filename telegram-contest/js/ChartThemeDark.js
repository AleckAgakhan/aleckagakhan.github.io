import { registerTheme } from "./ChartTheme";
import { Color } from "./common";
export const chartThemeLight = {
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
        labelColor: new Color('#546778'),
        yGridLineCount: 5,
        yGridLineColor: new Color('#293544'),
        xGridLineColor: new Color('#3b4a5a'),
        pointRadius: 5,
        pointTooltipWidth: 80,
    }
};
registerTheme(chartThemeLight);
//# sourceMappingURL=ChartThemeDark.js.map