export interface ICardItem {
   id: string;
   title: string;
   price: number | null;
   image: string;
   category: string;
   description: string;
   status: string;
   indexElement: number;
}

export interface FinalOrder extends IOrder {
  items: string[];
  total: number;
}

export interface IOrder {
  payment: string,
  email: string;
  address: string;
  phone: string;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
  baseUrl: string;
  get<T>(uri: string): Promise<T>;
  post<T>(uri: string, data: object, payment?: ApiPostMethods): Promise<T>;
}

export interface IPage {
  counter: number;
  catalog: HTMLElement[];
  locked: boolean;
}

export interface IOrderResult {
  id: string;
}