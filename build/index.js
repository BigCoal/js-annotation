import * as Util from "./util/index.js";
import config from "./lib/config.js";
class textSelector {
    constructor(ops) {
        var _a, _b;
        this._element = ops.el;
        this._selection = window.getSelection();
        if (this._element.nodeType !== 1) {
            throw new Error("请挂载dom节点");
        }
        if (!this._selection) {
            throw new Error("浏览器暂不支持标注，请查看文档支持浏览器版本");
        }
        config.isCover = (_b = (_a = ops === null || ops === void 0 ? void 0 : ops.options) === null || _a === void 0 ? void 0 : _a.isCover) !== null && _b !== void 0 ? _b : config.isCover;
        this._onMouseUp = null;
        this._onClick = null;
        this._onSelected = null;
        this.onSelected = null;
        this.onClick = null;
        this._initEvent();
        this._addEvent();
    }
    _initEvent() {
        let that = this;
        that._onMouseUp = function (e) {
            that._captureSelection(undefined, e);
        };
        that._onClick = function (e) {
            if (e.target !== null && "dataset" in e.target) {
                let selector = e.target.dataset.selector;
                if (selector) {
                    let doms = document.querySelectorAll(`span[data-selector="${selector}"]`);
                    that.onClick && that.onClick(doms);
                }
            }
        };
        that._onSelected = function (e) {
            this.onSelected &&
                this.onSelected({
                    code: typeof e === "string" ? -1 : 1,
                    data: e,
                });
            if (typeof e === "string") {
                console.error(e);
            }
        };
    }
    _addEvent() {
        this._element.addEventListener("mouseup", this._onMouseUp);
    }
    _destroyEvent() {
        this._element.removeEventListener("mouseup", this._onMouseUp);
    }
    renderStore(obj) {
        obj.map((item) => {
            let startParentNode = Util.relativeNode(this._element, item.offset + 1);
            let endParentNode = Util.relativeNode(this._element, item.offset + item.text.length);
            if (endParentNode && startParentNode) {
                this._captureSelection({
                    collapsed: false,
                    commonAncestorContainer: this._element,
                    endContainer: endParentNode,
                    endOffset: item.offset +
                        item.text.length -
                        Util.relativeOffset(endParentNode, this._element),
                    startContainer: startParentNode,
                    startOffset: item.offset - Util.relativeOffset(startParentNode, this._element),
                    other: item,
                });
            }
        });
    }
    findWord(word) {
        return Util.relativeOffsetChat(word, this._element);
    }
    _captureSelection(rangeNode, e) {
        let selection = this._selection;
        if (selection == null)
            return;
        let range = rangeNode || selection.getRangeAt(0);
        if (range.collapsed) {
            this._onClick && this._onClick(e);
            return;
        }
        let r = {
            startContainer: range.startContainer,
            endContainer: range.endContainer,
            startOffset: range.startOffset,
            endOffset: range.endOffset,
        };
        if (!config.isCover &&
            (r.startContainer.parentNode.dataset
                .selector ||
                r.endContainer.parentNode.dataset.selector)) {
            selection.removeAllRanges();
            return this._onSelected && this._onSelected("不允许覆盖标注，详细请看配置文档，或设置isCover为true");
        }
        if (r.startContainer !== r.endContainer) {
            selection.removeAllRanges();
            let endContainer = r.endContainer.splitText(r.endOffset);
            r.endContainer = endContainer.previousSibling;
            r.startContainer = r.startContainer.splitText(r.startOffset);
        }
        else {
            let endContainer = r.endContainer.splitText(r.endOffset);
            r.startContainer = r.startContainer.splitText(r.startOffset);
            r.endContainer = endContainer.previousSibling;
        }
        let textNodes = Util.getTextNodes(range.commonAncestorContainer);
        const offset = Util.relativeOffset(r.startContainer, this._element);
        let rangeNodes = this.getSelectTextNode(textNodes, r);
        let text = "";
        for (let i = 0; i < rangeNodes.length; i++) {
            const e = rangeNodes[i];
            text += e.nodeValue;
        }
        let firstRender = true;
        if (!rangeNode) {
            firstRender = false;
            selection.removeAllRanges();
        }
        this._onSelected &&
            this._onSelected({
                nodes: rangeNodes,
                other: rangeNode && rangeNode.other ? rangeNode.other : {},
                text,
                offset,
                firstRender,
            });
    }
    getSelectTextNode(textNodes, range) {
        let startIndex = textNodes.indexOf(range.startContainer);
        let endIndex = textNodes.indexOf(range.endContainer);
        let rangeText = textNodes.filter((item, i) => {
            return startIndex <= i && endIndex >= i;
        });
        return rangeText;
    }
    repaintRange(eleArr, uuid, cssClass) {
        let uid = uuid || Util.Guid();
        eleArr.forEach((node) => {
            if (node.parentNode) {
                let hl = document.createElement("span");
                hl.className = cssClass;
                hl.setAttribute("data-selector", uid);
                node.parentNode.replaceChild(hl, node);
                hl.appendChild(node);
            }
        });
        return uuid;
    }
    clearRange(uuid) {
        let eleArr = document.querySelectorAll(`span[data-selector="${uuid}"]`);
        eleArr.forEach((node) => {
            if (node.parentNode) {
                const fragment = document.createDocumentFragment();
                let childNodes = node.childNodes;
                for (let i = 0; i < childNodes.length; i++) {
                    const node = childNodes[i];
                    fragment.appendChild(node.cloneNode(true));
                }
                node.parentNode.replaceChild(fragment, node);
            }
        });
    }
}
export default textSelector;
