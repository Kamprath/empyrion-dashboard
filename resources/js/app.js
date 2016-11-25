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
        console.log('saveTodo');
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
        console.log('fucking retarded');
        $(selector)
            .unbind('change keyup')
            .on('change keyup', fn)
    }

    function bindEvents() {
        // reset checkboxes and list styles when 'reset' is clicked
        $('.reset').on('click', resetList);

        // apply 'complete' style when a list box is clicked
        $('.list-group-item').on('click', completeItem);

        // don't check checkboxes when clicked because link will handle it
        $('.list-group-item input[type=checkbox]').on('click', function(e) {
            e.preventDefault();
        });

        // create new todo item element when link is clicked
        $('#create-todo').on('click', createTodo);

        // remove completed todo items when link is clicked
        $('#clear-todo').on('click', clearTodo);

        // save todo data when a todo item is changed
        bindTodoSave('.todo .input-group input', saveTodo);
    }

    /**
     * Render checklists from data
     */
    function renderChecklists(data) {
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

    $(document).ready(function() {
        // render todo items from localStorage
        renderTodo();

        // render checklists from JSON data
        renderChecklists(
            JSON.parse($('#checklist-json').html())
        );

        // bind events
        bindEvents();
    });
})();