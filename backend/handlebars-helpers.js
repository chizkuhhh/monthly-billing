const Handlebars = require('handlebars');

// Format date helper
Handlebars.registerHelper('formatDate', function(date) {
    return new Date(date).toLocaleDateString();
});

// Add helper
Handlebars.registerHelper('add', function(a, b) {
    return a + b;
});

// Subtract helper
Handlebars.registerHelper('subtract', function(a, b) {
    return a - b;
});

// Helper to truncate text
Handlebars.registerHelper('truncate', function (text, length) {
    if (text.length > length) {
        return text.substring(0, length) + '...';
    } else {
        return text;
    }
});

// helper for finding string similarity
Handlebars.registerHelper('eq', function(a, b) {
    return a === b;
});

Handlebars.registerHelper('or', function() {
    // Convert arguments object to array
    const args = Array.prototype.slice.call(arguments, 0, -1);
    
    // Iterate through arguments and return true if any are truthy
    for (let i = 0; i < args.length; i++) {
        if (args[i]) {
            return true;
        }
    }
    
    // If none are truthy, return false
    return false;
});
