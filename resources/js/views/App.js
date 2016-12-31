var TodoSectionView = require('./TodoSection'),
    ChecklistsSectionView = require('./ChecklistsSection'),
    LibraryView = require('./Library');

/**
 * A mapping of nav item IDs to the views that correspond with their sections
 */
var navViews = {
    'nav-todo': TodoSectionView,
    'nav-checklists': ChecklistsSectionView,
    'nav-library': LibraryView
};

/**
 * App constructor
 */
function App() {
    activateLastViewed();
    this.render();
    this.bindEvents(); 
    applyBlack();
}

/**
 * Set .active on navigation link that was last visited
 * 
 * The last-visited navigation link is stored in localStorage.
 */
function activateLastViewed() {
    var lastViewedID = getLastViewed();
    var $lastViewedNav = $('#' + lastViewedID);

    if (!lastViewedID || !$lastViewedNav.length) {
        return;
    }

    $('.active').removeClass('active');
    $lastViewedNav.addClass('active');
}

/**
 * Store ID of active nav item in localStorage
 */
function setLastViewed(id) {
    localStorage.section = id;
}

function getLastViewed() {
    return localStorage.section;
}

/**
 * Apply '.black' class to body if '?black' URL param exists
 */
function applyBlack() {
    if (window.location.href.indexOf("black") >= 0) {
        $('body').addClass('black');
        $('.navbar-brand').attr('href', 'index.html');
    }
}

/**
 * Register event handlers
 */
App.prototype.bindEvents = function() {    
    // set clicked nav item to active
    $('.nav li[id] a')
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

    // get ID of selected nav item and get the view associated with it
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

    setLastViewed(
        $('.nav .active').attr('id')
    );

    this.render();
};

module.exports = App;