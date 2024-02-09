import {Form} from "./common/Form";
import {IOrderAddressForm} from "../types";
import {IEvents} from "./base/events";


export class OrderAddress<T> extends Form<IOrderAddressForm> {
    protected _paymentOnlineButton?: HTMLElement;
    protected _paymentOfflineButton?: HTMLElement;
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._paymentOnlineButton = this.container.querySelector('.online');
        this._paymentOfflineButton = this.container.querySelector('.offline');

        this._paymentOnlineButton.addEventListener('click', (e: Event) => {
            e.preventDefault();
            this._paymentOnlineButton.classList.add('button_alt-active');
            this._paymentOfflineButton.classList.remove('button_alt-active');
            this.onInputChange('payment', 'online');
        });

        this._paymentOfflineButton.addEventListener('click', (e: Event) => {
            e.preventDefault();
            this._paymentOfflineButton.classList.add('button_alt-active');
            this._paymentOnlineButton.classList.remove('button_alt-active');
            this.onInputChange('payment', 'offline');
        }); 

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            console.log(`orderAddress:submit`);
            this.events.emit(`orderAddress:submit`);
        });
    }

    protected onInputChange(field: keyof IOrderAddressForm, value: string) {
        this.events.emit('orderAddress:change', {
            field,
            value
        });
    }
}
