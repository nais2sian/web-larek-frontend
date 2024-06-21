import {Component} from "../base/Component";

interface ISuccess {
    total: number;
}

interface ISuccessActions {
    onClick: () => void;
}

export class Success extends Component<ISuccess> {
    protected _close: HTMLButtonElement;
    protected _total: HTMLElement;

    constructor(container: HTMLElement, actions: ISuccessActions) {
        super(container);

        this._total = this.container.querySelector('.order-success__description') as HTMLElement;
        this._close = this.container.querySelector('.order-success__close') as HTMLButtonElement;

        if (actions?.onClick) {
            this._close.addEventListener('click', actions.onClick);
        }
    }

    set total (price: number) {
        this._total.textContent = 'Списано ' + price.toString() + ' синапсов';
    }
}
