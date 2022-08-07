const getProductsList = async function(urls) {
	var stream = fs.createWriteStream('details.json');
	
	for (var k = 0; k < urls.length; k++) {
		await axios.get(urls[k]).then((response) => {
			var listingPage = response.data;
			var $ = cheerio.load(listingPage);
			var $productsList = $('[data-listings-container] [data-listing-id]');
			
			var productsList = [];
		
			for (var i = 0; i < $productsList.length; i++) {
				var element = $productsList[i];
				var productUrl = $(element).find('a').attr('href');
				
				if (productUrl) {
					productsList.push(productUrl);
				}
			}
			
			var data = JSON.stringify(productsList);
			stream.write(data);
		});
		
	};	

	return JSON.stringify(productsList);
}

module.exports = getProductsList;