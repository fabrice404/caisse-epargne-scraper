# caisse-epargne-scraper [![Codacy Badge](https://api.codacy.com/project/badge/Grade/c457234e003c42428259104f26c112e7)](https://www.codacy.com/app/fabrice404/caisse-epargne-scraper?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=fabrice404/caisse-epargne-scraper&amp;utm_campaign=Badge_Grade)

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
