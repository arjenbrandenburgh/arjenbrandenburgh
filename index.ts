import { CONFIG } from './config';
import { Rainbow } from './rainbow';
import { puppeteerService } from './puppeteer/puppeteer';

import * as Feed from 'rss-to-json';
import * as pug from 'pug';
import * as fs from 'fs';

const PUG_MAIN_FILE = './main.pug';

async function getMediumArticles() {
  const url = `https://medium.com/feed/@${CONFIG.mediumArticles.username}`;
  return Feed.load(url).then(data => ({
    articles: data.items.slice(0, CONFIG.mediumArticles.numberOfArticles || 5),
  }));
}

async function generateBadges() {
  const colors = new Rainbow();
  colors.setNumberRange(1, CONFIG.badges.list.length);
  colors.setSpectrum(...CONFIG.badges.spectrum);

  const formattedBadges = CONFIG.badges.list.map((badge, index) => ({
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

async function getGithubUser() {
  const github = CONFIG.social.find(item => item.name === 'Github');

  return Promise.resolve({ github });
}

async function getInstagramPosts() {
  const instagramImages = await puppeteerService.getLatestInstagramPostsFromAccount(
    CONFIG.instagram.username,
    CONFIG.instagram.numberOfImages || 3
  );

  return Promise.resolve({ instagram: instagramImages });
}

async function generateReadMe(input) {
  const compiledHtml = pug.compileFile(PUG_MAIN_FILE, { pretty: true })(input);
  fs.writeFileSync('README.md', compiledHtml);
}

async function perform() {
  let promises = [];

  // Medium articles
  if (CONFIG.mediumArticles && CONFIG.mediumArticles.enabled) {
    promises.push(getMediumArticles());
  }

  // Badges
  if (CONFIG.badges && CONFIG.badges.enabled) {
    promises.push(generateBadges());
  }

  // Refresh date
  promises.push(getRefreshDate());

  // Github user from social
  promises.push(getGithubUser());

  // Get Instagram images
  if (CONFIG.instagram && CONFIG.instagram.enabled) {
    promises.push(getInstagramPosts());
  }

  const input = await Promise.all(promises).then(data =>
    data.reduce((acc, val) => ({ ...acc, ...val }))
  );

  if (puppeteerService.browser) {
    puppeteerService.close();
  }

  console.log(`✅ README.md has been succesfully built!`);

  generateReadMe({ ...input, social: CONFIG.social });
}

perform();
