const cheerio = require('cheerio');
const moment = require('moment');
const { Builder, By, until } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');

const defaultConfig = {
  url: 'https://www.caisse-epargne.fr/bretagne-pays-de-loire/particuliers',
  browser: 'chrome',
  // devtools: true,
};

module.exports = {
  get: async (_config) => {
    const config = Object.assign(defaultConfig, _config);
    let driver;
    if (config.devtools) {
      const chromeOptions = new Options();
      chromeOptions.addArguments('--no-sandbox');
      chromeOptions.addArguments('--disable-setuid-sandbox');
      chromeOptions.addArguments('--auto-open-devtools-for-tabs');
      driver = new Builder()
        .forBrowser(config.browser)
        .setChromeOptions(chromeOptions)
        .build();
    } else {
      driver = new Builder()
        .forBrowser(config.browser)
        .build();
    }

    const getElement = async (selector) => {
      const by = selector.startsWith('/') ? By.xpath(selector) : By.id(selector);
      await driver.wait(until.elementLocated(by));
      return driver.wait(until.elementIsVisible(driver.findElement(by)));
    };

    const getContent = async (selector) => {
      const element = await getElement(selector);
      return element.getAttribute('innerHTML');
    };

    const getAmountFromText = (text) => parseFloat(text.replace(/,/g, '.').replace(/[^0-9.-]/g, ''));

    const click = async (selector) => {
      const element = await getElement(selector);
      await element.click();
    };

    const loaderVisibility = async () => new Promise((resolve, reject) => {
      const xpath = '//div[contains(@class, "loaderServeur")]';
      driver.wait(until.elementLocated(By.xpath(xpath))).then(() => {
        driver.findElement(By.xpath(xpath)).getCssValue('display')
          .then((display) => {
            if (display === 'block') {
              setTimeout(() => { loaderVisibility().then(resolve); }, 100);
            } else {
              resolve();
            }
          })
          .catch(reject);
      });
    });

    const result = [];
    // navigate to url
    await driver.get(config.url);

    // click button 'Accès aux comptes'
    click('//a[contains(@class, "icon-bpce-profil")]');

    // wait for login button visibility
    await getElement('//div[contains(@class, "modal-body")]//form[contains(@class, "identification-form")]/button[@type="submit"]');

    // sleep for half a second because login input is cleared by javascript after modal opening
    await driver.sleep(500);

    // set login input value
    await driver.executeScript((login) => {
      document.getElementById('idClient').value = login;
    }, config.login);

    await driver.sleep(200);

    // click login button
    click('//div[contains(@class, "modal-body")]//form[contains(@class, "identification-form")]/button[@type="submit"]');

    await driver.sleep(200);

    // wait for keypad visibility
    await getElement('//div[contains(@class, "type-password") and contains(@class, "in")]/form/div[contains(@class, "affClavierSecurise")]');

    await driver.sleep(200);

    // set password input value
    await driver.executeScript(() => {
      document.getElementById('input_password_accessibility').parentElement.style.display = 'block';
      document.getElementById('codconfstar').parentElement.style.display = 'none';
      document.getElementById('clavierSecurise').value = 0;
    });

    await driver.sleep(500);

    const keys = config.password.split('');
    for (let i = 0; i < keys.length; i += 1) {
      click(`//div[contains(@class, "affClavierClassique")]/ul[contains(@class, "password-keyboard")]/li[@data-passkey="${keys[i]}"]`);
      await driver.sleep(100);
    }

    await driver.sleep(200);

    // click password button
    click('//div[contains(@class, "type-password") and contains(@class, "in")]/form/div[contains(@class, "affClavierClassique")]/div/button[@type="submit"]');

    // list accounts
    const accountIds = [];
    const content = await getContent('//div[@id="MM_ContentMain"]');
    let $ = cheerio.load(content);

    $('.rowClick a[target="_self"]').each((i, a) => {
      accountIds.push($(a).parent().text().trim());
    });

    for (let index = 0; index < accountIds.length; index += 1) {
      const id = accountIds[index];

      // click account button
      await getElement(`//td[text()="${id}"]`);
      click(`//td[text()="${id}"]`);

      // wait while loader is visible
      await loaderVisibility();

      await getContent('//span[contains(@class, "bigFont")]');

      const mainElement = await getContent('//div[@id = "MM_ContentMain"]');

      $ = cheerio.load(mainElement);
      const balance = getAmountFromText($('#MM_HISTORIQUE_COMPTE .somme .bigFont').text());
      const done = [];
      $('table.msi-table tr.rowClick').each((i, row) => {
        done.push({
          date: moment($(row).children().eq(0).text(), ['dddd, Do MMMM YY', 'DD/MM/YYYY', 'x'])
            .format('YYYY-MM-DD'),
          name: $(row).children().eq(1).text(),
          amount: getAmountFromText($(row).children().eq(2).text()
            + $(row).children().eq(3).text()),
        });
      });

      await driver.sleep(500);

      // click button MA SYTHESE
      await getElement('//a[contains(@href, "CPTSYNT0")]');
      click('//a[contains(@href, "CPTSYNT0")]');

      // wait while loader is visible
      await loaderVisibility();

      result.push({
        name: id,
        balance,
        available: balance,
        transactions: { done, pending: [] },
      });
    }

    if (!config.keepItOpen) {
      driver.quit();
    }
    return result;
  },
};
