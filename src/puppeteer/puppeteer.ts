import * as puppeteer from 'puppeteer';

class PuppeteerService {
  public browser: puppeteer.Browser | null = null;
  private page: puppeteer.Page | null = null;

  async init(): Promise<void> {
    this.browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--incognito',
      ],
      headless: true,
    });
  }

  /**
   * Navigates to a specified URL in a new page.
   * @param url - The URL to navigate to.
   */
  async goToPage(url: string): Promise<void> {
    if (!this.browser) {
      await this.init();
    }

    this.page = await this.browser!.newPage();

    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US',
    });

    await this.page.goto(url, {
      waitUntil: 'networkidle0',
    });
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Fetches the latest Instagram posts from a given account.
   * @param acc - The Instagram account username to fetch posts from.
   * @param n - The number of images to fetch.
   * @returns A promise that resolves to an array of image URLs.
   */
  async getLatestInstagramPostsFromAccount(
    acc: string,
    n: number
  ): Promise<string[]> {
    const url = `https://www.picuki.com/profile/${acc}`;
    await this.goToPage(url);

    try {
      let previousHeight = await this.page!.evaluate(
        () => document.body.scrollHeight
      );
      await this.page!.evaluate(() =>
        window.scrollTo(0, document.body.scrollHeight)
      );
      await this.page!.waitForFunction(
        `document.body.scrollHeight > ${previousHeight}`
      );
      await new Promise(r => setTimeout(r, 1000));

      const nodes = await this.page!.evaluate(() => {
        const images =
          document.querySelectorAll<HTMLImageElement>('.post-image');
        return Array.from(images).map(img => img.src);
      });

      return nodes.slice(0, n);
    } catch (error) {
      console.log('Error fetching Instagram posts:', error);
      return [];
    }
  }
}

export const puppeteerService = new PuppeteerService();
