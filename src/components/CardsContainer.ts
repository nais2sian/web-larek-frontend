export abstract class Component<T> {
  constructor(protected readonly container: HTMLElement) {

  }

  render(data?: Partial<T>): HTMLElement {
      Object.assign(this as object, data ?? {});
      return this.container;
  }
}

interface ICardsContainer {
    catalog: HTMLElement[];
}

export class CardsContainer extends Component<ICardsContainer> {
    protected _catalog: HTMLElement;
    

    constructor(protected container: HTMLElement) {
        super(container)
    }

    set catalog(items: HTMLElement[]) {
        this.container.replaceChildren(...items);
    }
}