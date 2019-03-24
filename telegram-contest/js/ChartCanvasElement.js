export class ChartCanvasElement extends HTMLElement {
    constructor() {
        super();
        this.rangePerPixel = 0;
        this.isPointerAction = false;
        this.pointerCaptureId = 0;
        this.pointerActionX = 0;
        const canvas = document.createElement('canvas');
        this.onpointerdown = this.handlePointerDown.bind(this);
        this.onpointerup = this.handlePointerUp.bind(this);
        this.onpointermove = this.handlePointerMove.bind(this);
        this.onpointerenter = this.handlePointerEnter.bind(this);
        this.onpointerleave = this.handlePointerLeave.bind(this);
        this.attachShadow({ mode: 'open' }).append(canvas);
        this.canvas = canvas;
        this.handleRenderModel = this.handleRenderModel.bind(this);
    }
    init(width, height, model, theme, renderer) {
        this.width = width;
        this.height = height;
        model.subscribe(this.handleRenderModel);
        this.rangePerPixel = model.maxRange / (width - theme.rangeBorderWidth * 2);
        this.model = model;
        this.theme = theme;
        this.renderer = renderer;
    }
    setModel(model) {
        if (this.model === model)
            return;
        if (this.model)
            this.model.unsubscribe(this.handleRenderModel);
        this.model = model;
        if (model) {
            model.subscribe(this.handleRenderModel);
            this.rangePerPixel = model.maxRange / (this.width - this.theme.rangeBorderWidth * 2);
        }
    }
    handleRenderModel(model) {
        this.renderer.render(model, this.theme, this.canvas.getContext('2d'));
    }
    connectedCallback() {
        if (!this.isConnected)
            return;
        const { style, canvas } = this;
        style.border = 'solid black 1px';
        style.display = 'inline-block';
        style.height = (this.height) + 'px';
        canvas.width = this.width;
        canvas.height = this.height;
        this.renderer.render(this.model, this.theme, canvas.getContext('2d'));
    }
    getRegionName(x) {
        const { currRangeStart: start, currRangeEnd: end, maxRange } = this.model;
        const rangeBorderWidth = this.theme.rangeBorderWidth;
        const rangeStep = (this.width - rangeBorderWidth * 2) / maxRange;
        const rangeStartLeft = start * rangeStep;
        if (x < 0)
            return undefined;
        if (x < rangeStartLeft)
            return 0;
        if (x <= rangeStartLeft + rangeBorderWidth)
            return 1;
        const rangeEndLeft = end * rangeStep + rangeBorderWidth;
        if (x < rangeEndLeft)
            return 2;
        if (x <= rangeEndLeft + rangeBorderWidth)
            return 3;
        if (x < this.width)
            return 4;
        return undefined;
    }
    setPointerCursor(region) {
        switch (region) {
            case 1:
            case 3:
                {
                    this.style.cursor = 'ew-resize';
                    break;
                }
            case 2:
                {
                    this.style.cursor = this.isPointerAction ? 'grabbing' : 'grab';
                    break;
                }
            case 0:
            case 4:
                {
                    this.style.cursor = 'pointer';
                    break;
                }
            default: this.style.cursor = '';
        }
    }
    handlePointerDown(event) {
        if (event.button !== 0)
            return;
        const region = this.getRegionName(event.offsetX);
        this.currRegion = region;
        switch (region) {
            case undefined:
                this.isPointerAction = false;
                break;
            default:
                this.isPointerAction = true;
                this.pointerActionX = event.offsetX;
                this.pointerCaptureId = event.pointerId;
                this.setPointerCapture(event.pointerId);
        }
        this.setPointerCursor(region);
    }
    handlePointerUp(event) {
        if (event.button !== 0)
            return;
        if (this.isPointerAction) {
            this.releasePointerCapture(this.pointerCaptureId);
            this.isPointerAction = false;
        }
        const region = this.getRegionName(event.offsetX);
        this.setPointerCursor(region);
    }
    handlePointerMove(event) {
        if (this.isPointerAction) {
            const model = this.model;
            const x = event.offsetX;
            const rangeOffset = (x - this.pointerActionX) * this.rangePerPixel;
            this.pointerActionX = x;
            switch (this.currRegion) {
                case 1:
                    model.moveRangeStartBy(rangeOffset);
                    break;
                case 2:
                    model.moveRangeBy(rangeOffset);
                    break;
                case 3:
                    model.moveRangeEndBy(rangeOffset);
                    break;
            }
        }
        else {
            const region = this.getRegionName(event.offsetX);
            this.setPointerCursor(region);
        }
    }
    handlePointerEnter(event) {
        const region = this.getRegionName(event.offsetX);
        this.setPointerCursor(region);
    }
    handlePointerLeave() {
        this.style.cursor = '';
    }
}
export const TagName = 'chart-canvas';
customElements.define(TagName, ChartCanvasElement);
//# sourceMappingURL=ChartCanvasElement.js.map