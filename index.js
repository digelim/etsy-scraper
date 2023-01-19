const fs = require('fs');
const getListingPageDetails = require('./get-listings-page-details.js');

function init() {
	var productsList = fs.readFileSync('products.json.'+process.argv.slice(2));
	var productUrls = JSON.parse(productsList);

	getListingPageDetails(productUrls);
}

init();