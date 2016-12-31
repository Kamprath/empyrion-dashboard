/**
 * Replace template placeholders with data from corresponding object keys
 * 
 * @param {string} html Template html
 * @param {object} data An object of data containing keys that correspond with 
 *                      template placeholders
 * @returns {string}    Returns a string of rendered HTML
 */
module.exports = function(html, data) {
    // iterate through keys in data
    for (var key in data) {
        data[key] = (data[key] === null) ? '' : data[key];

        // replace occurences of the key with its value
        html = html.replace('{' + key + '}', data[key]);
    }
    
    // return html
    return html;
};