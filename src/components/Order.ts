import { Form } from './common/Form';
import { IOrder } from '../types';
import { IEvents } from './base/events';

export class Order<T> extends Form<IOrder> {
	private payCard: HTMLElement | null;
	private payCash: HTMLElement | null;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this.payCard = this.container.querySelector(
			'button[name="card"]'
		) as HTMLButtonElement;
		this.payCash = this.container.querySelector(
			'button[name="cash"]'
		) as HTMLButtonElement;

		this.payCash.addEventListener('click', (e: Event) =>
			this.handlePaymentClick(this.payCash, this.payCard, e)
		);
		this.payCard.addEventListener('click', (e: Event) =>
			this.handlePaymentClick(this.payCard, this.payCash, e)
		);
	}

	private handlePaymentClick(
		activeButton: HTMLElement,
		inactiveButton: HTMLElement,
		e: Event
	) {
		activeButton.classList.add('button_alt-active');
		inactiveButton.classList.remove('button_alt-active');

		const target = e.target as HTMLButtonElement;

		if (target) {
			const field = 'payment' as keyof IOrder;
			const value = target.name;
			this.onInputChange(field, value);
		}
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}
