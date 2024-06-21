import { ICardItem } from '../types';
import { Api, ApiListResponse } from './base/api';
import { IOrder, IOrderResult, FinalOrder } from '../types';

export interface IAppAPI {
	getProductList: () => Promise<ICardItem[]>;
	placeOrder: (order: IOrder) => Promise<IOrderResult>;
}

export class AppApi extends Api implements IAppAPI {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	placeOrder(finalOrder: FinalOrder): Promise<IOrderResult> {
		return this.post('/order', finalOrder).then((data: IOrderResult) => data);
	}

	getProductList(): Promise<ICardItem[]> {
		return this.get(`/product`).then((data: ApiListResponse<ICardItem>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}
}
