import './scss/styles.scss';
import {EventEmitter} from "./components/base/events";
import {AuctionAPI} from "./components/AuctionAPI";
import {API_URL, CDN_URL} from "./utils/constants";
import {AppState, CatalogChangeEvent, LotItem} from "./components/AppData";
import {Card, CardBasket, CardPreview} from "./components/Card";
import {cloneTemplate, createElement, ensureElement} from "./utils/utils";
import {Modal} from "./components/common/Modal";
import {Page} from "./components/Page";
import {Basket} from "./components/common/Basket";
import {OrderAddress} from "./components/OrderAddress";
import {OrderContacts} from "./components/OrderContacts";
import {IOrderContactsForm, IOrderAddressForm} from "./types";
import {Success} from "./components/common/Success";


const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderAddressTemplate = ensureElement<HTMLTemplateElement>('#order');
const orderContactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');



export const events = new EventEmitter();
const api = new AuctionAPI(CDN_URL, API_URL);

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basket = new Basket(cloneTemplate(basketTemplate), events);
const orderContactsForm = new OrderContacts(cloneTemplate(orderContactsTemplate), events);
const orderAddressForm = new OrderAddress(cloneTemplate(orderAddressTemplate), events);


// Первоначальная отрисовка карточек
events.on<CatalogChangeEvent>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new CardPreview('card', cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            category: item.category,
            title: item.title,
            image: item.image,
            price: item.price !== null ? item.price + " синапсов" : "Бесценно",
        });
    });

});


// Открыть лот
events.on('card:select', (item: LotItem) => {
  //  console.log(item);
    appData.setPreview(item);
});

// Изменилось одно из полей формы с адресом
events.on('orderAddress:change', (data: { field: keyof IOrderAddressForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
    orderAddressForm.valid = appData.validateOrderAddress();
});

// Изменилось одно из полей формы с контактами
events.on('orderContacts:change', (data: { field: keyof IOrderContactsForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
    orderContactsForm.valid = appData.validateOrderContacts();
});

// нажали на кнопку в форме с адресом и открыли модалку с формой контактов
events.on('orderAddress:submit', () => {
  events.emit('orderContacts:open')
});

// нажали на кнопку в форме с контактами и открыли модалку с формой об успешном оформлении
events.on('orderContacts:submit', () => {
    //events.emit('orderContacts:open')
 });



events.on('orderContacts:open', () => {
    modal.render({
        content: orderContactsForm.render({
            email: '',
            phone: '',
            valid: false,
            errors: []
        })
    });
});

events.on('orderAddress:open', () => {
    modal.render({
        content: orderAddressForm.render({
            payment: 'offline', // значение по умолчанию
            address: '',
            valid: false,
            errors: []
        })
    });
});

//проверка ошибок в форме с контактами
events.on('orderContactsForm:change', (errors: Partial<IOrderContactsForm>) => {
    const { email, phone } = errors;
    orderContactsForm.valid = !email && !phone;
    orderContactsForm.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
});

//проверка ошибок в форме с адресом
events.on('orderAddressForm:change', (errors: Partial<IOrderAddressForm>) => {
    const { payment, address } = errors;
    orderAddressForm.valid = !payment && !address;
    orderAddressForm.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
});


  events.on('card: addedToBusket', (item: LotItem) => { //тут меняем статус на тру, так как карточку добавили в корзину
    item.status = true;
    appData.addToOrder(item.id); //сохраняем id заказа в order
    events.emit('basket: render');
    //basket.total = appData.getTotal();
  });

events.on('card: deletedFromBusket', (item: LotItem) => { //тут меняем статус на фолс, так как карточку удалили из корзины
    item.status = false;
    appData.deleteFromOrder(item.id);
    events.emit('basket: render');
});

events.on('basket: render', () =>  { //тут отрисовываем корзину и ее карточки
    page.counter = appData.getActiveLots().length; //меняем цифру у корзины на главной странице
    basket.items = appData.getActiveLots().map((item, index) => {
        const card = new CardBasket('card',cloneTemplate(cardBasketTemplate), {
            onClick: ()=> {
                events.emit('card: deletedFromBusket', item);
            }
        });
        return card.render({
            title: item.title,
            price: item.price !== null ? item.price + " синапсов" : "Бесценно",
            index: index +1,
        });
    });
    basket.button = appData.order.items;
    basket.total = appData.getTotal();
})


events.on('basket: rerender', () =>  {
    appData.getActiveLots().map((item, index) => {
        item.status = false;
        basket.items = appData.getActiveLots().map((item, index) => {
            const card = new CardBasket('card',cloneTemplate(cardBasketTemplate));
            return card.render({
                title: '',
                price: null,
                index: 0,
            });
        });
    })
    page.counter = appData.getActiveLots().length; //меняем цифру у корзины на главной странице
    basket.total = appData.getTotal();
})

// Изменен открытый выбранный лот
events.on('preview:changed', (item: LotItem) => {
    console.log("preview:changed");
    const showItem = (item: LotItem) => {
        console.log(item);
        const card = new CardPreview('card',cloneTemplate(cardPreviewTemplate), {
            onClick: () => {
                if (!item.status) {
                    events.emit('card: addedToBusket', item);
                } else {
                    events.emit('card: deletedFromBusket', item);
                }
                events.emit('preview:changed', item); //чтобы карточка сразу перерисовалась 
            }
        });
        modal.render({
            content: card.render({
                category: item.category,
                title: item.title,
                image: item.image,
                price: item.price !== null ? item.price + " синапсов" : "Бесценно",
                description: item.description,
                button: item.status,
            })
        });

    };

    if (item) {
        api.getLotItem(item.id)
            .then((result) => {
                item.description = result.description;
                showItem(item);
            })
            .catch((err) => {
                console.error(err);
            })
    } else {
        modal.close();
    }

});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// и разблокируем
events.on('modal:close', () => {
    page.locked = false;
});
/*
events.on('basket:open', () => {
    modal.render({
        content: createElement<HTMLElement>('div', {}, [
            basket.render({
                selected: 'closed'
            }),
        ])
    });
});*/


events.on('basket:open', () => {
    modal.render({
        content: createElement<HTMLElement>('div', {}, [
            basket.render({
                button: appData.order.items
            })
        ])
    });
}); 

// Отправлена форма заказа (после отправки формы с контактами)
events.on('orderContacts:submit', () => {
    console.log('appData.order' + appData.order),
    console.log('uspeh');
    console.log(appData.getTotal()); 
    console.log(appData.order.items); 
    appData.order.total = appData.getTotal();
    api.orderLots(appData.order)
        .then((result) => {
            const success = new Success(cloneTemplate(successTemplate), {
                onClick: () => {
                    modal.close();
                    appData.clearOrder();
                    events.emit('basket: rerender'); //очистить баскет

                }
            });

            modal.render({ //торисовываем модалку успеха
                content: success.render({
                    totalText: appData.getTotal().toString(),  //и пишем, сколько списано
                })
            });
        })
        .catch(err => {
            console.error(err);
        });

});


// Получаем лоты с сервера
let products = api.getLotList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });

console.log(products);


