/**
 *  New Mail page handler
 */
import { IPages } from '../index';
import { Toolbar, ClickEventArgs } from '@syncfusion/ej2-navigations';
import { Button } from '@syncfusion/ej2-buttons';
import { DropDownList, MultiSelect, FilteringEventArgs } from '@syncfusion/ej2-dropdowns';
import { getContacts } from './datasource';
import { Query } from '@syncfusion/ej2-data';

declare let window: IPages;
let autoToList: MultiSelect = new MultiSelect();
let autoCCList: MultiSelect = new MultiSelect();
let toolbarHeader1: Toolbar = new Toolbar();
let toolbarMail: Toolbar = new Toolbar();
export let isNewWindow: boolean = true;
export let selectedToolbarItem: string = '';

window.newmail = (): void => {
    renderToolbar();
    createMailForm();
};

function createMailForm(): void {

    let toButton: Button = new Button();
    toButton.appendTo('#btnTo');
    let ccButton: Button = new Button();
    ccButton.appendTo('#btnCc');
    let sendButton: Button = new Button();
    sendButton.appendTo('#btnSend');
    let discardButton: Button = new Button();
    discardButton.appendTo('#btnDiscard');
    autoToList = new MultiSelect({
        dataSource: getContacts(), placeholder: '', width: 'calc(100% - 60px)',
        cssClass: 'ac-new-mail',
        fields: { text: 'MailId', value: 'MailId' },
        delimiterChar: ';',
        popupWidth: '300px',
        itemTemplate: '<div class="multiselect-template parent-div"><img class="contacts-item-image-style"' +
        'src="${Image}" alt="employee"/>' +
        '<div class="contacts-item-text-style"> <div> ${ContactName} </div> </div>' +
        '<div class="contacts-item-subtext-style"> ${MailId} </div>' +
        '</div>',
        valueTemplate: '<div>'
        + '<img class="contacts-value-img-style" src="${Image}" alt="employee"/>'
        + '<div class="contacts-value-text-style"> ${MailId} </div></div>',
        mode: 'Box',
        allowFiltering: true,
        filtering: (e: FilteringEventArgs) => {
            let query: Query = new Query();
            query = (e.text !== '') ? query.where('ContactName', 'startswith', e.text, true) : query;
            e.updateData(getContacts(), query);
        }
    });

    autoToList.appendTo('#autoTo');
    autoCCList = new MultiSelect({
        dataSource: getContacts(), placeholder: '', width: 'calc(100% - 60px)',
        cssClass: 'ac-new-mail',
        fields: { text: 'MailId', value: 'MailId' },
        popupWidth: '300px',
        itemTemplate: '<div class="multiselect-template parent-div"><img class="contacts-item-image-style"' +
        'src="${Image}" alt="employee"/>' +
        '<div class="contacts-item-text-style"> <div> ${ContactName} </div> </div>' +
        '<div class="contacts-item-subtext-style"> ${MailId} </div>' +
        '</div>',
        valueTemplate: '<div>'
        + '<img class="contacts-value-img-style" src="${Image}" alt="employee"/>'
        + '<div class="contacts-value-text-style"> ${MailId} </div></div>',
        mode: 'Box',
        allowFiltering: true,
        filtering: (e: FilteringEventArgs) => {
            let query: Query = new Query();
            query = (e.text !== '') ? query.where('ContactName', 'startswith', e.text, true) : query;
            e.updateData(getContacts(), query);
        }
    });
    autoCCList.appendTo('#autoCc');
    document.getElementById('txtSubject').onfocus = (e: Event) => {
        document.getElementsByClassName('mail-subject e-input-group')[0].classList.add('e-input-focus');
    };
    document.getElementById('txtSubject').onblur = (e: Event) => {
        document.getElementsByClassName('mail-subject e-input-group')[0].classList.remove('e-input-focus');
    };
    toolbarMail = new Toolbar({
        items: [
            { prefixIcon: 'ej-icon-Font tb-icons', tooltipText: 'Font' },
            { prefixIcon: 'ej-icon-Font-Size path2 tb-icons', tooltipText: 'Font Size' },
            { prefixIcon: 'ej-icon-Bold tb-icons', tooltipText: 'Bold' },
            { prefixIcon: 'ej-icon-Italic tb-icons', tooltipText: 'Italic' },
            { prefixIcon: 'ej-icon-Underlined tb-icons', tooltipText: 'Underline' },
            { prefixIcon: 'ej-icon-Highlight tb-icons', tooltipText: 'Highlight' },
            { prefixIcon: 'ej-icon-Font-Color-Icon tb-icons', tooltipText: 'Font color' },
            { prefixIcon: 'ej-icon-Bullets tb-icons', tooltipText: 'Bullets' },
            { prefixIcon: 'ej-icon-Numbering tb-icons', tooltipText: 'Numbering' },
            { prefixIcon: 'ej-icon-Decr-Indent tb-icons', tooltipText: 'Decrease Indent' },
            { prefixIcon: 'ej-icon-Incr-Indent tb-icons', tooltipText: 'Increase Indent' },
            { prefixIcon: 'ej-icon-Left-aligned tb-icons', tooltipText: 'Decrease Indent' },
            { prefixIcon: 'ej-icon-Centre-aligned tb-icons', tooltipText: 'Increase Indent' },
            { prefixIcon: 'ej-icon-Right-aligned tb-icons', tooltipText: 'Decrease Indent' },
            { prefixIcon: 'ej-icon-Hyperlink tb-icons', tooltipText: 'Hyperlink' }
        ],
        height: '100%',
        width: '100%',
        overflowMode: 'Popup'
    });
    toolbarMail.appendTo('#new_email_toolbar');
}

function renderToolbar(): void {
    let moreTemplate: string = '<input type="text" tabindex="1" id="moreList2" />';
    toolbarHeader1 = new Toolbar({
        items: [
            { prefixIcon: 'ej-icon-Send tb-icons', text: 'Send', tooltipText: 'Send' },
            { prefixIcon: 'ej-icon-Attach tb-icons', text: 'Attach', tooltipText: 'Attach' },
            { text: 'Discard' },
            { template: moreTemplate, cssClass: 'tb-item-more tb-item-more-mail', tooltipText: 'More actions' },
            {
                prefixIcon: 'ej-icon-Copy tb-icons', align: 'Right',
                tooltipText: 'Edit in a separate window', cssClass: 'tb-item-window-mail'
            },
            {
                prefixIcon: 'ej-icon-Close tb-icons', align: 'Right',
                tooltipText: 'Close', cssClass: 'tb-item-back-mail'
            },
        ],
        height: '100%'
    });
    toolbarHeader1.overflowMode = 'Popup';
    toolbarHeader1.appendTo('#toolbar_newmail');
    toolbarHeader1.clicked = toolbarNewMailClick;
    renderMoreList();
    toolbarHeader1.refreshOverflow();
}

function renderMoreList(): void {
    let themeList: { [key: string]: Object }[] = [
        { text: 'Save draft' }, { text: 'Show From' }, { text: 'Check Names' }, { text: 'Show message options' }
    ];
    let dropDownListObj: DropDownList = new DropDownList({
        dataSource: themeList,
        fields: { text: 'text' },
        valueTemplate: '<div class="tb-dropdowns" style ="font-size: 16px;margin-top: -2px;">' +
        '<span class="e-btn-icon e-icons ej-icon-More"></span></div>',
        popupHeight: '150px',
        popupWidth: '150px',
        value: 'Show From',
        width: '100%'
    });
    dropDownListObj.appendTo('#moreList2');
}

function toolbarNewMailClick(args: ClickEventArgs): void {
    if (args.item) {
        if (args.item.cssClass === 'tb-item-window-mail' || args.item.cssClass === 'tb-item-back-mail') {
            selectedToolbarItem = args.item.cssClass;
        } else if (args.item.text === 'Send' || args.item.text === 'Discard') {
            selectedToolbarItem = args.item.text;
        }
    }
}

export function resetSelectedToolbarItem(text: string): void {
    selectedToolbarItem = text;
}

function clearMailForm(): void {
    if (autoCCList.value) {
        autoCCList.value = [] as [string];
    }
    if (autoToList.value) {
        autoToList.value = [] as [string];
    }
    (document.getElementById('txtSubject') as HTMLInputElement).value = '';
    document.getElementById('mailContentMessage').innerHTML = '';
}

export function showMailDialog(option: string, selectedMessage: { [key: string]: Object }): void {
    clearMailForm();
    let key: string = '';
    toolbarHeader1.refreshOverflow();
    toolbarMail.refreshOverflow();
    if (selectedMessage) {
        if (option === 'Reply Tooltip') {
            key = 'Email';
            autoToList.value = [selectedMessage[key].toString()];
        } else {
            if (option !== 'New') {
                if (option !== 'Forward') {
                    if (option !== 'Reply') {
                        key = 'CCMail';
                        autoCCList.value = selectedMessage[key] as [string];
                    }
                    key = 'Email';
                    autoToList.value = [selectedMessage[key].toString()];
                }
                key = 'ContactTitle';
                (document.getElementById('txtSubject') as HTMLInputElement).value = selectedMessage[key].toString();
                key = 'Message';
                if (selectedMessage[key]) {
                    document.getElementById('mailContentMessage').innerHTML = selectedMessage[key].toString();
                } else {
                    document.getElementById('mailContentMessage').innerHTML =
                        decodeURI('%3Cdiv%20id=%22box%22%20style=%22padding:10px;%20border:%20none;%20height:%20auto;' +
                            '%22%20contenteditable=%22true%22%20data-gramm_id=%223898c552-c710-10db-69ec-08371185eb3f%22%20' +
                            'data-gramm=%22true%22%20spellcheck=%22false%22%20data-gramm_editor=%22true%22%3E%3Cp%20class=%22' +
                            'MsoNormal%22%3EDear%20Name,&nbsp;%3C/p%3E%0A%0A%3Cp%20class=%22MsoNormal%22%3EI%20really%20' +
                            'appreciate%20your%20understanding%20and%20support%20regarding%0Athe%20changes%20we\'re%20' +
                            'making%20to%20the%20project%20plan.&nbsp;%3C/p%3E%0A%0A%3Cp%20class=%22' +
                            'MsoNormal%22%3EThank%20you%20for%20your%20confidence%20in%20me.%20I\'m%20sure%20' +
                            'you\'re%20going%0Ato%20be%20pleased%20with%20the%20results.&nbsp;%3C/p%3E%0A%0A%3Cp%20class=%22' +
                            'MsoNormal%22%3EBest%20Regards,%3Cbr%3E%0AYour%20Name%3Co:p%3E%3C/o:p%3E%3C/p%3E%0A%0A%20%20%20%20%3C/div%3E');
                }
            }
        }
    }


}
