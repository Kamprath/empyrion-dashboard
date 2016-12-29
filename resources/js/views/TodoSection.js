/**
 * Construct the view
 */
function View() {
    render();
    this.bindEvents();
}

function onSortableDrop ($item, container, _super, event) {
    $item.removeClass(container.group.options.draggedClass).removeAttr("style");
    $("body").removeClass(container.group.options.bodyClass);
    
    this.saveTodo();
}

/**
 * Render the view
 */
function render() {
    var sectionTemplate = $('#todo-section-template').html();
    var template = $('#todo-template').html();

    // render section to .content div
    $('.content').html(sectionTemplate);

    // fetch or create todoItems from localStorage
    var items = localStorage.todoItems;

    if (!items) {
        return;
    }

    items = JSON.parse(items);

    // iterate through array items
    for (var i = 0; i < items.length; i++) {
        if (typeof items[i].checked === 'undefined' || typeof items[i].text === 'undefined') {
            continue;
        }

        var $template = $(template);

        // set element text to todo text
        $template.find('input[type=text]').val(items[i].text);

        if (items[i].checked) {
            $template.find('input[type=checkbox]').prop('checked', true);
            $template.addClass('complete');
        }

        $('.todo-list').append($template);

        $('.todo-list').sortable({
            onDrop: onSortableDrop.bind(this)
        });
    }
}

/**
 * Register event handlers
 */
View.prototype.bindEvents = function() {
    // create new todo item element when link is clicked
    $('#create-todo')
        .unbind('click')
        .on('click', this.createTodo.bind(this));

    // remove completed todo items when link is clicked
    $('#clear-todo')
        .unbind('click')
        .on('click', this.clearTodo.bind(this));

    // save todo data when a todo item is changed
    this.bindTodoSave('.todo .input-group input[type=text]', this.saveTodo);

    // toggle 'complete' class on li of todo item that was checked/unchecked
    $('.todo-list input[type=checkbox]')
        .unbind('change')
        .on('change', this.handleTodoCheckClick)
        .on('change', this.saveTodo);
};

/**
 * Append a new todo item element to the list
 * @param {Event} e
 */
View.prototype.createTodo = function(e) {
    e.preventDefault();
        
    var $item = $($('#todo-template').html());

    $('.todo-list').append($item);
    $item.find('input[type=text]').focus();

    this.bindTodoSave('.todo .input-group input', this.saveTodo);

    $('.todo-list input[type=checkbox]').on('change', this.handleTodoCheckClick);
};

/**
 * Clear completed todo items
 * @param {Event} e
 */
View.prototype.clearTodo = function(e) {
    e.preventDefault();

    var $items = $(e.target).parents('.todo').find('.input-group');

    $items.each(function() {
        if ($(this).find('input').prop('checked')) {
            $(this).remove();
        }
    });

    this.saveTodo();
};

/**
 * Handle click event of a todo item check/uncheck
 * @param {Event} e     Event object
 */
View.prototype.handleTodoCheckClick = function(e) {
    var $li = $(e.target).parents('li');

    // if input is checked, add 'complete' class to li
    if ($(e.target).prop('checked')) {
        $li.addClass('complete');
        return;
    }

    // otherwise remove 'complete' from the li
    $li.removeClass('complete');
};

/**
 * Bind change event to save method for specific selector
 */
View.prototype.bindTodoSave = function(selector, fn) {
    $(selector)
        .unbind('change keyup')
        .on('change keyup', fn);
};

/**
 * Save todo item data to localStorage
 */
View.prototype.saveTodo = function() {
    var items = [];

    // iterate through todo items
    var $items = $('.todo .input-group');

    $items.each(function() {
        // get text
        var text = $(this).find('input[type=text]').val();
        
        var item = {
            checked: $(this).find('input[type=checkbox]').prop('checked'),
            text: text
        };

        // append to array
        items.push(item);
    });
    
    // serialize array and write to localStorage
    localStorage.todoItems = JSON.stringify(items);
};

module.exports = View;