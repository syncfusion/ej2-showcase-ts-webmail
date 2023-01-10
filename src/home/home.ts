/**mboboxmbobox
 *  Home page handler
 */
import { IPages } from '../index';
import {
    Sidebar, AppBar, TreeView, Toolbar, Accordion, ContextMenu, MenuItemModel, ContextMenuModel, ClickEventArgs,
    NodeSelectEventArgs, MenuEventArgs, BeforeOpenCloseMenuEventArgs
} from '@syncfusion/ej2-navigations';
import { ListView, SelectEventArgs, SortOrder } from '@syncfusion/ej2-lists';
import { Button } from '@syncfusion/ej2-buttons';
import { AutoComplete, DropDownList, ChangeEventArgs, SelectEventArgs as DropDownSelectEventArgs } from '@syncfusion/ej2-dropdowns';
import { Dialog, Popup } from '@syncfusion/ej2-popups';
import { Ajax } from '@syncfusion/ej2-base';
import { Splitter } from '@syncfusion/ej2-layouts';
import { folderData, messageDataSourceNew, getContacts, userName, userMail } from './datasource';
import { showMailDialog, selectedToolbarItem, resetSelectedToolbarItem } from './newmail';
import { selectedRPToolbarItem, resetRPSelectedItem, bindReadingPaneData, ddlLastRplyValueRP,
    dropdownSelectRP, showMailDialogRP } from './readingpane';

declare let window: IPages;

export let grpListObj: ListView = new ListView();
export let messageDataSource: { [key: string]: Object }[] = null;
export let dlgSentMail: Dialog = new Dialog();
export let dlgSentMailNew: Dialog = new Dialog();
export let dlgDiscard: Dialog = new Dialog();
export let dlgDiscardNew: Dialog = new Dialog();
export let dlgNewWindow: Dialog = new Dialog();
export let dlgReplyAllWindow: Dialog = new Dialog();
let dlgFavorite: Dialog = new Dialog();
let ddlReplyAll: DropDownList = new DropDownList();
let dlgDelete: Dialog = new Dialog();
let dropdownSelect: boolean = false;
let acrdnObj: Accordion = new Accordion();
let treeObj: TreeView = new TreeView();
let toolbarHeader: Toolbar = new Toolbar();
let toolbarMobile: Toolbar = new Toolbar();
let defaultSidebar: Sidebar;
let splitObj: Splitter;
  // tslint:disable-next-line:no-any
let treeContextMenu: any = new ContextMenu();
  // tslint:disable-next-line:no-any
let filterContextMenu: any = new ContextMenu();
let selectedListElement: HTMLElement = null;
let acSearchMobile: AutoComplete = new AutoComplete();
let popup1: Popup;
let treeviewSelectedData: { [key: string]: Object } = null;
let treeSelectedElement: HTMLElement = null;
let selectedFolderName: string = '';
let treeDataSource: { [key: string]: Object }[] = [];
let isMenuClick: boolean = false;
let isItemClick: boolean = false;
let lastIndex: number = 31;
let hoverOnPopup: boolean = false;
let isNewMailClick: boolean = false;
window.home = (): void => {

    let contentWrapper: HTMLElement = document.getElementsByClassName('content-wrapper')[0] as HTMLElement;
    contentWrapper.onclick = hideSideBar;

    let overlayElement: HTMLElement = document.getElementsByClassName('overlay-element')[0] as HTMLElement;
    overlayElement.onclick = hideSideBar;

    window.onresize = onWindowResize;
    window.onload = onWindowResize;
    document.onclick = documentClick;
    document.ondblclick = documentDoubleClick;

    renderMainSection();
    renderToolbarMobile();
    renderSearchSection();
    createHeader();
    updateLoginDetails();
    renderFilterContextMenu();
    renderMailDialogs();
    treeObj.selectedNodes = ['8'];
    let popupContent: HTMLElement = document.getElementById('popupContent');
    popupContent.onclick = popupContentClick;

    let ajaxHTML: Ajax = new Ajax('src/home/newmail.html', 'GET', true);
    ajaxHTML.send().then((value: Object): void => {
        document.getElementById('newmailContent').innerHTML = value.toString();
        window.newmail();
        document.getElementById('btnSend').onclick = sendClick;
        document.getElementById('btnDiscard').onclick = discardButtonClick;
    });

    ajaxHTML = new Ajax('src/home/readingpane.html', 'GET', true);
    ajaxHTML.send().then((value: Object): void => {
        document.getElementById('reading-pane-popup').innerHTML = value.toString();
        window.readingpane();
    });
    let appObject: AppBar = new AppBar({
        colorMode: 'Dark'
    })
    appObject.appendTo("#appbar");
    defaultSidebar = new Sidebar({
        width: "280px",
        type: "Push",
        enablePersistence: true,
        enableGestures:false
    });
    defaultSidebar.appendTo('#sideBar');
};

function renderMainSection(): void {
    treeDataSource = folderData;
    treeObj = new TreeView({
        fields: { dataSource: treeDataSource, id: 'ID', text: 'Name', parentID: 'PID', hasChildren: 'HasChild', expanded: 'Expanded' },
        nodeTemplate: '<div class="treeviewdiv">' +
        '<div style="float:left">' +
        '<span class="treeName">${Name}</span>' +
        '</div>' +
        '<div class="count" style="margin-left: 5px; float:right">' +
        '<span class="treeCount ${Name}" >${Count}</span>' +
        '</div>' +
        '<button title="${FavoriteMessage}" class="treeview-btn-temp">' +
        '<span class="e-btn-icon ej-icon-${Favorite} ${Name}"></span>' +
        '</button>' +
        '</div>',
        nodeSelected: nodeSelected,
    });
    treeObj.appendTo('#tree');
    messageDataSource = messageDataSourceNew;
    messageDataSource = sortList(messageDataSource);

    grpListObj = new ListView({
        dataSource: messageDataSource,
        template: getListTemplate(),
        fields: { id: 'ContactID', text: 'text' },
        sortOrder: 'None'
    });
    grpListObj.select = select;
    grpListObj.appendTo('#listview-grp');
    acrdnObj.appendTo('#accordian');
    let replyTemplate: string = '<input type="text" tabindex="1" id="replyAllList" />';
    let movetoTemplate: string = '<input type="text" tabindex="1" id="moveToList" />';
    let categoryTemplate: string = '<input type="text" tabindex="1" id="categoryList" />';
    let moreTemplate: string = '<input type="text" tabindex="1" id="moreList" />';
    toolbarHeader = new Toolbar({
        items: [
            {
                prefixIcon: 'ej-icon-New tb-icons', text: 'New', tooltipText: 'Write a new message',
                cssClass: 'tb-item-new-mail'
            },
            {
                prefixIcon: 'ej-icon-Mark-as-read tb-icons', text: 'Mark all as read', tooltipText: 'Mark all as read',
                cssClass: 'tb-item-mark-read'
            },
            {
                prefixIcon: 'ej-icon-Reply-All tb-icons', template: replyTemplate,
                cssClass: 'tb-item-Selected tb-item-replyAll', tooltipText: 'Reply All'
            },
            {
                prefixIcon: 'ej-icon-Delete tb-icons', text: 'Delete',
                cssClass: 'tb-item-Selected', tooltipText: 'Delete'
            },
            {
                text: 'Junk', cssClass: 'tb-item-Selected',
                tooltipText: 'Mark the sender as unsafe and delete the message'
            },
            { template: movetoTemplate, cssClass: 'tb-item-Selected', tooltipText: 'Move To' },
            { template: categoryTemplate, cssClass: 'tb-item-Selected', tooltipText: 'Add Categories to message' },
            { template: moreTemplate, cssClass: 'tb-item-more tb-item-Selected', tooltipText: 'More actions' },
            {
                prefixIcon: 'ej-icon-Copy tb-icons', align: 'Right',
                tooltipText: 'Open in a separate window', cssClass: 'tb-item-Selected'
            },
        ],
        width: '100%',
        height: '100%'
    });
    toolbarHeader.overflowMode = 'Popup';
    toolbarHeader.appendTo('#toolbar_align');
    toolbarHeader.clicked = toolbarClick;
    renderTreeContextMenu();
    renderMoveToList();
    renderCategoryList();
    renderMoreList();
    renderReplyAllList();
}

function renderMoveToList(): void {
    let themeList: { [key: string]: Object }[] = [
        { text: 'Inbox' }, { text: 'Sent Items' }, { text: 'Clutter' }, { text: 'Drafts' },
        { text: 'Deleted Items' }, { text: 'Archive' }, { text: 'Junk Mail' }, { text: 'Outbox' },
        { text: 'Personnel' }, { text: 'Sales Reports' }, { text: 'Marketing Reports' },
        { text: 'Richelle Mead' }, { text: 'krystine hobson' }
    ];
    let dropDownListObj: DropDownList = new DropDownList({
        dataSource: themeList,
        fields: { text: 'text', value: 'text' },
        valueTemplate: '<div class="tb-dropdowns"> Move to </div>',
        popupHeight: '310px',
        popupWidth: '150px',
        value: 'Inbox',
        width: '80px',
        select: moveToSelect,
        allowFiltering: true
    });
    dropDownListObj.appendTo('#moveToList');
}

function renderReplyAllList(): void {
    let themeList: { [key: string]: Object }[] = [
        { text: 'Reply' }, { text: 'Reply All' }, { text: 'Forward' }
    ];
    ddlReplyAll = new DropDownList({
        dataSource: themeList,
        fields: { text: 'text' },
        valueTemplate: '<div>' +
        '<div style="float:left;margin-top: 1px;">' +
        '<span style="font-weight:bold;" class="e-btn-icon ej-icon-Reply-All tb-icons e-icons tb-icon-rply-all">' +
        '</span>' +
        '</div>' +
        '<div class="tb-dropdowns" style="float:left" > Reply All </div>' +
        '<div>',
        popupHeight: '150px',
        popupWidth: '150px',
        width: '115px',
        change: replyAllSelect,
        value: 'Reply All'
    });
    ddlReplyAll.appendTo('#replyAllList');
}

function renderCategoryList(): void {
    let themeList: { [key: string]: Object }[] = [
        { text: 'Blue category', color: 'blue' }, { text: 'Red category', color: 'red' },
        { text: 'Orange category', color: 'orange' }, { text: 'Purple category', color: 'purple' },
        { text: 'Green category', color: 'green' }, { text: 'Yellow category', color: 'yellow' },
        { text: 'Clear categories', color: 'transparent' }
    ];
    let dropDownListObj: DropDownList = new DropDownList({
        dataSource: themeList,
        fields: { text: 'text' },
        valueTemplate: '<div class="tb-dropdowns"> Categories </div>',
        itemTemplate: '<div class="e-list" style="padding:0px 15px">' +
        '<div style="width: 20px;float:left;top: 8px;position: absolute;">' +
        '<div style="width: 10px; height:15px; border-color: ${color}; background-color: ${color};"></div>' +
        '</div>' +
        '<div style="width: 170px;float:left;margin-left: 15px;font-size:12px;"><span>${text}</span></div>' +
        '</div>',
        popupHeight: '250px',
        popupWidth: '230px',
        value: 'Blue category',
        width: '100px'
    });
    dropDownListObj.appendTo('#categoryList');
}

function renderMoreList(): void {
    let themeList: { [key: string]: Object }[] = [
        { text: 'Mark as unread' }, { text: 'Mark as read' }, { text: 'Flag' }, { text: 'Clear Flag' }
    ];
    let dropDownListObj: DropDownList = new DropDownList({
        dataSource: themeList,
        fields: { text: 'text' },
         // tslint:disable:max-line-length
        valueTemplate: '<div class="tb-dropdowns" style ="font-size: 16px;margin-top: -2px;"><span class="e-btn-icon e-icons ej-icon-More"></span> </div>',
        popupHeight: '150px',
        popupWidth: '150px',
        value: 'Mark as read',
        width: '100%'
    });
    dropDownListObj.appendTo('#moreList');
    dropDownListObj.select = moreItemSelect;
}

function renderMoreListMobile(): void {
    let themeList: { [key: string]: Object }[] = [
        { text: 'Mark as unread' }, { text: 'Mark as read' }, { text: 'Flag' },
        { text: 'Clear Flag' }
    ];
    let dropDownListObj1: DropDownList = new DropDownList({
        dataSource: themeList,
        fields: { text: 'text' },
         // tslint:disable:max-line-length
        valueTemplate: '<div class="tb-dropdowns" style ="font-size: 16px;margin-top: -2px;"><span class="e-btn-icon e-icons ej-icon-More"></span> </div>',
        popupHeight: '150px',
        popupWidth: '150px',
        value: 'Mark as read',
        width: '100%'
    });
    dropDownListObj1.appendTo('#moreList1');
    dropDownListObj1.select = moreItemSelect;
}

function replyAllSelect(args: DropDownSelectEventArgs): void {
    if (args.itemData.text) {
        showNewMailPopup(args.itemData.text);
    }
    dropdownSelect = true;
}

function moveToSelect(args: DropDownSelectEventArgs): void {
    if (args.itemData.text) {
        let selectedMessage: { [key: string]: Object } = getSelectedMessage();
        let key: string = 'Folder';
        selectedMessage[key] = args.itemData.text;
        grpListObj.dataSource = getFilteredDataSource(messageDataSource, 'Folder', selectedFolderName);
        showEmptyMessage();
    }
}

function moreItemSelect(args: DropDownSelectEventArgs): void {
    let selectedMessage: { [key: string]: Object } = getSelectedMessage();
    let key: string = '';
    if (args.itemData.text === 'Mark as read') {
        key = 'ContactID';
        setReadStyleMessage(selectedMessage[key].toString(), 'Read');
    } else if (args.itemData.text === 'Mark as unread') {
        key = 'ContactID';
        setReadStyleMessage(selectedMessage[key].toString(), 'Unread');
    } else {
        let target: HTMLElement = selectedListElement.getElementsByClassName('e-btn-icon ej-icon-Flag_1')[0] as HTMLElement;
        flagListItem(target, selectedMessage);
    }
}

function renderToolbarMobile(): void {
    let ele: string = '<div class="search-div1" style= "width:90%" >' +
        '<div style="height: 30px">' +
        '<input type="text" id="txtSearch1" tabindex="1" style="height: 30px" />' +
        '</div>' +
        '</div>';
    let moreTemplate: string = '<input type="text" tabindex="1" id="moreList1" />';
    toolbarMobile = new Toolbar({
        items: [
            { prefixIcon: 'ej-icon-Menu tb-icons', cssClass: 'tb-item-menu tb-item-front' },
            { prefixIcon: 'ej-icon-Back', cssClass: 'tb-item-back-icon tb-item-back' },
            { text: 'Inbox', cssClass: 'tb-item-inbox tb-item-front' },
            { text: 'Compose', cssClass: 'tb-item-inbox tb-item-back tb-item-newmail-option' },
            { template: ele, cssClass: 'tb-item-search-option', align: 'Center' },
            { prefixIcon: 'ej-icon-Close', tooltipText: 'Clear', align: 'Right', cssClass: 'tb-item-search-option' },
            { prefixIcon: 'ej-icon-Search', tooltipText: 'Search Mail', align: 'Right', cssClass: 'tb-item-front' },
            { prefixIcon: 'ej-icon-Create-New', tooltipText: 'Write a new message', align: 'Right', cssClass: 'tb-item-front' },
            { prefixIcon: 'ej-icon-Send', tooltipText: 'Send', align: 'Right', cssClass: 'tb-item-back tb-item-newmail-option' },
            { prefixIcon: 'ej-icon-Attach', tooltipText: 'Attach', align: 'Right', cssClass: 'tb-item-back  tb-item-newmail-option' },
            { prefixIcon: 'ej-icon-Delete', tooltipText: 'Delete', align: 'Right', cssClass: 'tb-item-back' },
            { prefixIcon: 'ej-icon-Reply-All', tooltipText: 'Reply All', align: 'Right', cssClass: 'tb-item-back' },
            { template: moreTemplate, cssClass: 'tb-item-more tb-item-back', tooltipText: 'More actions', align: 'Right' },
        ],
        width: '100%',
        height: '100%',
    });
    toolbarMobile.clicked = toolbarClick;
    toolbarMobile.appendTo('#toolbar_mobile');

    acSearchMobile = new AutoComplete({
        dataSource: getContacts(),
        fields: { text: 'MailId', value: 'MailId' },
        placeholder: 'Search Mail and People',
        change: autoSearchSelect,
        focus: autoSearchFocus1,
        blur: autoSearchBlur1,
        cssClass: 'search-text-box-device',
        showClearButton: false
    });
    acSearchMobile.appendTo('#txtSearch1');
    renderMoreListMobile();
}

function getListTemplate(): string {
    return '<div class="template-container ${ReadStyle}-parent">' +
        '<div style="height:30px; pointer-events:none;">' +
        '<div class="sender-style" style="float:left; margin-top: 2px">${text}</div>' +
        '<div style="right:25px; position: absolute; margin-top: 2px; pointer-events:all;">' +
        '<button id="btnListDelete" title="Delete" class="listview-btn">' +
        '<span class="e-btn-icon ej-icon-Delete"></span>' +
        '</button>' +
        '<button id="btnListFlag" title="${FlagTitle}" class="listview-btn">' +
        '<span class="e-btn-icon ej-icon-Flag_1 ${Flagged}"></span>' +
        '</button>' +
        '<button id="btnListRead" title="${ReadTitle}" class="listview-btn">' +
        '<span class="e-btn-icon ej-icon-Mark-as-read"></span>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '<div class="subjectstyle ${ReadStyle}" style="height:25px">' +
        '<div style="float:left; margin-top: 2px">${ContactTitle}</div>' +
        '<div style="right:25px; position: absolute; margin-top: 2px">' +
        '<span>${Time}</span>' +
        '</div>' +
        '</div>' +
        '<div class="descriptionstyle">${Message}</div>' +
        '</div>';
}

export function showToolbarItems(displayType: string): void {
    let selectedFolder: HTMLCollectionOf<HTMLElement> =
        document.getElementsByClassName('tb-item-Selected') as HTMLCollectionOf<HTMLElement>;
    for (let i: number = 0; i < selectedFolder.length; i++) {
        selectedFolder[i].style.display = displayType;
    }
}

function nodeSelected(args: NodeSelectEventArgs): void {
    removeSpacer();
    let key: string = 'id';
    treeSelectedElement = args.node;
    treeviewSelectedData = getTreeData1(args.nodeData[key].toString());
    selectedFolderName = (args.node.getElementsByClassName('treeName')[0] as HTMLElement).innerHTML;
    grpListObj.dataSource = sortList(getFilteredDataSource(messageDataSource, 'Folder', selectedFolderName));
    showEmptyMessage();
    document.getElementById('spanFilterText').innerHTML = selectedFolderName;
    let element1: Element = document.getElementsByClassName('tb-item-inbox')[0];
    if (element1) {
        element1 = element1.getElementsByClassName('e-tbar-btn-text')[0];
        element1.innerHTML = selectedFolderName;
    }
    hideSideBar();
}

export function showEmptyMessage(): void {
    removeSpacer();
    document.getElementById('emptyMessageDiv').style.display = '';
    document.getElementById('mailarea').style.display = 'none';
    document.getElementById('accordian').style.display = 'none';
    showToolbarItems('none');
    let readingPane: HTMLElement = document.getElementById('reading-pane-div');
    readingPane.className = readingPane.className.replace(' new-mail', '');
    (document.getElementsByClassName('tb-item-new-mail')[0] as HTMLElement).style.display = 'inline-flex';
    (document.getElementsByClassName('tb-item-mark-read')[0] as HTMLElement).style.display = 'inline-flex';
    document.getElementById('toolbar_align').style.display = '';
}

export function showSelectedMessage(): void {
    removeSpacer();
    document.getElementById('emptyMessageDiv').style.display = 'none';
    document.getElementById('mailarea').style.display = 'none';
    document.getElementById('accordian').style.display = '';
    showToolbarItems('inline-flex');
    let readingPane: HTMLElement = document.getElementById('reading-pane-div');
    readingPane.className = readingPane.className.replace(' new-mail', '');
    (document.getElementsByClassName('tb-item-new-mail')[0] as HTMLElement).style.display = 'inline-flex';
    (document.getElementsByClassName('tb-item-mark-read')[0] as HTMLElement).style.display = 'none';
    document.getElementById('toolbar_align').style.display = '';
}

function getFilteredDataSource(dataSource: { [key: string]: Object }[], columnName: string, columnValue: string)
    : { [key: string]: Object }[] {
    let folderData: { [key: string]: Object }[] = [];
    for (let i: number = 0; i < dataSource.length; i++) {
        let data: { [key: string]: Object } = dataSource[i];
        if (data[columnName] && data[columnName].toString() === columnValue) {
            folderData.push(data);
        }
    }
    return folderData;
}

function setReadStyleMessage(contactID: string, readStyle: string): void {
    let data: { [key: string]: Object } = getSelectedMessage();
    selectedFolderName = data.Folder as string;
    if (data !== null) {
        let key: string = 'ReadStyle';
        data[key] = readStyle;
        key = 'ReadTitle';
        let readNode: HTMLElement =
            selectedListElement.getElementsByClassName('e-btn-icon ej-icon-Mark-as-read')[0].parentNode as HTMLElement;
        if (readStyle === 'Read') {
            data[key] = 'Mark as unread';
            (selectedListElement.getElementsByClassName('subjectstyle')[0] as HTMLElement).className = 'subjectstyle';
            (selectedListElement.getElementsByClassName('template-container')[0] as HTMLElement).className =
                'template-container';
            readNode.title = 'Mark as unread';
            setReadCount('Unread');
        } else {
            data[key] = 'Mark as read';
            readNode.title = 'Mark as read';
            (selectedListElement.getElementsByClassName('subjectstyle')[0] as HTMLElement).className =
                'subjectstyle Unread';
            (selectedListElement.getElementsByClassName('template-container')[0] as HTMLElement).className =
                'template-container Unread-parent';
            setReadCount('Read');
        }
    }
}

function getSelectedMessage(): { [key: string]: Object } {
    if (grpListObj.getSelectedItems()) {
        let selectedData: { [key: string]: Object } = grpListObj.getSelectedItems().data as {};
        let key: string = 'ContactID';
        for (let i: number = 0; i < messageDataSource.length; i++) {
            if (messageDataSource[i][key].toString() === selectedData[key].toString()) {
                return messageDataSource[i];
            }
        }
    }
    return null;
}

function renderTreeContextMenu(): void {
    let menuItems: MenuItemModel[] = [
        { text: 'Create new subfolder' }, { text: 'Rename' }, { text: 'Delete' },
        { text: 'Add to Favorites' }, { text: 'Mark all as read' }
    ];
    let menuOptions: ContextMenuModel = { target: '#tree', items: menuItems };
    treeContextMenu = new ContextMenu(menuOptions, '#treeContextMenu');
    treeContextMenu.beforeOpen = treeMenuBeforeOpen;
    treeContextMenu.select = treeMenuSelect;
}

function treeMenuSelect(args: MenuEventArgs): void {
    if (args.item) {
        let target: HTMLElement = treeSelectedElement.getElementsByClassName('e-btn-icon')[0] as HTMLElement;
        if (args.item.text === 'Create new subfolder') {
            lastIndex += 1;
            let key: string = 'ID';
            let item: { [key: string]: Object } = {
                'ID': lastIndex, 'PID': treeviewSelectedData[key].toString(), 'Name': 'New Folder',
                'HasChild': false, 'Expanded': false, 'Count': '',
                'Favorite': 'Favorite', 'FavoriteMessage': 'Add to Favorites'
            };
            treeObj.addNodes([item], null, null);
            treeDataSource.push(item);
            treeObj.beginEdit(lastIndex.toString());
        } else if (args.item.text === 'Rename') {
            treeObj.beginEdit(treeviewSelectedData.ID.toString());
        } else if (args.item.text === 'Delete') {
            if (selectedFolderName === 'Deleted Items') {
                dlgDelete.content = '<div class="dlg-content-style"><span>Are you sure you want to permanently' +
                ' delete all the items in Deleted items?</span></div>';
                dlgDelete.header = 'Delete All';
            } else {
                dlgDelete.content = '<div class="dlg-content-style"><span>Are you sure you want to move all ' +
                'its content to Deleted items?</span></div>';
                dlgDelete.header = 'Delete Folder Items';
            }
            dlgDelete.show();
        } else if (args.item.text === 'Mark all as read') {
            markAllRead();
        } else if (args.item.text === 'Add to Favorites') {
            favoriteAction('add', target);
        } else if (args.item.text === 'Remove from Favorites') {
            favoriteAction('Remove', target);
        }
    }
}

function markAllRead(): void {
    let dataSource: { [key: string]: Object }[] = getFilteredDataSource(messageDataSource, 'Folder', selectedFolderName);
    for (let i: number = 0; i < dataSource.length; i++) {
        let key: string = 'ReadStyle';
        dataSource[i][key] = 'Read';
        key = 'ReadTitle';
        dataSource[i][key] = 'Mark as unread';
        setReadCount('Unread');
    }
    grpListObj.dataSource = dataSource;
}

function treeMenuBeforeOpen(args: BeforeOpenCloseMenuEventArgs): void {
    let key: string = 'PID';
    let parentNode: string = treeviewSelectedData[key].toString();
    key = 'Favorite';
    let favorite: string = treeviewSelectedData[key].toString();
    if (favorite === 'Favorite-Composite') {
        favorite = 'Remove from Favorites';
    } else {
        favorite = 'Add to Favorites';
    }
    treeContextMenu.items[3].text = favorite;
    treeContextMenu.dataBind();
    if (parentNode === '1') {
        treeContextMenu.hideItems(['Create new subfolder', 'Rename']);
    } else {
        treeContextMenu.showItems(['Create new subfolder', 'Rename']);
    }
}

function setCategory(category: string, dataSource: {}[]): {}[] {
    for (let i: number = 0; i < dataSource.length; i++) {
        let data: { [key: string]: Object } = dataSource[i];
        let key: string = 'category';
        data[key] = category;
    }
    return dataSource;
}

function setReadCount(readType: string): void {
    let selectedFolder: HTMLCollectionOf<HTMLElement> =
        document.getElementsByClassName('treeCount ' + selectedFolderName) as HTMLCollectionOf<HTMLElement>;
    for (let i: number = 0; i < selectedFolder.length; i++) {
        let count: number = selectedFolder[i].innerHTML === '' ? 0 : Number(selectedFolder[i].innerHTML);
        if (readType === 'Unread') {
            if (count > 0) {
                count -= 1;
            }
        } else {
            count += 1;
        }
        selectedFolder[i].innerHTML = count === 0 ? '' : count.toString();
    }
}

function select(args: SelectEventArgs): void {
    selectedListElement = args.item as HTMLElement;
    let data: { [key: string]: Object } = args.data as { [key: string]: Object };
    let key: string = 'ReadStyle';
    if (data[key].toString() !== 'Read') {
        key = 'ContactID';
        setReadStyleMessage(data[key].toString(), 'Read');
        isItemClick = true;
    }
    let contentElement: Element = document.getElementsByClassName('row content')[0];
    if (window.innerWidth < 605) {
        contentElement.className = 'row content sidebar-hide show-reading-pane';
    }
    let contentWrapper: Element = document.getElementsByClassName('content-wrapper')[0];
    contentWrapper.className = 'content-wrapper';
    showSelectedMessage();
    key = 'ContactTitle';
    if (acrdnObj.items.length === 0) {
        acrdnObj.addItem({
            content: '#accodianContent', expanded: true, header: data[key].toString()
        });
    }
    let headerTitle: HTMLElement = document.getElementById('accordian');
    key = 'ContactTitle';
    headerTitle.getElementsByClassName('e-acrdn-header-content')[0].innerHTML = data[key].toString();
    key = 'Image';
    (headerTitle.getElementsByClassName('logo logo-style2')[0] as HTMLElement).style.background =
        'url(' + data[key].toString().replace('styles/images/images/', 'styles/images/large/') + ')  no-repeat 50% 50%';
    key = 'text';
    document.getElementById('sub').innerHTML = data[key].toString();
    key = 'Date';
    let dateString: string = data[key].toString();
    key = 'Time';
    document.getElementById('date').innerHTML = dateString + ' ' + data[key].toString();
    key = 'CC';
    document.getElementById('to').innerHTML = (data[key].toString()).replace(/,/g, ' ; ');
    key = 'Message';
    if (data[key]) {
        document.getElementById('accContent').innerHTML = data[key].toString();
    } else {
        document.getElementById('accContent').innerHTML =
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

function renderSearchSection(): void {
    let filterButton: Button = new Button({
        iconCss: 'ej-icon-Dropdown-arrow',
        cssClass: 'btn-shadow-hide'
    });
    filterButton.appendTo('#btnFilter');
    document.getElementById('btnFilter').onclick = btnFilterClick;

    let atcObj: AutoComplete = new AutoComplete({
        dataSource: getContacts(),
        fields: { text: 'MailId', value: 'MailId' },
        placeholder: 'Search Mail and People',
        change: autoSearchSelect,
        focus: autoSearchFocus,
        blur: autoSearchBlur,
        showClearButton: false
    });
    atcObj.appendTo('#txtSearch');

    let button: Button = new Button({
        iconCss: 'ej-icon-Search',
        cssClass: 'btn-shadow-hide'
    });
    button.appendTo('#btnSearch');
}

function autoSearchSelect(args: ChangeEventArgs): void {
    if (args.value) {
        // let dataSource: { [key: string]: Object }[] = getFilteredDataSource(messageDataSource, 'Folder', selectedFolderName);
        let dataSource: { [key: string]: Object }[] = messageDataSource;
        grpListObj.dataSource = getFilteredDataSource(dataSource, 'Email', args.value.toString());
        document.getElementById('spanFilterText').innerHTML = 'All Search';
    } else {
        resetSelectedFolderData();
    }
}

function autoSearchFocus(args: Object): void {
    document.getElementsByClassName('search-div')[0].classList.add('search-focus');
}

function autoSearchBlur(args: Object): void {
    document.getElementsByClassName('search-div')[0].classList.remove('search-focus');
}

function autoSearchFocus1(args: Object): void {
    document.getElementsByClassName('search-div1')[0].classList.add('search-focus');
}

function autoSearchBlur1(args: Object): void {
    document.getElementsByClassName('search-div1')[0].classList.remove('search-focus');
}

function resetSelectedFolderData(): void {
    document.getElementById('spanFilterText').innerHTML = selectedFolderName;
    let dataSource: { [key: string]: Object }[] = getFilteredDataSource(messageDataSource, 'Folder', selectedFolderName);
    grpListObj.dataSource = dataSource;
    clearFilterMenu();
    filterContextMenu.items[0].iconCss = 'ej-icon-Right';
    filterContextMenu.dataBind();
}

function btnFilterClick(): void {
    let clientRect: ClientRect = document.getElementById('btnFilter').getBoundingClientRect();
    filterContextMenu.open(clientRect.top + 25, clientRect.left);
}

function renderMailDialogs(): void {

    dlgFavorite = new Dialog({
        width: '335px',
        header: 'Remove From Favorites',
        content: '<div class="dlg-content-style"><span>Do you want to remove from favorites?</span></div>',
        target: document.body,
        isModal: true,
        closeOnEscape: true,
        animationSettings: { effect: 'None' },
        buttons: [
            {
                click: btnFavoriteOKClick, buttonModel: { content: 'Yes', cssClass: 'e-flat', isPrimary: true }
            },
            {
                click: btnFavoriteCancelClick, buttonModel: { content: 'No', cssClass: 'e-flat' }
            }
        ]
    });
    dlgFavorite.appendTo('#favoriteDialog');
    dlgFavorite.hide();

    dlgDelete = new Dialog({
        width: '335px',
        header: 'Delete Folder Items',
        content: '<div class="dlg-content-style"><span>Are you sure you want to move all its content to Deleted items?</span></div>',
        target: document.body,
        isModal: true,
        closeOnEscape: true,
        animationSettings: { effect: 'None' },
        buttons: [
            {
                click: btnDeleteOKClick, buttonModel: { content: 'Yes', cssClass: 'e-flat', isPrimary: true }
            },
            {
                click: btnDeleteCancelClick, buttonModel: { content: 'No', cssClass: 'e-flat' }
            }
        ]
    });
    dlgDelete.appendTo('#deleteDialog');
    dlgDelete.hide();

    dlgNewWindow = new Dialog({
        width: '80%',
        height: '93%',
        target: document.body,
        animationSettings: { effect: 'None' },
        closeOnEscape: true,
        allowDragging: true
    });
    dlgNewWindow.appendTo('#newMailSeparateDialog');
    dlgNewWindow.hide();

    dlgReplyAllWindow = new Dialog({
        width: '80%',
        height: '93%',
        target: document.body,
        animationSettings: { effect: 'None' },
        closeOnEscape: true,
    });
    dlgReplyAllWindow.appendTo('#replyAllSeparateDialog');
    dlgReplyAllWindow.hide();

    dlgSentMail = sentMailDialog('#sentMailDialog', true);
    dlgSentMailNew = sentMailDialog('#sentMailNewWindow', false);

    dlgDiscard = discardDialog('#discardDialog', true);
    dlgDiscardNew = discardDialog('#discardNewWindow', false);
}

function sentMailDialog(name: string, isModal: boolean): Dialog {
    let dialog: Dialog = new Dialog({
        width: '335px',
        header: 'Mail Sent',
        content: '<div class="dlg-content-style"><span>Your mail has been sent successfully.</span></div>',
        target: document.body,
        isModal: isModal,
        closeOnEscape: true,
        animationSettings: { effect: 'None' },
        buttons: [{
            click: sendExitClick,
            buttonModel: { content: 'OK', cssClass: 'e-flat', isPrimary: true }
        }]
    });
    dialog.appendTo(name);
    dialog.hide();
    return dialog;
}

//tslint:disable
function discardDialog(name: string, isModal: boolean): Dialog {
    let dialog: Dialog = new Dialog({
        width: '335px',
        header: 'Discard message',
        content: '<div id=' + name + 'discardOk' + ' style="cursor:pointer" class="dlg-content-style1">' +
        '<span style="color:white" class="dlg-discard-text-style">Discard</span> <br/>' +
        '<span style="color:white; font-weight:normal" class="dlg-discard-child-text-style">This message will be deleted</span>' +
        '</div> <br/>' +
        '<div id=' + name + 'discardCancel' + ' style="cursor:pointer" class="dlg-content-style">' +
        '<span class="dlg-discard-text-style">Don' + "'" + 't Discard</span> <br/>' +
        '<span style="font-weight:normal" class="dlg-discard-child-text-style">Return to the message for further editing</span>' +
        '</div>',
        target: document.body,
        isModal: isModal,
        closeOnEscape: true,
        animationSettings: { effect: 'None' }
    });
    dialog.appendTo(name);
    document.getElementById(name + 'discardOk').onclick = discardOkClick;
    document.getElementById(name + 'discardCancel').onclick = discardCancelClick;
    dialog.hide();
    return dialog;
}
//tslint:enable

function discardOkClick(): void {
    discardClick();
}

function discardCancelClick(): void {
    if (dlgNewWindow.visible || dlgReplyAllWindow.visible) {
        dlgDiscardNew.hide();
    } else {
        dlgDiscard.hide();
    }
}

function btnFavoriteOKClick(): void {
    let key: string = 'PID';
    let parentID: string = treeviewSelectedData[key].toString();
    if (parentID === '1') {
        key = 'ID';
        removeTreeItem(treeviewSelectedData[key].toString());
        treeDataSource.splice(treeDataSource.indexOf(treeviewSelectedData), 1);
    } else {
        for (let i: number = 0; i < treeDataSource.length; i++) {
            let key: string = 'PID';
            let treeData: { [key: string]: Object } = treeDataSource[i];
            if (treeData[key] && treeData[key].toString() === '1') {
                key = 'Name';
                if (treeData[key].toString() === selectedFolderName) {
                    key = 'ID';
                    removeTreeItem(treeData[key].toString());
                    treeDataSource.splice(i, 1);
                    break;
                }
            }
        }
    }
    dlgFavorite.hide();
}

function btnFavoriteCancelClick(): void {
    dlgFavorite.hide();
}

function btnDeleteOKClick(): void {
    let folderMessages: { [key: string]: Object }[] = getFilteredDataSource(messageDataSource, 'Folder', selectedFolderName);
    if (selectedFolderName === 'Deleted Items') {
        for (let i: number = 0; i < folderMessages.length; i++) {
            messageDataSource.splice(messageDataSource.indexOf(folderMessages[i]), 1);
        }
    } else {
        for (let i: number = 0; i < folderMessages.length; i++) {
            let key: string = 'Folder';
            folderMessages[i][key] = 'Deleted Items';
        }
    }
    grpListObj.dataSource = [];
    showEmptyMessage();
    dlgDelete.hide();
}

function btnDeleteCancelClick(): void {
    dlgDelete.hide();
}

function removeTreeItem(id: string): void {
    treeObj.removeNodes([id]);
    let element: Element = document.getElementsByClassName('ej-icon-Favorite-Composite ' + selectedFolderName)[0];
    element.className = 'e-btn-icon ej-icon-Favorite ' + selectedFolderName;
    let parent: HTMLElement = element.parentNode as HTMLElement;
    parent.title = 'Add to Favorites';
    let key: string = 'FavoriteMessage';
    treeviewSelectedData[key] = 'Add to Favorites';
    key = 'Favorite';
    treeviewSelectedData[key] = 'Favorite';
}

function updateLoginDetails(): void {
    document.getElementById('username').textContent = userName;
    document.getElementById('username1').textContent = userName;
    document.getElementById('usermail').textContent = userMail;
    document.getElementById('usermail1').textContent = userMail;
}

function createHeader(): void {
    let notificationButton: Button = new Button({ iconCss: 'ej-icon-Notify', cssClass: 'btn-shadow-hide' });
    notificationButton.appendTo('#btnNotification');

    let btnSettings: Button = new Button({ iconCss: 'ej-icon-Settings', cssClass: 'btn-shadow-hide' });
    btnSettings.appendTo('#btnSettings');

    let btnAbout: Button = new Button({ iconCss: 'ej-icon-Help-white', cssClass: 'btn-shadow-hide' });
    btnAbout.appendTo('#btnAbout');

    let btnLoginName: Button = new Button({ content: userName, cssClass: 'btn-shadow-hide' });
    btnLoginName.appendTo('#btnLoginName');

    let closeButton: Button = new Button({ iconCss: 'ej-icon-Close', cssClass: 'btn-shadow-hide' });
    closeButton.appendTo('#btnCloseButton');
    document.getElementById('btnCloseButton').onclick = btnCloseClick;

    let closeButton1: Button = new Button({ iconCss: 'ej-icon-Close', cssClass: 'btn-shadow-hide' });
    closeButton.appendTo('#btnCloseButton1');
    document.getElementById('btnCloseButton1').onclick = hideSideBar;
}

function btnCloseClick(): void {
    let contentWrapper: Element = document.getElementsByClassName('row content')[0];
    contentWrapper.className = contentWrapper.className.replace(' show-header-content', '');
    let headerRP: Element = document.getElementsByClassName('header-right-pane selected')[0];
    headerRP.className = 'header-right-pane';
}

function sortList(listItems: { [key: string]: Object }[]): { [key: string]: Object }[] {
    for (let i: number = 0; i < listItems.length; i++) {
        listItems[i] = setCategory1(listItems[i]);
    }
    return listItems;
}

function setCategory1(listItem: { [key: string]: Object }): {} {
    let key: string = 'Date';
    let date: Date = new Date(listItem[key] as string);
    let currentData: Date = new Date();
    let oldDate: number = date.getDate();
    let oldMonth: number = date.getMonth();
    let oldYear: number = date.getFullYear();

    let currentDate: number = currentData.getDate();
    let currentMonth: number = currentData.getMonth();
    let currentYear: number = currentData.getFullYear();

    key = 'category';
    if (oldYear === currentYear) {
        if (oldMonth === currentMonth) {
            if (oldDate === currentDate) {
                listItem[key] = 'Today';
            } else if (oldDate === currentDate - 1) {
                listItem[key] = 'Yesterday';
            } else if (oldDate + 8 >= currentDate) {
                listItem[key] = 'Last Week';
            } else if (oldDate + 15 >= currentDate) {
                listItem[key] = 'Two Weeks Ago';
            } else if (oldDate + 22 >= currentDate) {
                listItem[key] = 'Three Weeks Ago';
            } else {
                listItem[key] = 'Earlier this Month';
            }
        } else {
            listItem[key] = 'Last Month';
        }
    } else {
        listItem[key] = 'Older';
    }
    return listItem;
}

function headerContent(headerElement: HTMLElement): void {
    let headerRP: Element = document.getElementsByClassName('header-right-pane selected')[0];
    if (headerRP) {
        headerRP.className = 'header-right-pane';
    }
    let contentWrapper: Element = document.getElementsByClassName('row content')[0];
    contentWrapper.className = contentWrapper.className.replace(' show-header-content', '') + ' show-header-content';
    let notificationElement: HTMLElement = document.getElementsByClassName('notification-content')[0] as HTMLElement;
    let settingsElement: HTMLElement = document.getElementsByClassName('settings-content')[0] as HTMLElement;
    let aboutElement: HTMLElement = document.getElementsByClassName('about-content')[0] as HTMLElement;
    let userElement: HTMLElement = document.getElementsByClassName('profile-content')[0] as HTMLElement;
    let txtHeaderContent: HTMLElement = document.getElementById('txtHeaderContent');
    notificationElement.style.display = 'none';
    settingsElement.style.display = 'none';
    aboutElement.style.display = 'none';
    userElement.style.display = 'none';
    headerElement.className = headerElement.className + ' ' + 'selected';
    switch (headerElement.id) {
        case 'notification-div':
            notificationElement.style.display = 'block';
            txtHeaderContent.innerHTML = 'Notification';
            break;
        case 'settings-div':
            settingsElement.style.display = 'block';
            txtHeaderContent.innerHTML = 'Settings';
            break;
        case 'profile-div':
            userElement.style.display = 'block';
            txtHeaderContent.innerHTML = 'My accounts';
            break;
        case 'about-div':
            aboutElement.style.display = 'block';
            txtHeaderContent.innerHTML = 'Help';
            break;
    }
}

function toolbarClick(args: ClickEventArgs): void {
    if (args.item) {
        if (args.item.prefixIcon === 'ej-icon-Menu tb-icons') {
            defaultSidebar.show();
            let overlayElement: Element = document.getElementsByClassName('overlay-element')[0];
            overlayElement.className = 'overlay-element show1';
            isMenuClick = true;
        } else if (args.item.prefixIcon === 'ej-icon-Back') {
            let contentElement: Element = document.getElementsByClassName('row content')[0];
            contentElement.className = contentElement.className.replace('show-reading-pane', 'show-message-pane');
            let contentWrapper: Element = document.getElementsByClassName('content-wrapper')[0];
            if (contentWrapper.className.indexOf('show-search-option') !== -1) {
                resetSelectedFolderData();
            }
            contentWrapper.className = 'content-wrapper';
        } else if (args.item.prefixIcon === 'ej-icon-Mark-as-read tb-icons') {
            markAllRead();
        } else if (args.item.text === 'Delete' || args.item.prefixIcon === 'ej-icon-Delete' ||
            args.item.text === 'Junk') {
            let selectedMessage: { [key: string]: Object } = getSelectedMessage();
            messageDataSource.splice(messageDataSource.indexOf(selectedMessage), 1);
            let key: string = 'ContactID';
            let contactName: string = 'text';
            grpListObj.removeItem({ id: selectedMessage[key].toString(), text: selectedMessage[contactName].toString() });
            if (args.item.prefixIcon === 'ej-icon-Delete' && window.innerWidth < 605) {
                let contentElement: Element = document.getElementsByClassName('row content')[0];
                contentElement.className = contentElement.className.replace('show-reading-pane', 'show-message-pane');
            } else {
                showEmptyMessage();
            }
        } else if ((args.item.text === 'New' || args.item.prefixIcon === 'ej-icon-Create-New') ||
            (args.item.prefixIcon === 'ej-icon-Reply-All')) {
            if (args.item.prefixIcon === 'ej-icon-Create-New') {
                let contentWrapper: Element = document.getElementsByClassName('content-wrapper')[0];
                contentWrapper.className = 'content-wrapper hide-message-option';
            }
            let option: string = 'New';
            if (args.item.prefixIcon === 'ej-icon-Reply-All') {
                option = 'Reply All';
            }
            if (window.innerWidth < 605) {
                let contentElement: Element = document.getElementsByClassName('row content')[0];
                contentElement.className = contentElement.className.replace('show-message-pane', 'show-reading-pane');
            }
            showNewMailPopup(option);
        } else if (args.item.prefixIcon === 'ej-icon-Send') {
            sendClick();
        } else if (args.item.prefixIcon === 'ej-icon-Search') {
            let contentWrapper: Element = document.getElementsByClassName('content-wrapper')[0];
            contentWrapper.className = 'content-wrapper show-search-option';
            toolbarMobile.refreshOverflow();
        } else if (args.item.prefixIcon === 'ej-icon-Close') {
            acSearchMobile.value = '';
        } else if (args.item.prefixIcon === 'ej-icon-Copy tb-icons') {
            if (!dlgReplyAllWindow.content) {
                dlgReplyAllWindow.content = document.getElementById('reading-pane-popup');
                dlgReplyAllWindow.refresh();
            }
            dlgReplyAllWindow.show();
            bindReadingPaneData(getSelectedMessage());
        }
    }
}

function showNewMailPopup(option: string): void {
    isNewMailClick = true;
    if (window.innerWidth > 1090) {
        document.getElementById('list-pane-div').classList.add("pane-spacer");
    }
    let selectedMessage: { [key: string]: Object } = getSelectedMessage();
    showToolbarItems('none');
    document.getElementById('reading-pane-div').className += ' new-mail';
    document.getElementById('accordian').style.display = 'none';
    document.getElementById('emptyMessageDiv').style.display = 'none';
    document.getElementById('mailarea').style.display = '';
    document.getElementById('mailarea').appendChild(document.getElementById('newmailContent'));
    (document.getElementsByClassName('tb-item-new-mail')[0] as HTMLElement).style.display = 'none';
    (document.getElementsByClassName('tb-item-mark-read')[0] as HTMLElement).style.display = 'none';
    document.getElementById('toolbar_align').style.display = 'none';
    showMailDialog(option, selectedMessage);
}

function onWindowResize(evt: Event): void {
    let messagePane: HTMLElement = document.getElementById('list-pane-div');
    let contentArea: Element = document.getElementsByClassName('row content')[0];
    let isReadingPane: boolean = (contentArea.className.indexOf('show-reading-pane') === -1);
    if (!isReadingPane && window.innerWidth < 605) {
        return;
    }
    if (window.innerWidth < 1200) {
        let headerRP: Element = document.getElementsByClassName('header-right-pane selected')[0];
        if (headerRP) {
            headerRP.className = 'header-right-pane';
        }
        contentArea.className = 'row content';
    } else {
        if (contentArea.className.indexOf('show-header-content') === -1) {
            contentArea.className = 'row content';
        } else {
            contentArea.className = 'row content show-header-content';
        }
    }
    if (window.innerWidth < 1090) {
        contentArea.className = 'row content sidebar-hide';
        if (messagePane.classList.contains('pane-spacer')){
            messagePane.classList.remove("pane-spacer");
        }
        defaultSidebar.hide();
        defaultSidebar.type='Over';
    } else {
        if (!isNewMailClick){
            if (messagePane.classList.contains("pane-spacer")) {
                messagePane.classList.remove("pane-spacer");
            }
        }
        else {
            messagePane.classList.add("pane-spacer")
        }
        defaultSidebar.type='Push';
        defaultSidebar.show();
    }
    if (window.innerWidth < 605) {
        if (isReadingPane) {
            contentArea.className = contentArea.className + ' ' + 'show-message-pane';
        }
        if(splitObj){
            splitObj.destroy();
            splitObj=null;
            document.querySelector('.maincontent_pane').appendChild(document.querySelector('#list-pane-div'));
            document.querySelector('.maincontent_pane').appendChild(document.querySelector('#reading-pane-div'));
            (document.querySelector('#list-pane-div') as HTMLElement).style.display='';
            (document.querySelector('#reading-pane-div') as HTMLElement).style.display='';
        }
    }
    else{
        if (!splitObj) {
            splitObj = new Splitter({
                paneSettings: [
                    { size: '37%', min: '37%',content:'#list-pane-div'},
                    { size: '63%',min:'40%',content:'#reading-pane-div' }
                ],
                width: '100%',
                height: '100%'
            });
            splitObj.appendTo('#splitter');
        }
    }
    toolbarMobile.refreshOverflow();
}

function hideSideBar(): void {
    if (!isMenuClick) {
        if (defaultSidebar && window.innerWidth < 1090) {
            defaultSidebar.hide();
            let overlayElement: Element = document.getElementsByClassName('overlay-element')[0];
            overlayElement.className = 'overlay-element';
        }
    }
    isMenuClick = false;
}

export function sendExitClick(): void {
    if (dlgNewWindow.visible || dlgReplyAllWindow.visible) {
        dlgSentMailNew.hide();
    } else {
        dlgSentMail.hide();
    }
    discardClick();
}

export function sendClick(): void {
    if (dlgNewWindow.visible || dlgReplyAllWindow.visible) {
        dlgSentMailNew.show();
    } else {
        dlgSentMail.show();
    }
}

export function discardButtonClick(): void {
    if (dlgNewWindow.visible || dlgReplyAllWindow.visible) {
        dlgDiscardNew.show();
    } else {
        dlgDiscard.show();
    }
}

export function discardClick(): void {
    if (grpListObj.getSelectedItems()) {
        showSelectedMessage();
    } else {
        showEmptyMessage();
    }
    if (dlgNewWindow.visible || dlgReplyAllWindow.visible) {
        dlgDiscardNew.hide();
        if (dlgNewWindow.visible) {
            dlgNewWindow.hide();
        } else if (dlgReplyAllWindow.visible) {
            dlgReplyAllWindow.hide();
        }
    } else {
        dlgDiscard.hide();
    }
    let contentWrapper: Element = document.getElementsByClassName('content-wrapper')[0];
    contentWrapper.className = 'content-wrapper';
}

function getTreeData1(id: string): { [key: string]: Object } {
    for (let i: number = 0; i < treeDataSource.length; i++) {
        let key: string = 'ID';
        if (treeDataSource[i][key].toString() === id) {
            return treeDataSource[i];
        }
    }
    return null;
}

function renderFilterContextMenu(): void {
    let menuItems: MenuItemModel[] = [
        { text: 'All', iconCss: 'ej-icon-Right' }, { text: 'Unread' },
        { text: 'Flagged' }, { separator: true }, {
            text: 'Sort by', items: [{ text: 'None' },
            { text: 'Ascending', iconCss: 'ej-icon-Right' }, { text: 'Descending' }]
        }
    ];
    let menuOptions: ContextMenuModel = { items: menuItems };
    filterContextMenu = new ContextMenu(menuOptions, '#filterContextMenu');
    filterContextMenu.select = filterMenuSelect;
}

function filterMenuSelect(args: MenuEventArgs): void {
    if (args.item) {
        if (args.item.text === 'Ascending' || args.item.text === 'Descending' || args.item.text === 'None') {
            grpListObj.sortOrder = args.item.text as SortOrder;
            for (let i: number = 0; i < filterContextMenu.items[4].items.length; i++) {
                filterContextMenu.items[4].items[i].iconCss = '';
            }
            args.item.iconCss = 'ej-icon-Right';
        } else if (args.item.text !== 'Sort by') {
            clearFilterMenu();
            let dataSource: { [key: string]: Object }[] = getFilteredDataSource(messageDataSource, 'Folder', selectedFolderName);
            if (args.item.text === 'All') {
                grpListObj.dataSource = dataSource;
            } else if (args.item.text === 'Flagged') {
                grpListObj.dataSource = getFilteredDataSource(dataSource, 'Flagged', 'Flagged');
            } else if (args.item.text === 'Unread') {
                grpListObj.dataSource = getFilteredDataSource(dataSource, 'ReadStyle', 'Unread');
            }
            args.item.iconCss = 'ej-icon-Right';
        }
    }
}

function clearFilterMenu(): void {
    for (let i: number = 0; i < filterContextMenu.items.length; i++) {
        if (filterContextMenu.items[i].items.length === 0) {
            filterContextMenu.items[i].iconCss = '';
        }
    }
}

function cloneObject(obj: { [key: string]: Object }): { [key: string]: Object } {
    let keys: string[] = Object.keys(obj);
    let cloneObject: { [key: string]: Object } = {};
    for (let i: number = 0; i < keys.length; i++) {
        cloneObject[keys[i]] = obj[keys[i]];
    }
    return cloneObject;
}

function documentClick(evt: MouseEvent): void {
    let key: string = 'parentID';
    if (evt.target instanceof HTMLElement) {
        let target: HTMLElement = evt.target as HTMLElement;
        if (target.className.indexOf('header-right-pane') !== -1) {
            headerContent(evt.target as HTMLElement);
        } else if (!dropdownSelectRP && dlgReplyAllWindow.visible &&  target.innerText === ddlLastRplyValueRP ) {
            showMailDialogRP(ddlLastRplyValueRP);
        } else if (!dropdownSelect && !dlgReplyAllWindow.visible && target.innerText === ddlReplyAll.value) {
            showNewMailPopup(ddlReplyAll.value);
        } else {
            if (target.tagName === 'SPAN' || (target.children && target.children.length > 0)) {
                target = target.tagName === 'SPAN' ? target : target.children[0] as HTMLElement;
                if (target.className === 'e-btn-icon ej-icon-Favorite ' + selectedFolderName) {
                    favoriteAction('add', target);
                } else if (target.className === 'e-btn-icon ej-icon-Favorite-Composite ' + selectedFolderName) {
                    favoriteAction('remove', target);
                } else if ((target.parentNode as HTMLElement).className === 'listview-btn') {
                    let selectedMessage: { [key: string]: Object } = getSelectedMessage();
                    if (target.className.indexOf('ej-icon-Delete') !== -1) {
                        messageDataSource.splice(messageDataSource.indexOf(selectedMessage), 1);
                        key = 'ContactID';
                        let contactName: string = 'text';
                        grpListObj.removeItem({ id: selectedMessage[key].toString(), text: selectedMessage[contactName].toString() });
                    } else if (target.className.indexOf('ej-icon-Flag_1') !== -1) {
                        flagListItem(target, selectedMessage);
                    } else if (target.className.indexOf('ej-icon-Mark-as-read') !== -1 && !isItemClick) {
                        let parentNode: HTMLElement = target.parentNode as HTMLElement;
                        if (parentNode.title === 'Mark as read') {
                            parentNode.title = 'Mark as unread';
                            key = 'ContactID';
                            setReadStyleMessage(selectedMessage[key].toString(), 'Read');
                        } else if (parentNode.title === 'Mark as unread') {
                            parentNode.title = 'Mark as read';
                            key = 'ContactID';
                            setReadStyleMessage(selectedMessage[key].toString(), 'Unread');
                        }
                    }
                }
            }
        }
    }
    newmailWindowItemClick();
    readingPaneItemClick();
    isItemClick = false;
    dropdownSelect = false;
}

function documentDoubleClick(evt: MouseEvent): void {
    if (evt.target instanceof HTMLElement) {
        let target: HTMLElement = evt.target as HTMLElement;
        if (target.className.indexOf('template-container') !== -1) {
            if (!dlgReplyAllWindow.content) {
                dlgReplyAllWindow.content = document.getElementById('reading-pane-popup');
                dlgReplyAllWindow.refresh();
            }
            dlgReplyAllWindow.show();
            bindReadingPaneData(getSelectedMessage());
        }
    }
}

function newmailWindowItemClick(): void {
    if (selectedToolbarItem) {
        if (selectedToolbarItem === 'tb-item-window-mail') {
            discardClick();
            dlgNewWindow.content = document.getElementById('newmailContent');
            dlgNewWindow.refresh();
            dlgNewWindow.show();
        } else if (selectedToolbarItem === 'tb-item-back-mail') {
            dlgNewWindow.hide();
        } else if (selectedToolbarItem === 'Send') {
            sendClick();
        } else if (selectedToolbarItem === 'Discard') {
            discardButtonClick();
        }
    }
    resetSelectedToolbarItem('');
}

function readingPaneItemClick(): void {
    if (selectedRPToolbarItem) {
        if (selectedRPToolbarItem === 'SendClick') {
            sendClick();
        } else if (selectedRPToolbarItem === 'DiscardClick') {
            discardButtonClick();
        } else if (selectedRPToolbarItem === 'DeleteClick' || selectedRPToolbarItem === 'JunkClick') {
            let selectedMessage: { [key: string]: Object } = getSelectedMessage();
            messageDataSource.splice(messageDataSource.indexOf(selectedMessage), 1);
            let key: string = 'ContactID';
            let contactName: string = 'text';
            grpListObj.removeItem({ id: selectedMessage[key].toString(), text: selectedMessage[contactName].toString() });
            showEmptyMessage();
            dlgReplyAllWindow.hide();
        } else if (selectedRPToolbarItem === 'ClosePopup') {
            dlgReplyAllWindow.hide();
        }
    }
    resetRPSelectedItem('');
}

function favoriteAction(type: string, target: HTMLElement): void {
    if (type === 'add') {
        target.className = 'e-btn-icon ej-icon-Favorite-Composite ' + selectedFolderName;
        (target.parentNode as HTMLElement).title = 'Remove from Favorites';
        let treeData: { [key: string]: Object } = cloneObject(treeviewSelectedData);
        let key: string = 'PID';
        treeData[key] = '1';
        key = 'ID';
        treeData[key] = Number(treeData[key]) + 111;
        key = 'Favorite';
        treeviewSelectedData[key] = treeData[key] = 'Favorite-Composite';
        key = 'Count';
        treeData[key] = (target.parentNode.parentNode.childNodes[1].childNodes[0] as HTMLElement).innerHTML;
        key = 'FavoriteMessage';
        treeviewSelectedData[key] = treeData[key] = 'Remove from Favorites';
        treeDataSource.push(treeData);
        treeObj.addNodes([treeData], null, null);
    } else {
        let ss: HTMLElement = document.getElementsByClassName('sidebar')[0] as HTMLElement;
        dlgFavorite.show();
    }
}

function flagListItem(target: HTMLElement, selectedMessage: { [key: string]: Object }): void {
    let key: string = 'Flagged';
    let parentNode: HTMLElement = target.parentNode as HTMLElement;
    if (target.className.indexOf('Flagged') !== -1) {
        parentNode.title = 'Flag this Message';
        target.className = 'e-btn-icon ej-icon-Flag_1';
        selectedMessage[key] = 'None';
        key = 'FlagTitle';
        selectedMessage[key] = 'Flag this Message';
    } else {
        parentNode.title = 'Remove the flag from this message';
        target.className = 'e-btn-icon ej-icon-Flag_1 Flagged';
        selectedMessage[key] = 'Flagged';
        key = 'FlagTitle';
        selectedMessage[key] = 'Remove the flag from this message';
    }
}

function popupContentClick(evt: MouseEvent): void {
    if (evt.target instanceof HTMLElement) {
        let target: HTMLElement = evt.target as HTMLElement;
        if (target.className !== 'e-btn-icon ej-icon-Close' && window.innerWidth >= 1090) {
            let key: string = 'ContactID';
            grpListObj.selectItem({ id: messageDataSource[0][key].toString() });
            if (!dlgReplyAllWindow.content) {
                dlgReplyAllWindow.content = document.getElementById('reading-pane-popup');
                dlgReplyAllWindow.refresh();
            }
            dlgReplyAllWindow.show();
            bindReadingPaneData(messageDataSource[0]);
        }
        popup1.hide();
    }
}

function popupMouseEnter(): void {
    hoverOnPopup = true;
}
function popupMouseLeave(): void {
    hoverOnPopup = false;
    hidePopup();
}
function hidePopup(): void {
    setTimeout(() => { if (!hoverOnPopup) { popup1.hide(); } }, 2000);
}
function openPopup(): void {
    let newMessageData: { [key: string]: Object } = cloneObject(messageDataSource[Math.floor(Math.random() * (50 - 3) + 2)]);
    let key: string = 'text';
    document.getElementById('popup-contact').innerHTML = newMessageData[key].toString();
    key = 'ContactTitle';
    document.getElementById('popup-subject').innerHTML = newMessageData[key].toString();
    key = 'Message';
    document.getElementById('popup-message-content').innerHTML = newMessageData[key].toString();
    key = 'Image';
    document.getElementById('popup-image').style.background = 'url(' +
    newMessageData[key].toString().replace('styles/images/images/', 'styles/images/large/') + ') no-repeat 50% 50%';
    key = 'Folder';
    newMessageData[key] = 'Inbox';
    key = 'ReadStyle';
    newMessageData[key] = 'Unread';
    key = 'ReadTitle';
    newMessageData[key] = 'Mark as read';
    key = 'Flagged';
    newMessageData[key] = 'None';
    key = 'FlagTitle';
    newMessageData[key] = 'Flag this message';
    key = 'ContactID';
    newMessageData[key] = 'SF20032';
    let element: HTMLElement = <HTMLElement>document.querySelector('#popup');
    element.onmouseenter = popupMouseEnter;
    element.onmouseleave = popupMouseLeave;
    popup1 = new Popup(element, {
        offsetX: -5, offsetY: 5, relateTo: '#content-area',
        position: { X: 'right', Y: 'top' },
    });
    if (window.innerWidth > 605) {
        popup1.show();
    } else {
        popup1.hide();
    }
    let dataSource: { [key: string]: Object }[] = getFilteredDataSource(messageDataSource, 'Folder', selectedFolderName);
    dataSource.splice(0, 0, newMessageData);
    messageDataSource.splice(0, 0, newMessageData);
    grpListObj.dataSource = dataSource;
    setReadCount('Read');
    setTimeout(() => { hidePopup(); }, 2000);
}

setTimeout(openPopup, 3000);
function removeSpacer() {
    isNewMailClick=false;
    document.getElementById('list-pane-div').classList.remove("pane-spacer");
}