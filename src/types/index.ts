
export interface ILotItem { //заполнение данными дл карточки, полученными с сервера
    id: string;
    title: string;
    about: string;
    description?: string;
    image: string;
}

export interface IAppState {  // для класса appData, который хранит эти данные
    catalog: ILotItem[];  //карточки, которые отображаются для выбора
    basket: string[];   //карточки в корзине
    preview: string | null;  //отображение карточки 
    order: IOrder | null;  //карточки в заказе
}

export interface IOrderContactsForm { //интерфейс для формы с контактами
    email: string;
    phone: string;
}

export interface IOrderAddressForm extends IOrderContactsForm { //интерфейс для формы с адресом и методом оплаты
    payment: string;
    address: string;
}


export interface IOrder extends IOrderAddressForm { //интерфейс для полной информации о заказе для отправки на сервер (объединен с двумя выше)
    total: number;
    items: string[]
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;


export interface IOrderResult { //для добавления в итоговый заказ (нужны только id)
    id: string;
}

export interface IPage {     //интерфейс для страницы
    counter: number;         //количество товара (счетчик)
    catalog: HTMLElement[];  //каталог товаров
    locked: boolean;         //блокировка страницы
}

export interface IBasketView { //интерфейс для корзины
    items: HTMLElement[];      //список элементов корзины
    total: number;             //общая сумма товаров в корзине
    button: string[];          //кнопка для оформления заказа
}

export interface IFormState {  //интерфейс для класса form
    valid: boolean;            //поле для валидности формы
    errors: string[];          //поле для массива ошибок
}

export interface IModalData {   //интерфейс для класса modal
    content: HTMLElement;       //поле с переданным контентом, которое будет отображаться или очищаться
}

export interface ISuccess {     //интерфейс для класса Success
    totalText: string;          //поле для текста в случае успешной оплаты с количеством списанных синапсов
}

export interface ISuccessActions {    //интерфейс для класса Success
    onClick: () => void;              //обработчик клика
}

export interface IAuctionAPI {       //интерфейс для класса AuctionApi
    getLotList: () => Promise<ILotItem[]>;  //получение списка товаров
    getLotItem: (id: string) => Promise<ILotItem>;  //получение информации о товаре
    orderLots: (order: IOrder) => Promise<IOrderResult>;  //оформление заказа товаров
}

export interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard<T> {      //интерфейс для класса AuctionApi
    title: string;             
    description?: string | string[];
    image?: string;
    category?: string;
    price?: string;
    button?: boolean; 
    status: T;        //если статус tru, то карточка в basket
    index: number; 
}