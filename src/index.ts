import './scss/styles.scss';
import { AppApi } from './components/AppApi';
import { ICardItem, IOrder} from './types/index';
import { ViewItem } from './components/ViewItem';
import { EventEmitter } from './components/base/events';
import { CardsContainer } from './components/CardsContainer';
import { cloneTemplate, ensureElement } from './utils/utils';
import { API_URL, CDN_URL } from './utils/constants';
import { Success } from './components/common/Success';
import { Modal } from './components/common/Modal';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { BasketView } from './components/BasketView';
import { Page } from './components/Page';
import { AppState } from './components/DataModel';

const events = new EventEmitter();
const api = new AppApi(CDN_URL, API_URL);
const page = new Page(document.body, events);
const cardsContainer = new CardsContainer(
	ensureElement('.gallery') as HTMLElement
);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const appData = new AppState({}, events);

/// ПОЛУЧАЕМ МАССИВ ТОВАРОВ С СЕРВЕРА
api
	.getProductList()
	.then((productList) => {
		appData.setCatalog(productList);
	})
	.catch((err) => {
		console.error(err);
	});

/// ВЫВОДИМ НА ЭКРАН СПИСОК ТОВАРОВ
const template = ensureElement('#card-catalog') as HTMLTemplateElement;
events.on('items:changed', () => {
	const cardsArray = appData.catalog.map((card) => {
		const item: ViewItem = new ViewItem(cloneTemplate(template), {
			onClick: () => events.emit('card:select', item),
		});
		return item.render({
			category: card.category,
			title: card.title,
			image: card.image,
			price: card.price,
			id: card.id,
		});
	});
	cardsContainer.render({ catalog: cardsArray });
});

/// ОТКРЫВАЕМ МОДАЛКУ С ПРЕВЬЮХОЙ
const previewTemplate = ensureElement('#card-preview') as HTMLTemplateElement;
events.on('card:select', (event: { id: string }) => {
	const id = event.id;
	const card = appData.findCardById(id);
	const preview = new ViewItem(cloneTemplate(previewTemplate), {
		onClick: () => events.emit('status:chenged', card),
	});
	modal.render({
		content: preview.render({
			category: card.category,
			title: card.title,
			image: card.image,
			price: card.price,
			description: card.description,
			id: card.id,
			status: card.status,
		}),
	});
});

/// МЕНЯЕМ СТАТУС ТОВАРА, МЕНЯЕМ КНОПКУ И ПОКАЗЫВАЕМ КОЛИЧЕСТВО ТОВАРОВ В КОРЗИНЕ
const basketCounter = ensureElement('.header__basket-counter');
events.on('status:chenged', (card: ICardItem) => {
	appData.updateProductStatus(card.id);
	appData.setBasket(appData.getSelectedCards());
	basketCounter.textContent = appData.getSelectedCards().length.toString();
	const preview = new ViewItem(cloneTemplate(previewTemplate), {
		onClick: () => events.emit('status:chenged', card),
	});
	modal.render({
		content: preview.render({
			category: card.category,
			title: card.title,
			image: card.image,
			price: card.price,
			description: card.description,
			id: card.id,
			status: card.status,
		}),
	});
});

/// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});
/// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});

/// ОТКРЫВАЕМ МОДАЛКУ С КОРЗИНОЙ ТОВАРОВ
const basketButton = ensureElement('.header__basket');
const cardBasket = ensureElement(
	'#card-basket'
) as HTMLTemplateElement;
const basketTemplate = ensureElement('#basket') as HTMLTemplateElement;
const cloneBasketTemplate = basketTemplate.content.cloneNode(
	true
) as HTMLElement;
const basketElement = cloneBasketTemplate.querySelector(
	'.basket'
) as HTMLElement;

const basket = new BasketView(basketElement, {
		onClick: () => events.emit('order:open'),
	});
basketButton.addEventListener('click', () => {
	events.emit('basket:select');
});
events.on('basket:select', () => {
	const selectedCards = appData.getSelectedCards();
	const cardsList: HTMLElement[] = selectedCards.map((card, index) => {
		const basketCard = new ViewItem(cloneTemplate(cardBasket), {
			onClick: () => events.emit('card:delete', card),
		});
		return basketCard.render({
			title: card.title,
			price: card.price,
			id: card.id,
			status: card.status,
			indexElement: index,
		});
	});
	modal.render({
		content: basket.items(cardsList),
	});
	basket.TotalPrice = appData.calculateTotalPrice();
	appData.setBasket(selectedCards);
});

/// УДАЛЯЕМ КАРТОЧКУ ИЗ КОРЗИНЫ И ПОКАЗЫВАЕМ КОЛИЧЕСТВО ТОВАРОВ В КОРЗИНЕ
events.on('card:delete', (event: { id: string }) => {
	const id = event.id;
	appData.updateProductStatus(id);
	events.emit('basket:select');
	basketCounter.textContent = appData.getSelectedCards().length.toString();
});

/// РАБОТА С ФОРМАМИ
const orderTemplate = ensureElement('#order') as HTMLTemplateElement;
const cloneOrder = orderTemplate.content.cloneNode(true) as HTMLElement;
const orderForm = cloneOrder.querySelector(
	'form[name="order"]'
) as HTMLFormElement;
const order = new Order(orderForm, events);
events.on('order:open', () => {
	modal.render({
		content: order.render({
			address: '',
			payment: '',
			valid: false,
			errors: [],
		}),
	});
});
const contactsTemplate = ensureElement(
	'#contacts'
) as HTMLTemplateElement;
const cloneCont = contactsTemplate.content.cloneNode(true) as HTMLElement;
const contactsForm = cloneCont.querySelector(
	'form[name="contacts"]'
) as HTMLFormElement;
const contactsInfo = new Contacts(contactsForm, events);

events.on('order:submit', () => {
	modal.render({
		content: contactsInfo.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
});

/// Изменилось состояние валидации формы
events.on('orderErrors:change', (errors: Partial<IOrder>) => {
	const { address, payment } = errors;
	order.valid = !address && !payment;
	order.errors = Object.values({ address, payment }).filter(i => !!i).join('; ');
});
events.on('contactsErrors:change', (errors: Partial<IOrder>) => {
	const { email, phone } = errors;
	contactsInfo.valid = !email && !phone;
	contactsInfo.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

/// Изменилось одно из полей
events.on('order:input', 
	(data: { field: keyof IOrder; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);
events.on('contacts:input', 
	(data: { field: keyof IOrder; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

/// Отправлена форма заказа
const successTemplate = ensureElement(
	'#success'
) as HTMLTemplateElement;
const success = new Success(cloneTemplate(successTemplate), {
	onClick: () => {
		modal.close();
	},
});
events.on('contacts:submit', () => {
	const items = appData.mybasket;
	const total = appData.calculateTotalPrice();
	const finalOrder = {
		...appData.order,
		items,
		total,
	};
	api
		.placeOrder(finalOrder)
		.then((result) => {
			appData.clearBasket();
			modal.render({
				content: success.render({
					total: total
				})
			});
			basketCounter.textContent = appData.mybasket.length.toString();
		})
		.catch((err) => {
			console.error(err);
		});
});
