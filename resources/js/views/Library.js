var renderTemplate = require('../renderTemplate'),
    markdown = require('marked');

/**
 * Key used when accessing localStorage
 */
var key = 'library';

/**
 * Element selectors
 */
var selectors = {
    sidebar: '.library-sidebar',
    sidebarItemTemplate: '#library-sidebar-item-template',
    content: '.library-content',
    sectionTemplate: '#library-section-template',
    documentTemplate: '#library-document-template',
    documentEditTemplate: '#library-document-edit-template',
    documentEditTitle: '.library-document-edit-title',
    documentEditText: '.library-document-edit-text',
    libraryItem: '.library-item',
    createButton: '.library .create-item',
    saveButton: '.library button[type=submit]',
    cancelButton: '.library-document-cancel',
    editButton: '.library-document-edit',
    deleteButton: '.library-document-delete'
};

/**
 * Library construtor
 */
function Library() {
    this.data = getData();
    this.editing = false;

    render.bind(this)();
}

/**
 * Render the Library template. 
 * Note: This function must called as a bound function.
 */
function render() {
    // render main template
    $('.content').html(
        $(selectors.sectionTemplate).html()
    );

    // append documents to sidebar
    renderSidebar(
        this.data.documents,
        this.data.activeID
    );

    // render the active document
    renderDocument(
        getActiveDocument.bind(this)(),
        this.editing
    );

    // bind events
    bindEvents.bind(this)();
}

/**
 * Render the library sidebar
 * @param {array} documents An array of objects representing documents
 * @param {int} activeID    ID of the document to mark as active
 */
function renderSidebar(documents, activeID) {
    documents = documents || [];

    // get the sidebar item template HTML
    var template = $(selectors.sidebarItemTemplate).html();

    // iterate through documents
    for (var i=0; i<documents.length; i++) {
        // render item template using document data
        var $item = $(
            renderTemplate(template, documents[i])
        );

        // if activeID matches document ID, add 'active' class to element
        if (activeID === documents[i].id) {
            $item.addClass('active');
        }

        // append element to sidebar
        $(selectors.sidebar).append($item);
    }
}

/**
 * Render a library item to view
 * @param {object} doc      (Optional) An object of document data.
 * @param {bool} editing    (Optional) If true, the document edit form is rendered. Defaults to false.
 */
function renderDocument(doc, editing) {
    editing = (editing !== null) ? editing : false;

    if (!editing && !doc) {
        return;
    }

    var template = (editing) ? $(selectors.documentEditTemplate).html() : $(selectors.documentTemplate).html();

    // render document template or edit template
    $(selectors.content).html(renderTemplate(template, {
        title: (!doc) ? null : doc.title,
        content: (!doc) ? null : markdown(doc.text),
        text: (!doc) ? null : doc.text
    }));

    if (editing) {
        $(selectors.documentEditTitle).focus();
    }
}

/**
 * Register event handlers
 * Note: This function must called as a bound function.
 */
function bindEvents() {
    $(selectors.libraryItem)
        .unbind('click')
        .on('click', handleItemClick.bind(this));

    $(selectors.createButton)
        .unbind('click')
        .on('click', handleCreateClick.bind(this));

    $(selectors.saveButton)
        .unbind('click')
        .on('click', handleSaveClick.bind(this));

    $(selectors.editButton)
        .unbind('click')
        .on('click', handleEditClick.bind(this));

    $(selectors.cancelButton)
        .unbind('click')
        .on('click', handleCancelClick.bind(this));

    $(selectors.deleteButton)
        .unbind('click')
        .on('click', handleDeleteClick.bind(this));
}

/**
 * Handle click event of library item click
 * Note: This function must called as a bound function.
 * @param {event} e
 */
function handleItemClick(e) {
    e.preventDefault();

    var id = $(e.target).data('document-id');

    if (!id) {
        console.error('No document is associated with library item\'s ID.');
        return;
    }

    this.data.activeID = parseInt(id);
    this.editing = false;
    saveData.bind(this)();

    render.bind(this)();
}

/**
 * Handle 'Create new document...' click. 
 * Note: This function must called as a bound function.
 * @param {Event} e
 */
function handleCreateClick(e) {
    e.preventDefault();

    this.editing = true;
    this.data.activeID = null;

    render.bind(this)();
}

function handleEditClick(e) {
    this.editing = true;
    render.bind(this)();
}

function handleDeleteClick(e) {
    if (!window.confirm('Delete document "' + getActiveDocument.bind(this)().title + '"?')) {
        return;
    }

    deleteDocument.bind(this)(this.data.activeID);
    render.bind(this)();
}

function handleSaveClick(e) {
    e.preventDefault();

    // validate form
    if (!validateForm()) {
        return;
    }

    var id = saveDocument.bind(this)(
        this.data.activeID,
        $(selectors.documentEditTitle).val(),
        $(selectors.documentEditText).val()
    );

    this.data.activeID = id;
    this.editing = false;

    render.bind(this)();
}

function handleCancelClick(e) {
    this.editing = false;

    render.bind(this)();
}

function saveDocument(id, title, text) {
    if (!id) {
        id = this.data.activeID = generateID();
        
        // append the object to this.data
        this.data.documents.push({
            id: id,
            title: title,
            text: text
        });
    } else {
        // iterate through each document
        for (var i=0; i<this.data.documents.length; i++) {
            // if ID matches id parameter, update document data
            if (id === this.data.documents[i].id) {
                this.data.documents[i].title = title;
                this.data.documents[i].text = text;
                break;
            }
        }
    }

    saveData.bind(this)();
    return id;
}

function deleteDocument(id) {
    // iterate through documents
    for (var i=0; i<this.data.documents.length; i++) {
        // if id matches current document's ID, splice it from the array
        if (id === this.data.documents[i].id) {
            this.data.documents.splice(i, 1);
            break;
        }
    }
        
    // if activeID is set to id, nullify activeID
    this.data.activeID = (this.data.activeID === id) ? null : this.data.activeID;
}

/**
 * Return library data from localStorage
 * @return {object} Returns an object containing library data
 */
function getData() {
    if (!localStorage[key] || localStorage[key] === "null") {
        return {
            documents: [],
            activeID: null
        };
    }

    return JSON.parse(localStorage[key]);
}

function saveData() {
    // make sure data is in a valid format
    if (!validateData(this.data)) {
        console.error("Failed to save data. Data is in an invalid format.");
        return false;
    }

    localStorage[key] = JSON.stringify(this.data);

    return true;
}

function validateData(data) {
    // todo: implement this
    // iterate throgh object properties
    // if object doesn't contain 'id', 'title', and 'text' properties, return false
    // return true
    return true;
}

function validateForm() {
    var valid = true;

    $('.invalid').removeClass('invalid');
    
    // iterate through each
    $('[required]').each(function() {
        // apply 'invalid' class if it has no value
        if ($(this).val() === '') {
            $(this).addClass('invalid').attr('placeholder', 'Required').focus();
            valid = false;
        }
    });
    
    return valid;
}

function getActiveDocument() {
    if (!this.data.activeID) {
        return null;
    }

    for (var i=0; i<this.data.documents.length; i++) {
        var document = this.data.documents[i];
        if (document.id === this.data.activeID) {
            return document;
        }
    }
    
    return null;
}

function generateID() {
    return Math.random() * 100000000000000000;
}

module.exports = Library;