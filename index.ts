import { CONFIG } from './config';
import { Rainbow } from './rainbow';

const Feed = require('rss-to-json');
const pug = require('pug');
const fs = require('fs');

const PUG_MAIN_FILE = './main.pug';

async function getMediumArticles() {
  const url = 'https://medium.com/feed/@arjenbrandenburgh';
  return Feed.load(url).then(data => ({
    articles: data.items,
  }));
}

async function generateBadges() {
  const colors = new Rainbow();
  colors.setNumberRange(1, CONFIG.badges.length);
  colors.setSpectrum('311C87', 'DD0031');

  const formattedBadges = CONFIG.badges.map((badge, index) => ({
    name: badge.name,
    logo: badge.logo || badge.name.toLocaleLowerCase(),
    color: colors.colourAt(index),
  }));

  return Promise.resolve({ badges: formattedBadges });
}

async function getRefreshDate() {
  const refreshDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'Europe/Stockholm',
  });

  return Promise.resolve({ refreshDate });
}

async function generateReadMe(input) {
  const compiledHtml = pug.compileFile(PUG_MAIN_FILE, { pretty: true })(input);
  fs.writeFileSync('README.md', compiledHtml);
}

async function perform() {
  let promises = [];

  // Medium articles
  promises.push(getMediumArticles());

  // Badges articles
  promises.push(generateBadges());

  // Refresh date
  promises.push(getRefreshDate());

  const input = await Promise.all(promises).then(data =>
    data.reduce((acc, val) => ({ ...acc, ...val }))
  );

  generateReadMe({ ...input, social: CONFIG.social });
}

perform();
