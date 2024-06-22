import { IEvents } from './base/events';
import { FormErrors, IOrder, ICardItem } from '../types';

export abstract class Model<T> {
	constructor(data: Partial<T>, protected events: IEvents) {
		Object.assign(this, data);
	}
	emitChanges(event: string, payload?: object) {
		this.events.emit(event, payload ?? {});
	}
}

export interface IAppState {
	catalog: ICardItem[];
	basket: string[];
	preview: string | null;
	order: string[] | null;
	loading: boolean;
}

export class AppState extends Model<IAppState> {
	protected basket: string[] = [];
	catalog: ICardItem[] = [];
	loading: boolean;
	preview: string | null;
	order: IOrder = {
		email: '',
		phone: '',
		payment: '',
		address: '',
	};
	orderErrors: FormErrors = {};
	contactsErrors: FormErrors = {};

	constructor(initialState: Partial<IAppState>, protected events: IEvents) {
		super(initialState, events);
	}

	setCatalog(items: ICardItem[]) {
		this.catalog = items.map((item) => ({
			...item,
			status: 'unselected',
		}));
		this.events.emit('items:changed', { catalog: this.catalog });
	}

	getSelectedCards(): ICardItem[] {
		if (!this.catalog) {
			throw new Error('Catalog is not initialized');
		}

		const selectedCards = this.catalog.filter(
			(card) => card.status === 'selected'
		);
		this.basket = selectedCards.map((card) => card.id);
		return selectedCards;
	}

	findCardById(id: string): ICardItem | undefined {
		return this.catalog.find((card) => card.id === id);
	}

	setPreview(item: ICardItem) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}

	updateProductStatus(id: string): string {
		const card = this.catalog.find((card) => card.id === id);
		return (card.status =
			card.status === 'unselected' ? 'selected' : 'unselected');
	}

	calculateTotalPrice(): number {
		const selectedCards = this.catalog.filter(
			(card) => card.status === 'selected'
		);
		return selectedCards.reduce((total, card) => total + (card.price || 0), 0);
	}

	setOrderField(field: keyof IOrder, value: string) {
		this.order[field] = value;
		this.validateOrder()
		this.validateContacts()
	}

	validateOrder(): boolean {
		const errors: typeof this.orderErrors = {};
		// Проверка адреса доставки
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес доставки';
		}
		// Проверка способа оплаты
		if (this.order.payment === '') {
			errors.payment = 'Необходимо выбрать способ оплаты';
		}
		this.orderErrors = errors;
		this.events.emit('orderErrors:change', this.orderErrors);
		return Object.keys(errors).length === 0;
	}

	validateContacts() {
		const errors: typeof this.contactsErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.contactsErrors = errors;
		this.events.emit('contactsErrors:change', this.contactsErrors);
		return Object.keys(errors).length === 0;
	}

	setBasket(selectedCards: ICardItem[]) {
		const filteredCards = selectedCards.filter((card) => card.price > 0);
		this.basket = filteredCards.map((card) => card.id);
	}

	clearBasket() {
		this.basket = [];
		this.catalog.forEach((card) => {
			if (card.status === 'selected') {
				card.status = 'unselected';
			}
		});
	}
	get mybasket() {
		return this.basket;
	}
}
