const Handlebars = require('handlebars');

// Format date helper
Handlebars.registerHelper('formatDate', function(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
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

Handlebars.registerHelper('indexPlusOne', function(index) {
    return index + 1;
})

// Calculate breakdown of charges for Cons view
Handlebars.registerHelper('calculateBreakdown', function(consumption) {
    const rates = [
        { limit: 10, rate: 23.00, key: '1st10' },
        { limit: 10, rate: 28.00, key: 'Next10' },
        { limit: 20, rate: 52.00, key: 'Next20' },
        { limit: 20, rate: 69.00, key: 'Next20_2' },
        { limit: 20, rate: 80.00, key: 'Next20_3' }
    ];

    let remainingConsumption = consumption;
    let charges = {
        "1st10": 0,
        "Next10": 0,
        "Next20": 0,
        "Next20_2": 0,
        "Next20_3": 0
    };

    rates.forEach(rate => {
        if (remainingConsumption > 0) {
            let chargeAmount = Math.min(remainingConsumption, rate.limit) * rate.rate;
            charges[rate.key] = chargeAmount;
            remainingConsumption -= rate.limit;
        }
    });

    return charges;
})

// get sum of cols
Handlebars.registerHelper('sum', function (field, items) {
    return items.reduce((total, item) => total + item[field], 0);
  });

// format billing period dates
Handlebars.registerHelper('formatBillingPeriod', function(period) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    let [start, end] = period.split('-');
    start = new Date(start).toLocaleDateString(undefined, options);
    end = new Date(end).toLocaleDateString(undefined, options);
    return `${start} - ${end}`;
});

Handlebars.registerHelper('isGreaterThanZero', function(value, options) {
    if (value > 0) {
      return options.fn(this); // Execute the block if the value is greater than 0
    } else {
      return options.inverse(this); // Execute the inverse block if the value is not greater than 0
    }
});