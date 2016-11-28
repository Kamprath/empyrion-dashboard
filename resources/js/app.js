(function() {
    var TodoSectionView = require('./views/TodoSection'),
        ChecklistsSectionView = require('./views/ChecklistsSection');

    /**
     * Register event handlers.
     * 
     * Note: This method is called after each render, so remember to unbind before re-binding events.
     */
    function bindEvents() {
        // set clicked nav item to active
        $('.nav a')
            .unbind('click')
            .on('click', handleNavClick);
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