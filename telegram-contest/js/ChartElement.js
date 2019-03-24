export class ChartElement {
    constructor(chart, width, height) {
        const root = document.createElement('div');
        root.style.position = 'relative';
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.border = 'solid black 1px';
        canvas.onpointerdown = this.handlePointerDown.bind(this);
        canvas.onpointermove = this.handlePointerMove.bind(this);
        this.canvas = canvas;
        this.canvasContext2D = canvas.getContext('2d');
        root.append(canvas);
        this.root = root;
    }
    handlePointerDown(event) {
        event.pointerId;
    }
    handlePointerMove(event) {
    }
}
//# sourceMappingURL=ChartElement.js.map