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
    function loadTodo() {
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

            // insert element before 'add...' link
            $('#create-todo').before($template);
        }
    }

    function bindSaveEvent() {
        $('.todo .input-group input')
            .unbind('change')
            .on('change', saveTodo);
    }

    // reset checkboxes and list styles when 'reset' is clicked
    $('.reset').on('click', resetList);

    // apply 'complete' style when a list box is clicked
    $('.list-group-item').on('click', completeItem);

    // don't check checkboxes when clicked because link will handle it
    $('input[type=checkbox]').on('click', function(e) {
        e.preventDefault();
    });

    $('#create-todo').on('click', function(e) {
        e.preventDefault();
        
        var $item =$($('#todo-template').html());

        $(this).before($item);
        $item.find('input[type=text]').focus();
        
        bindSaveEvent();
    });

    $('#clear-todo').on('click', function(e) {
        e.preventDefault();

        var $items = $(this).parents('.todo').find('.input-group');

        $items.each(function() {
            if ($(this).find('input').prop('checked')) {
                $(this).remove();
            }
        });

        saveTodo();
    });

    $(document).ready(function() {
        loadTodo();
        bindSaveEvent();
    });
})();