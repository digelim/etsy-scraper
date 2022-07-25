const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();
const cors = require('cors')
app.use(cors());

const url = 'https://www.etsy.com/listing/1053294220/linen-harem-pants-janis-linen-yoga-pants?ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=Meditation&ref=sc_gallery-1-3&sts=1&plkey=d4133cc9ebff2d8961b3a7d67eaab8b8a42cd773%3A1053294220';

const data = {}

app.get('/', function (req, res) {
    res.json('.')
})

app.get('/data', (req, res) => {
    axios(url)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);

            const images = [];

               $('.carousel-pane-list').find('img').each(function(i, item) {
                   var src = item.attribs['data-src'] ? item.attribs['data-src'] : item.attribs['src'];
                    images.push(src);
              });

              data.images = (images);
              
              data.title = ($('h1').text().replace('\n', '').trim());
              
              
              data.price = ($('[data-buy-box]').find('[data-buy-box-region="price"]').find('p').first().text().replace('\n', '').trim());
              
                
                data.saleOriginalPrice = ($('[data-buy-box]').find('[data-buy-box-region="price"]').find('p').first().next().contents()
                    .get()
                    .map(function(n) { return n.nodeType === 3 && n.textContent ? n.textContent.trim() : ''; })
                    .join(''));

                data.isOnSale = data.saleOriginalPrice !== '';
              
              
              
                var attributes = [];
              
                $('[data-selector="listing-page-variations"] > div').each(function(i, element) {
                    // Attribute label
                  attributes[i] = { 
                      label: $(element).find('label').text().trim(),
                      options: []
                  }
              
                    $(element).find('option').each(function(j, option){
                      var name = $(option).text().trim();
                      var value = $(option).val();
                      var inStock = name.indexOf('[Sold out]') < 0;
                      name = name.replace(' [Sold out]', '');
              
                      attributes[i].options[j] = {
                          value,
                          name,
                          inStock
                      };
                   }) ;
                });

                data.attributes = (attributes);
              
              
              data.featuredImage = ($('.image-carousel-container [data-palette-listing-image]:not(.wt-display-none)').find('img').attr('src'));
                  
                  
              
              data.description = ($('[data-product-details-description-text-content]').html());  
              
              data.deliveryEstimate = ($('[data-estimated-delivery]').find('[data-edd-absolute]').text())
              
              data.shippingCost = ($('[data-estimated-shipping]').find('p').text())
              
              data.shippingFrom = ($('[data-shipping-variant-div] .wt-grid__item-xs-12.wt-text-black.wt-text-caption')[0].innerText)
              
              data.inStock = ($('[data-buy-box-region="stock_indicator"]').find('strong').text())
console.log(data);
            res.json(data);
			res.send(data);
			res.end('Done');

        }).catch(err => console.log(err))

})

app.listen(3000, () => {
  console.log('App listening on port 3000');
});

