'use strict';

var renderTemplate = require('../renderTemplate'),
    data = require('../../data/checklists.json');

function View() {
    this.render();
    this.bindEvents();
}

View.prototype.bindEvents = function() {
    // reset checkboxes and list styles when 'reset' is clicked
    $('.reset')
        .unbind('click')
        .on('click', this.resetList);

    // apply 'complete' style when a list box is clicked
    $('.list-group-item')
        .unbind('click')
        .on('click', this.completeItem);

    // don't check checkboxes when clicked because link will handle it
    $('.list-group-item input[type=checkbox]')
        .unbind('click')
        .on('click', function(e) {
            e.preventDefault();
        });
};

/**
 * Toggle styles indicating a completed item when list box is clicked
 */
View.prototype.completeItem = function(e) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    
    var $input = $(this).find('input');
    var isChecked = $input.prop('checked'); 

    $(this).toggleClass('disabled');
    $input.prop('checked', !isChecked);
}

/**
 * Render checklists from data
 */
View.prototype.render = function() {
    var checklistTemplate = $('#checklist-template').html(),
        checklistItemTemplate = $('#checklist-item-template').html(),
        checklistSectionTemplate = $('#checklists-section-template').html();

    $('.content').html(checklistSectionTemplate);

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
 * Reset checklist items to unchecked
 * @param {Event} e
 */
View.prototype.resetList = function(e) {
    e.preventDefault();

    var $items = $(this).parents('.list-group')
        .find('.list-group-item');

    $items.each(function() {
        $(this).removeClass('disabled');
        $(this).find('input').prop('checked', false);
    });
}

module.exports = View;