import { chartModelChangeHandlerKey } from "./ChartModel.js";
import { ChartContextTemplateConsumerElement } from "./ChartContextTemplateConsumer.js";
import { missingElementInsideTemplateMsg } from "./common.js";
class InputChartRangeSelector {
    constructor(element, model, templateProvider, rangeStartInput, rangeEndInput, applyButton, itemKey, itemContainer) {
        this.element = element;
        this.templateProvider = templateProvider;
        this.rangeStartInput = rangeStartInput;
        this.rangeEndInput = rangeEndInput;
        this.applyButton = applyButton;
        this.itemKey = itemKey;
        this.itemContainer = itemContainer;
        this.rangeStart = 0;
        this.rangeEnd = 0;
        this.itemList = new Set();
        this.handleApply = this.handleApply.bind(this);
        applyButton.onclick = this.handleApply;
        this.handleKeyPress = this.handleKeyPress.bind(this);
        rangeStartInput.onkeypress = this.handleKeyPress;
        rangeEndInput.onkeypress = this.handleKeyPress;
        this.handleItemClick = this.handleItemClick.bind(this);
        this.model = model;
    }
    get model() { return this._model; }
    set model(newModel) {
        const oldModel = this._model;
        if (oldModel === newModel)
            return;
        const { rangeStartInput, rangeEndInput } = this;
        if (oldModel) {
            oldModel.unsubscribe(this);
            rangeStartInput.value = '';
            rangeStartInput.readOnly = true;
            rangeEndInput.value = '';
            rangeEndInput.readOnly = true;
        }
        this._model = newModel;
        if (!newModel)
            return;
        const { currRangeStart, currRangeEnd } = newModel;
        this.rangeStart = currRangeStart;
        rangeStartInput.readOnly = false;
        rangeStartInput.value = currRangeStart.toString();
        this.rangeEnd = currRangeEnd;
        rangeEndInput.readOnly = false;
        rangeEndInput.value = currRangeEnd.toString();
        newModel.subscribe(this);
    }
    disconnect() {
        this.model = undefined;
    }
    [chartModelChangeHandlerKey](model) {
        const { currRangeStart, currRangeEnd } = model;
        if (currRangeStart != this.rangeStart) {
            this.rangeStart = currRangeStart;
            this.rangeStartInput.value = currRangeStart.toString();
        }
        if (currRangeEnd != this.rangeEnd) {
            this.rangeEnd = currRangeEnd;
            this.rangeEndInput.value = currRangeEnd.toString();
        }
    }
    handleApply() {
        const model = this._model;
        if (!model)
            return;
        const maxRange = model.maxRangeLength;
        const { rangeStartInput, rangeEndInput } = this;
        let rangeStart = parseFloat(rangeStartInput.value);
        if (isNaN(rangeStart)) {
            rangeStart = this.rangeStart;
            rangeStartInput.value = rangeStart.toString();
        }
        else if (rangeStart < 0) {
            rangeStart = 0;
            this.rangeStart = 0;
        }
        else if (rangeStart > maxRange) {
            rangeStart = maxRange;
            this.rangeStart = maxRange;
        }
        else
            rangeStart = Math.floor(rangeStart * 10) / 10;
        let rangeEnd = parseFloat(rangeEndInput.value);
        if (isNaN(rangeEnd))
            rangeEndInput.value = this.rangeEnd.toString();
        else if (rangeEnd < rangeStart) {
            rangeEnd = rangeStart;
            this.rangeEnd = rangeStart;
        }
        else if (rangeEnd > maxRange) {
            rangeEnd = maxRange;
            this.rangeEnd = maxRange;
        }
        else
            rangeEnd = Math.floor(rangeEnd * 10) / 10;
        let itemExists = false;
        for (const itemElement of this.itemList) {
            const itemRageStart = parseFloat(itemElement.getAttribute("range-start"));
            if (itemRageStart !== rangeStart)
                continue;
            const itemRangeEnd = parseFloat(itemElement.getAttribute("range-end"));
            if (itemRangeEnd !== rangeEnd)
                continue;
            itemExists = true;
            break;
        }
        if (!itemExists) {
            const rangeStartStr = rangeStart.toString();
            const rangeEndStr = rangeEnd.toString();
            const itemFragment = this.templateProvider.createElementFromTemplate(this.itemKey);
            const applyButton = itemFragment.getElementById("ApplyRange");
            applyButton.textContent = `${rangeStartStr} : ${rangeEndStr}`;
            const itemElement = itemFragment.firstElementChild;
            itemElement.setAttribute("range-start", rangeStartStr);
            itemElement.setAttribute("range-end", rangeEndStr);
            itemElement.onclick = this.handleItemClick;
            this.itemList.add(itemElement);
            this.itemContainer.prepend(itemElement);
        }
        model.setRange(rangeStart, rangeEnd);
    }
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.handleApply();
        }
    }
    async handleItemClick(event) {
        const button = event.target;
        switch (button.id) {
            case "ApplyRange":
                {
                    const model = this._model;
                    if (!model)
                        return;
                    const itemElement = event.currentTarget;
                    const rangeStart = parseFloat(itemElement.getAttribute("range-start"));
                    const rangeEnd = parseFloat(itemElement.getAttribute("range-end"));
                    model.setRange(rangeStart, rangeEnd);
                    return;
                }
            case "RemoveRange":
                {
                    const itemElement = event.currentTarget;
                    this.itemList.delete(itemElement);
                    itemElement.remove();
                    return;
                }
        }
    }
}
export const TagName = 'input-chart-range-selector';
export class InputChartRangeSelectorElement extends ChartContextTemplateConsumerElement {
    createController(model) {
        const templateProvider = this.templateProvider;
        const itemKey = this.getRequiredAttribute("item-key");
        const contentKey = this.getRequiredAttribute("content-key");
        const contentFragment = templateProvider.createElementFromTemplate(contentKey);
        const rangeStartInput = contentFragment.getElementById("RangeStart");
        if (!rangeStartInput)
            throw new Error(missingElementInsideTemplateMsg(TagName, contentKey, "RangeStart"));
        rangeStartInput.setAttribute('min', '0');
        rangeStartInput.setAttribute('max', model.maxRangeLength.toString());
        const rangeEndInput = contentFragment.getElementById("RangeEnd");
        if (!rangeEndInput)
            throw new Error(missingElementInsideTemplateMsg(TagName, contentKey, "RangeEnd"));
        rangeEndInput.setAttribute('min', '0');
        rangeEndInput.setAttribute('max', model.maxRangeLength.toString());
        const applyButton = contentFragment.getElementById("RangeApply");
        if (!applyButton)
            throw new Error(missingElementInsideTemplateMsg(TagName, contentKey, "RangeApply"));
        const itemContainer = contentFragment.getElementById("RangeItemContainer");
        if (!itemContainer)
            throw new Error(missingElementInsideTemplateMsg(TagName, contentKey, "RangeItemContainer"));
        this.attachShadow({ mode: 'open' }).append(contentFragment);
        return new InputChartRangeSelector(this, model, templateProvider, rangeStartInput, rangeEndInput, applyButton, itemKey, itemContainer);
    }
}
customElements.define(TagName, InputChartRangeSelectorElement);
//# sourceMappingURL=InputRangeSelector.js.map