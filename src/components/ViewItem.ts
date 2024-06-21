import { Component } from './base/Component';
import { ICardItem } from '../types';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export class ViewItem extends Component<ICardItem> {
	protected _category?: HTMLElement;
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _price: HTMLElement;
	protected _itemPrice: number;
	protected _description?: HTMLElement | null;
	protected _cardId?: string;
	protected _status?: string;
	protected _button?: HTMLButtonElement;
	protected _indexElement?: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._indexElement = this.container.querySelector('.basket__item-index');
		this._category = this.container.querySelector('.card__category');
		this._title = this.container.querySelector('.card__title');
		this._image = this.container.querySelector(
			'.card__image'
		) as HTMLImageElement;
		this._price = this.container.querySelector('.card__price');
		this._description = this.container.querySelector('.card__text');
		this._button = this.container.querySelector('.card__button');

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	render(data: Partial<ICardItem>): HTMLElement {
		Object.assign(this as object, data ?? {});
		return this.container;
	}

	set _id(id: string) {
		this._cardId = id;
	}

	get _id() {
		return this._cardId;
	}

	set title(title: string) {
		this._title.textContent = title;
	}

	set image(image: string) {
		this._image.src = image;
	}

	set category(category: string) {
		this._category.textContent = category;
	}

	set price(price: string) {
		this._price.textContent =
			price !== null ? price.toString() + ' синапсов' : 'Бесценно';
	}

	set description(description: string) {
		this._description.textContent = description;
	}

	set status(status: string) {
		this._status = status;
		if (this.container.classList.contains('card_full')) {
			this._button.textContent =
				status === 'unselected' ? 'В корзину' : 'Убрать';
		}
	}
  
	set indexElement(index: number) {
		this._indexElement.textContent = `${index + 1}`;
	}
}
