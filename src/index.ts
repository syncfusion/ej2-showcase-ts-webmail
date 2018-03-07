/**
 *  Index page handler
 */
import { addRoute, parse } from 'crossroads';
import { Ajax } from '@syncfusion/ej2-base';
import * as hasher from 'hasher';

declare let window: IPages;
routeDefault();
addRoute('/home', () => {
    let ajaxHTML: Ajax = new Ajax('src/home/home.html', 'GET', true);
    ajaxHTML.send().then((value: Object): void => {
        document.getElementById('content-area').innerHTML = value.toString();
        window.home();
    });
});
hasher.initialized.add((h: string) => {
    parse(h);
});
hasher.changed.add((h: string) => {
    parse(h);
});
hasher.init();
function routeDefault(): void {
    addRoute('', () => {
        window.location.href = '#/home';
    });
}
export interface IPages extends Window {
    home: () => void;
    newmail: () => void;
    readingpane: () => void;
}