import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PuppeteerService {
  async initializeBrowser(options: any = {}) {
    const defaultArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-site-isolation-trials',
      '--disable-features=BlockInsecurePrivateNetworkRequests',
      '--window-size=1920,1080',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ];

    if (options.proxyServer) {
      defaultArgs.push(`--proxy-server=${options.proxyServer}`);
    }

    return puppeteer.launch({
      headless: 'new',
      args: defaultArgs,
      ignoreHTTPSErrors: true,
    });
  }

  async setupPage(page: puppeteer.Page) {
    await page.setViewport({ width: 1920, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });
  }

  async handleCloudflare(page: puppeteer.Page) {
    const cloudflareDetected = await page.evaluate(() => {
      return (
        document.querySelector('#cf-wrapper') !== null ||
        document.title.includes('Attention Required! | Cloudflare')
      );
    });

    if (cloudflareDetected) {
      console.log('CloudFlare detected, waiting for challenge...');
      await page.waitForTimeout(5000);

      await page.waitForFunction(
        () => {
          return (
            document.querySelector('#cf-wrapper') === null &&
            !document.title.includes('Attention Required! | Cloudflare')
          );
        },
        { timeout: 30000 },
      );
    }
  }
}