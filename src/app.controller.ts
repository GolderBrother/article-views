import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EntityManager } from 'typeorm';
import { User } from './user/entities/user.entity';
import { Article } from './article/entities/article.entity';
import { InjectEntityManager } from '@nestjs/typeorm';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @InjectEntityManager()
  private entityManager: EntityManager;

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('init-data')
  async initData(): Promise<string> {
    console.log('initData');
    await this.entityManager.save(User, {
      username: 'james',
      password: '11111',
    });
    await this.entityManager.save(User, {
      username: 'zhang',
      password: '22222',
    });

    await this.entityManager.save(Article, {
      title: 'title1',
      content: 'content1',
    });

    await this.entityManager.save(Article, {
      title: 'title2',
      content: 'content2',
    });

    return 'success';
  }
}
