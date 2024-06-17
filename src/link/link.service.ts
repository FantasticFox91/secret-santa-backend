import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LinkService {
  async parseHtml(url: string) {
    try {
      const response = await axios.get(
        `https://api.ozon.ru/composer-api.bx/page/json/v2?url=${url}`,
      );
      const html = JSON.parse(response.data.seo.script[0].innerHTML);
      const site = new URL(url).hostname.replace('www.', '');
      const title = html.name;
      const description = html.description;
      const image = html.image;

      return { title, description, image, site };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to parse HTML');
    }
  }
}
