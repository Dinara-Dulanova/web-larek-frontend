import {Component} from "../base/Component";
import {ensureElement} from "../../utils/utils";
import {ISuccess, ISuccessActions} from "../../types"


export class Success extends Component<ISuccess> {
    protected _close: HTMLElement;
    protected _totalText: HTMLElement;

    constructor(container: HTMLElement, actions: ISuccessActions) {
        super(container);
        this._close = ensureElement<HTMLElement>('.order-success__close', this.container);
        this._totalText = ensureElement<HTMLElement>('.order-success__description', this.container);


        if (actions?.onClick) {
            this._close.addEventListener('click', actions.onClick);
        }
    }

    set totalText (value: string) {
        this.setText(this._totalText, `Списано ${value} синапсов`);
    }
}