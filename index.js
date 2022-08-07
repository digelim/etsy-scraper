const fs = require('fs');
const getListingPageDetails = require('./get-listings-page-details.js');

function init() {
	var productsList = fs.readFileSync('products.json');
	var productUrls = JSON.parse(productsList);

	getListingPageDetails(productUrls).then(() => {}).catch((error) => {
		console.log(error);
	});
}

init();