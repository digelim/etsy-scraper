const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');
const sanitizeFileName = require('./sanitizer.js');

axios.defaults.timeout = 5000000;

const getListingPageDetails = async function(productUrls) {
	var output = [];
	
	productUrls.forEach(async (url) => {
		var response = await axios.get(url).catch((error) => {console.log(error)});
		
		if (response && response.data) {
		var data = {};
		var $ = cheerio.load(response.data);

		data.images = [ { src: $('.image-carousel-container [data-palette-listing-image]:not(.wt-display-none)').find('img').attr('src') } ];

		$('.carousel-pane-list').find('img').each(function(i, item) {			
			data.images.push({ src: item.attribs['data-src'] ? item.attribs['data-src'] : item.attribs['src'] });
		});
		
		data.title = ($('h1').text().replace('\n', '').trim());
		data.price = ($('[data-buy-box]').find('[data-buy-box-region="price"]').find('p').first().text().replace(/^\s+|\s+$/g, '').trim());
		data.saleOriginalPrice = ($('[data-buy-box]').find('[data-buy-box-region="price"]').find('p').first().next().contents()
								  .get()
								  .map((n) => { 
									return n.nodeType === 3 && n.textContent ? n.textContent.trim() : '';
								  })
								  .join(''));

		data.isOnSale = data.saleOriginalPrice !== '';

		data.attributes = [];
		data.variations = [];

		$('[data-selector="listing-page-variations"] > div').each(function(index, element) {
			var id = index + 1;
			var name = $(element).find('label').text().trim();
			data.attributes[id] = { 
				id,
				visible: true,
				variation: true,
				name,
				options: []
			}

			$(element).find('option').each(function(j, optionElement) {
				var option = $(optionElement).text().trim().replace(' [Sold out]', '');
				
				data.attributes[id].options[j] = option;
				
				//var value = $(optionElement).val();
				var price = $(optionElement).text().trim().match('.*\ \.((.*).\)').pop();
				price = Number(price.replace(/[^0-9-]+/g,""))/100;
				
				if (id > 1) {
				
					var variation = {
					  "price": price,
					  "regular_price": price,
					  "sale_price": "",
					  "on_sale": false,
					  "manage_stock": true,
					  "stock_quantity": null,
					  "stock_status": name.indexOf('[Sold out]') < 0 ? 'instock' : false,
					  "attributes": []
					};

					variation.attributes.push({
						  id,
						  name,
						  option
						});

					data.variations.push(variation);	
				}
			}) ;
		});

		data.highlights = $('[data-listing-page-item-details-component]').html();
		data.description = ($('[data-product-details-description-text-content]')).html();  
		data.deliveryEstimate = ($('[data-estimated-delivery]').find('[data-edd-absolute]').text().trim());
		data.inStock = ($('[data-buy-box-region="stock_indicator"]').find('strong').text());
		data.categories = [];
		$('[data-appears-component-name="tags"] .wt-action-group a.wt-action-group__item').each((i, item) => {
			data.categories.push($(item).text().trim());
		});
		
		var storeData = $('[data-appears-component-name="shop_owners"] a').contents().filter(function(){ 
			return this.nodeType == 3; 
		});
		
		if (storeData.length > 0) {
			data.storeName = storeData[0].nodeValue;
			data.storeUrl = $('[data-appears-component-name="shop_owners"] a').attr('href');
			data.storePicture = $('[data-appears-component-name="shop_owners"] img').attr('src');
		}
		
		output.push(data);
		
		fs.writeFileSync('details/' + sanitizeFileName(data.title) + '.json',  JSON.stringify(data));
		}
	});
	
	return 200;
}

module.exports = getListingPageDetails;