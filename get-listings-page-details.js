const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');

axios.defaults.timeout = 5000000;


function getListingPageDetails(productUrls) {
    productUrls.map(async (url) => {
        var data = {
            "type": "variation",
            "sku": url.split('/')[4],
            "category_ids": [],
            "images": [],
        }
        
        axios.get(url,{ headers: { 'x-detected-locale': 'USD|en|US' } } ).then((response)=>{
            if (response && response.data) {
                console.log('true');
                
                var $ = cheerio.load(response.data);
                
                data['images'].push($('.image-carousel-container [data-palette-listing-image]:not(.wt-display-none)').find('img').attr('src'));
                
                
                $('.carousel-pane-list').find('img').each(function(i, item) {
                    if ($(item).attr('data-src')) {
                        data['images'].push($(item).attr('data-src'));
                    }
                });
                
                data['images'] = data['images'].join(',');
                
                data.name = ($('h1[data-buy-box-listing-title]').text().replaceAll('\n', '').trim());
                
                data.regular_price = Number($('[data-buy-box-region="price"]').find('.wt-screen-reader-only + span').text().replace(/[^0-9-]+/g,""))/100;

                if (data.regular_price === 0) {
                    data.regular_price = Number($('[data-buy-box-region="price"] p').text().replace(/[^0-9-]+/g,""))/100;
                }
                
                data.short_description = $('[data-listing-page-item-details-component]').html() ? $('[data-product-details-description-text-content]').html().replaceAll('\n','') : '';
                data.description = $('[data-product-details-description-text-content]').html() ? $('[data-product-details-description-text-content]').html().replaceAll('\n','') : '';
                data.delivery_estimate = ($('[data-estimated-delivery]').find('[data-edd-absolute]').text().trim());
                $('[data-appears-component-name="tags"] .wt-action-group a.wt-action-group__item').each((i, item) => {
                    data.category_ids.push($(item).text().trim());
                });
                
                data.category_ids = data.category_ids.join(',');
                
                var storeData = $('[data-appears-component-name="shop_owners"] a').contents().filter(function(){
                    return this.nodeType == 3;
                });
                
                if (storeData.length > 0) {
                    data.meta_store_name = storeData[0].nodeValue;
                    data.meta_store_url = $('[data-appears-component-name="shop_owners"] a').attr('href');
                    data.meta_store_picture = $('[data-appears-component-name="shop_owners"] img').attr('src');
                }
                
                
                $('[data-selector="listing-page-variations"] > div').each(function(index, element) {
                    var id = index + 1;
                    var name = $(element).find('label').text().trim();
                    
                    if (name && name != '') {
                        data['Attribute ' + id + ' name'] = name;
                        data['Attribute ' + id + ' value(s)']='';

                        $(element).find('option').each(function(j, optionElement) {
                            var option = $(optionElement).text().trim();
                            var separator= '';
                            
                            if (option.indexOf('[Sold out]') < 0) {
                                if (j != $(element).find('option').length - 1) {
                                    separator=',';
                                }
                                
                                if (option && j > 0){
                                    data['Attribute ' + id + ' value(s)'] += option + separator;
                                }
                                
                            }
                        }) ;
                    }
                });
                
                for (var i = $('[data-selector="listing-page-variations"] > div').length + 1; i<=6; i++) {
                    data['Attribute ' + i + ' name'] = '';
                    data['Attribute ' + i + ' value(s)'] = '';
                }
            }
            
            fs.appendFileSync('./out.csv', '\n'+Object.values(data).join(';') );
        });

         return data;
	});

}

module.exports = getListingPageDetails;
