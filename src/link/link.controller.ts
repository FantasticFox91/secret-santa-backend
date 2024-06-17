import { Controller, Get, Query } from '@nestjs/common';
import { LinkService } from './link.service';

@Controller('link')
export class LinkController {
  constructor(private readonly linkService: LinkService) {}

  @Get()
  findAll(@Query('url') url: string) {
    return this.linkService.parseHtml(url);
  }
}
