import {Form} from "./common/Form";
import {IOrderContactsForm} from "../types";
import {IEvents} from "./base/events";

export class OrderContacts extends Form<IOrderContactsForm> {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.events.emit(`orderContacts:submit`);
        });
    }

    protected onInputChange(field: keyof IOrderContactsForm, value: string) {
        this.events.emit('orderContacts:change', {
            field,
            value
        });
    }
}