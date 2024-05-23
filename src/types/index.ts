export interface IBasket {
  items: Map<string, number>;
  add(card: ICardItem): void;
  remove(id: string): void; 
  totalPrice(prices: number[]): number;
  /// реализовать геттер и сеттер, чтобы обеспечить доступ к элементам корзины и их изменение с помощью методов, 
  /// а не напрямую. Также можно добавить геттер для получения общего количества товаров в корзине.
} 

export interface ICardsList {
  setCards(cards: ICardItem[]): void;
}

export interface ICardItem {
   id: string;
   title: string;
   price: number;
   image: string;
   category: string;
   description: string;
}

export interface IUser {
  address: string;
  phone: string;
  email: string;
  payOnline: boolean;
  saveUserInfo(data: TOrder | TUserContacts): void;
}


export type TOrder = Pick<IUser, 'payOnline' | 'address'>;

export type TUserContacts = Pick<IUser, 'email' | 'phone'>;

export type TOrderConfirmation = Pick<IBasket, 'totalPrice'>;
