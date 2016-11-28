(function() {
    /**
     * Toggle styles indicating a completed item when list box is clicked
     */
    function completeItem(e) {
        if (e) {
            e.stopPropagation();
        }
        
        var $input = $(this).find('input');
        var isChecked = $input.prop('checked'); 

        $(this).toggleClass('disabled');
        $input.prop('checked', !isChecked);
    }

    function resetList(e) {
        e.preventDefault();

        var $items = $(this).parents('.list-group')
            .find('.list-group-item');

        $items.each(function() {
            $(this).removeClass('disabled');
            $(this).find('input').prop('checked', false);
        });
    }

    /**
     * Save todo items to localStorage
     */
    function saveTodo() {
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
    }

    /**
     * Retrieve todo data from storage and populate list
     */
    function renderTodo() {
        // render section to .content div
        var sectionTemplate = $('#todo-section-template').html();
        $('.content').html(sectionTemplate);

        var template = $('#todo-template').html();

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

            // get template markup
            var $template = $(template);

            // set element text to todo text
            $template.find('input[type=text]').val(items[i].text);
            $template.find('input[type=checkbox]').prop('checked', items[i].checked);

            $('.todo-list').append($template);

            $('.todo-list').sortable({
                onDrop: function ($item, container, _super, event) {
                    $item.removeClass(container.group.options.draggedClass).removeAttr("style");
                    $("body").removeClass(container.group.options.bodyClass);
                    
                    saveTodo();
                }
            });
        }
    }

    /**
     * Replace template placeholders with data from corresponding object keys
     * 
     * @param {string} html Template html
     * @param {object} data An object of data containing keys that correspond with 
     *                      template placeholders
     * @returns {string}    Returns a string of rendered HTML
     */
    function renderTemplate(html, data) {
        // iterate through keys in data
        for (var key in data) {
            // replace occurences of the key with its value
            html = html.replace('{' + key + '}', data[key]);
        }
        
        // return html
        return html;
    }

    function createTodo(e) {
        e.preventDefault();
            
        var $item =$($('#todo-template').html());

        $('.todo-list').append($item);
        $item.find('input[type=text]').focus();

        bindTodoSave('.todo .input-group input', saveTodo);
    }

    function clearTodo(e) {
        e.preventDefault();

        var $items = $(this).parents('.todo').find('.input-group');

        $items.each(function() {
            if ($(this).find('input').prop('checked')) {
                $(this).remove();
            }
        });

        saveTodo();
    }

    function bindTodoSave(selector, fn) {
        $(selector)
            .unbind('change keyup')
            .on('change keyup', fn)
    }

    /**
     * Register event handlers.
     * 
     * Note: This method is called after each render, so remember to unbind before re-binding events.
     */
    function bindEvents() {
        // reset checkboxes and list styles when 'reset' is clicked
        $('.reset')
            .unbind('click')
            .on('click', resetList);

        // apply 'complete' style when a list box is clicked
        $('.list-group-item')
            .unbind('click')
            .on('click', completeItem);

        // don't check checkboxes when clicked because link will handle it
        $('.list-group-item input[type=checkbox]')
            .unbind('click')
            .on('click', function(e) {
                e.preventDefault();
            });

        // create new todo item element when link is clicked
        $('#create-todo')
            .unbind('click')
            .on('click', createTodo);

        // remove completed todo items when link is clicked
        $('#clear-todo')
            .unbind('click')
            .on('click', clearTodo);

        // save todo data when a todo item is changed
        bindTodoSave('.todo .input-group input', saveTodo);

        // set clicked nav item to active
        $('.nav a')
            .unbind('click')
            .on('click', handleNavClick);
    }

    /**
     * Render checklists from data
     */
    function renderChecklists() {
        var checklistSectionTemplate = $('#checklists-section-template').html();
        $('.content').html(checklistSectionTemplate);

        var data = JSON.parse($('#checklist-json').html());
        var checklistTemplate = $('#checklist-template').html();
        var checklistItemTemplate = $('#checklist-item-template').html();

        for (var title in data) {
            // create a new element to contain checklist
            var $checklist = $(
                renderTemplate(checklistTemplate, {'title': title})
            );

            // render template for each item and append to checklist element
            for (var i in data[title]) {
                // set 'number' field in item data
                data[title][i].number = parseInt(i) + 1;

                var itemHtml = renderTemplate(
                    checklistItemTemplate, data[title][i]
                );

                $checklist.append(
                    $(itemHtml)
                );
            }

            // append checklist element to .checklists element
            $('.checklists').append($checklist);
        }
    }

    /**
     * Render the template that corresponds to the active nav item
     */
    function render() {
        $('.content').html(null);

        var $item = $('.nav .active');

        if (!$item) {
            return false;
        }

        //get item's data-template-id attribute
        var templateID = $item.attr('data-template-id');

        var $template = $('#' + templateID) ? $('#' + templateID).html() : null;

        // return if template doesn't exist or is not mapped to a function
        if (!$template || !templates.hasOwnProperty(templateID) || typeof templates[templateID] !== 'function') {
            return false;
        }

        // call rendering function that is mapped to the template ID
        templates[templateID]();

        // re-bind events after render
        bindEvents();

        return true;
    }

    /**
     * Handle click event of a navbar button
     * @param {Event} e     Event object
     */
    function handleNavClick(e) {
        e.preventDefault();

        $('.nav .active').removeClass('active');
        $(e.target).parents('li').addClass('active');

        render();
    }

    /**
     * A mapping of template IDs to the functions that render each
     */
    var templates = {
        'todo-section-template': renderTodo,
        'checklists-section-template': renderChecklists
    };

    $(document).ready(function() {
        // render section that corresponds with selected nav item
        render();
    });
})();