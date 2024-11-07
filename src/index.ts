import { CONFIG } from './config';
import { Rainbow } from './rainbow';
import { puppeteerService } from './puppeteer/puppeteer';

import { parse } from 'rss-to-json';
import * as pug from 'pug';
import * as fs from 'fs';
import { Config, InputData } from './types';

const PUG_MAIN_FILE = './src/main.pug';

const config: Config = CONFIG;

async function getMediumArticles(): Promise<InputData['articles']> {
  const url = `https://medium.com/feed/@${config.mediumArticles.username}`;
  return parse(url).then(data => ({
    articles: data.items.slice(0, config.mediumArticles.numberOfArticles || 5),
  }));
}

async function generateBadges(): Promise<InputData['badges']> {
  const colors = new Rainbow();
  colors.setNumberRange(1, config.badges.list.length);
  colors.setSpectrum(...config.badges.spectrum);

  const formattedBadges = config.badges.list.map((badge, index) => ({
    name: badge.name,
    logo: badge.logo || badge.name.toLowerCase(),
    color: colors.colourAt(index),
  }));

  return Promise.resolve({ badges: formattedBadges });
}

async function getRefreshDate(): Promise<InputData['refreshDate']> {
  const refreshDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'Europe/Stockholm',
  });

  return { refreshDate };
}

async function getGithubData(): Promise<InputData['github']> {
  const data = config.github;
  const enabled =
    data.stats.mostUsedLanguages ||
    data.stats.overallStats ||
    data.highlightedRepos.length > 0;

  const github = {
    ...data,
    enabled,
  };

  return { github };
}

async function getSocialData(): Promise<InputData['social']> {
  const social = config.social.map(item => ({
    ...item,
    logo: item.logo || item.name,
  }));
  return { social };
}

async function getInstagramPosts(): Promise<InputData['instagram']> {
  const instagramImages =
    await puppeteerService.getLatestInstagramPostsFromAccount(
      config.instagram.username,
      config.instagram.numberOfImages || 3
    );

  return { instagram: instagramImages };
}

async function generateReadMe(input: InputData): Promise<void> {
  const compiledHtml = pug.compileFile(PUG_MAIN_FILE, { pretty: true })(input);
  fs.writeFileSync('README.md', compiledHtml);
}

async function perform(): Promise<void> {
  const promises$: Promise<any>[] = [];

  // Medium articles
  if (config.mediumArticles && config.mediumArticles.enabled) {
    promises$.push(getMediumArticles());
  }

  // Badges
  if (config.badges && config.badges.enabled) {
    promises$.push(generateBadges());
  }

  // Refresh date
  promises$.push(getRefreshDate());

  // Github data
  promises$.push(getGithubData());

  // Social data
  promises$.push(getSocialData());

  // Get Instagram images
  if (config.instagram && config.instagram.enabled) {
    promises$.push(getInstagramPosts());
  }

  const input: InputData = (await Promise.all(promises$)).reduce(
    (acc, val) => ({ ...acc, ...val }),
    {}
  );

  if (puppeteerService.browser) {
    puppeteerService.close();
  }

  console.log(`✅ README.md has been successfully built!`);

  await generateReadMe(input);
}

perform();
