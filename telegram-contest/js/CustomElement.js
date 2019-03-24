export class CustomElement extends HTMLElement {
    constructor() {
        super(...arguments);
        this.isConnectedCallback = false;
    }
    connectedCallback() {
        this.isConnectedCallback = true;
    }
    disconnectedCallback() {
        this.isConnectedCallback = false;
    }
}
//# sourceMappingURL=CustomElement.js.map