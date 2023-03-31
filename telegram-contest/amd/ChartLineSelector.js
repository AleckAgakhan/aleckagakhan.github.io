define(["require", "exports", "./ThemableCheckbox.js", "./ChartModel.js", "./ChartContextTemplateConsumer.js"], function (require, exports, ThemableCheckbox_js_1, ChartModel_js_1, ChartContextTemplateConsumer_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TagName = exports.ChartLineSelectorElement = void 0;
    class ChartLineSelector {
        constructor(element, model, checkboxTemplateKey, templateProvider) {
            this.checkboxList = [];
            this.element = element;
            this.checkboxTemplateKey = checkboxTemplateKey;
            this.templateProvider = templateProvider;
            this.model = model;
        }
        get model() { return this._model; }
        set model(newModel) {
            const checkboxList = this.checkboxList;
            const prevModel = this._model;
            if (prevModel) {
                prevModel.unsubscribe(this);
                for (const checkbox of checkboxList) {
                    checkbox.unsubscribe(this);
                    checkbox.remove();
                }
                checkboxList.length = 0;
            }
            this._model = newModel;
            if (newModel) {
                const { element, checkboxTemplateKey, templateProvider } = this;
                for (const line of newModel.orderedLines) {
                    const checkbox = templateProvider.createElement(checkboxTemplateKey);
                    checkbox.setAttribute("key", line.key);
                    checkbox.setAttribute("label-text", line.name);
                    checkbox.setAttribute("main-color", line.color.toString());
                    if (line.isCurrVisible)
                        checkbox.toggleAttribute("default-checked");
                    element.appendChild(checkbox);
                    checkbox.subscribe(this);
                    checkboxList.push(checkbox);
                }
                newModel.subscribe(this);
            }
        }
        disconnect() {
            this.templateProvider = undefined;
            const model = this._model;
            if (!model)
                return;
            model.unsubscribe(this);
            this.model = undefined;
            const checkboxList = this.checkboxList;
            for (const checkbox of checkboxList) {
                checkbox.unsubscribe(this);
                checkbox.remove();
            }
            checkboxList.length = 0;
        }
        [ThemableCheckbox_js_1.boolValueChangeHandlerKey](value, lineKey) {
            const model = this._model;
            if (!model)
                return;
            model.setVisibility(lineKey, value);
        }
        [ChartModel_js_1.chartModelChangeHandlerKey](model) {
            let index = 0;
            const checkboxList = this.checkboxList;
            for (const line of model.orderedLines) {
                if (line.isCurrVisible != line.isPrevVisible)
                    checkboxList[index].value = line.isCurrVisible;
                index++;
            }
        }
    }
    class ChartLineSelectorElement extends ChartContextTemplateConsumer_js_1.ChartContextTemplateConsumerElement {
        createController(model) {
            return new ChartLineSelector(this, model, this.getRequiredAttribute("checkbox-key"), this.templateProvider);
        }
    }
    exports.ChartLineSelectorElement = ChartLineSelectorElement;
    exports.TagName = 'chart-line-selector';
    customElements.define(exports.TagName, ChartLineSelectorElement);
});
//# sourceMappingURL=ChartLineSelector.js.map