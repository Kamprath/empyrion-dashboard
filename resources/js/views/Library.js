var renderTemplate = require('../renderTemplate');

/**
 * Library construtor
 */
function Library() {
    render();
    bindEvents();
}

/**
 * Render the template
 * 
 * @param {object} data Data when rendering the template
 */
function render(data) {
    data = data || {};
    
    $('.content').html(
        renderTemplate($('#library-section-template').html(), data)
    );
}

function bindEvents() {

}

module.exports = Library;