import { Component } from './base/Component';
import { ICardItem } from '../types';
import { createElement } from '../utils/utils';

interface IBasketActions {
	onClick: (event: MouseEvent) => void;
}

export class BasketView extends Component<ICardItem> {
	private button: HTMLElement | null;
	private basketPrice: HTMLElement;
	private basketList: HTMLElement;

	constructor(container: HTMLElement, actions?: IBasketActions) {
		super(container);
		this.button = this.container.querySelector('.basket__button');
		this.basketPrice = this.container.querySelector('.basket__price');
		this.basketList = this.container.querySelector(
			'.basket__list'
		) as HTMLUListElement;

		if (actions?.onClick) {
			if (this.button) {
				this.button.addEventListener('click', actions.onClick);
			}
		}
	}

	items(items: HTMLElement[]): HTMLElement {
		if (items.length) {
			this.basketList.replaceChildren(...items);
		} else {
			this.basketList.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
		}
		return this.container;
	}

	set TotalPrice(price: number) {
		this.basketPrice.textContent = `${price} синапсов`;
		if (price === 0) {
			this.button.setAttribute('disabled', '');
		} else this.button.removeAttribute('disabled');
	}
}
