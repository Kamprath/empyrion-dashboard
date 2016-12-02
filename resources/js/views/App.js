'use strict';

var TodoSectionView = require('./TodoSection'),
    ChecklistsSectionView = require('./ChecklistsSection');

/**
 * A mapping of nav item IDs to the views that correspond with their sections
 */
var navViews = {
    'nav-todo': TodoSectionView,
    'nav-checklists': ChecklistsSectionView
};

/**
 * App constructor
 */
function App() {
    this.render();
    this.bindEvents(); 
    this.applyBlack();
}

/**
 * Apply '.black' class to body if '?black' URL param exists
 */
App.prototype.applyBlack = function() {
    if (window.location.href.indexOf("black") >= 0) {
        $('body').addClass('black');
    }
};

/**
 * Register event handlers
 */
App.prototype.bindEvents = function() {
    // set clicked nav item to active
    $('.nav a')
        .unbind('click')
        .on('click', this.handleNavClick.bind(this));
};

/**
 * Render the template that corresponds to the active nav item
 */
App.prototype.render = function() {
    $('.content').html(null);

    var $item = $('.nav .active');

    if (!$item) {
        return false;
    }

    var id = $item.attr('id');
    var view = navViews[id];

    // return if template doesn't exist or is not mapped to a function
    if (!view || !navViews.hasOwnProperty(id) || typeof navViews[id] !== 'function') {
        console.error('No valid view is associated with nav item ID.');
        return false;
    }

    // initialize the view
    new view();

    return true;
};

/**
 * Handle click event of a navbar button
 * @param {Event} e     Event object
 */
App.prototype.handleNavClick = function(e) {
    e.preventDefault();

    $('.nav .active').removeClass('active');
    $(e.target).parents('li').addClass('active');

    this.render();
};

module.exports = App;