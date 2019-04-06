var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TagName = 'svg-animation';
    var SvgAnimation = (function (_super) {
        __extends(SvgAnimation, _super);
        function SvgAnimation() {
            return _super.call(this) || this;
        }
        SvgAnimation.prototype.connectedCallback = function () {
            console.dir(this.parentElement);
        };
        return SvgAnimation;
    }(SVGPolylineElement));
    exports.SvgAnimation = SvgAnimation;
    customElements.define(TagName, SvgAnimation);
});
//# sourceMappingURL=SvgAnimation.js.map