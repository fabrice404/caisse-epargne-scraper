# caisse-epargne-scraper

Download balance and latest transactions from Caisse d'Epargne's website.

## Getting Started

### Prerequisites

To run this module, you will need to download the latest chrome driver [here](http://chromedriver.storage.googleapis.com/index.html).

### Usage

```javascript
const caisseEpargne = require('caisse-epargne-scraper');

const result = await caisseEpargne.get({
  login:    'YOUR LOGIN',
  password: 'YOUR PASSWORD',
});
```

## Built With

  * [Selenium](https://www.npmjs.com/package/selenium-webdriver): browser automation library
  * [Cheerio](https://www.npmjs.com/package/cheerio): jQuery implementation in Node.js

## License

This project is licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0)
