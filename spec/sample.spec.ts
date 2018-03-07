/**
 * Sample spec
 */
import { Ajax } from '@syncfusion/ej2-base';
import '../node_modules/es6-promise/dist/es6-promise';

interface MyWindow extends Window {
    customError: any;
    navigateSample: any;
}

declare let window: MyWindow;

describe('Showcase sample', (): void => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    beforeAll((done: Function) => {
        let ajax: Ajax = new Ajax('../base/index.html', 'GET', true);
        ajax.send().then((value: Object): void => {
            document.body.innerHTML = document.body.innerHTML + value.toString();
            require(
                ['../dist/common'],
                (): void => {
                    done();
                });
        });
    });
    describe('testing -', () => {

        beforeEach(() => {
            window.customError = (): boolean => {
                return false;
            };
            spyOn(window, 'customError');
            window.addEventListener('error', window.customError);
        });

        afterEach(() => {
            window.customError.calls.reset();
        });
        it('Initial rendering console error testing', (done: Function) => {
            expect(window.customError).not.toHaveBeenCalled();
            done();
        });
    });
});