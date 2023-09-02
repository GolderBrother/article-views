import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';

import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class ArticleService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  @Inject(RedisService)
  private redisService: RedisService;

  create(createArticleDto: CreateArticleDto) {
    return 'This action adds a new article';
  }

  findAll() {
    return `This action returns all article`;
  }

  async findOne(id: number) {
    const article = await this.entityManager.findOneBy(Article, {
      id,
    });
    return article;
  }

  update(id: number, updateArticleDto: UpdateArticleDto) {
    return `This action updates a #${id} article`;
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }

  async view(id: number, userId: number) {
    const redisHashSetKey = `article_${id}`;
    const viewTimeoutHashSetKey = `user_${userId}_article_${id}`;
    const viewTimeout = 10 * 60;
    // 先查询 redis，如果没查到就从数据库里查出来返回，并存到 redis 里。
    const res = await this.redisService.hashGet(redisHashSetKey);
    if (res.viewCount === undefined) {
      const article = await this.findOne(id);
      if (!article) throw new BadRequestException(`文章[${id}]不存在`);

      article.viewCount += 1;
      await this.entityManager.update(
        Article,
        {
          id,
        },
        {
          viewCount: article.viewCount,
        },
      );

      await this.redisService.hashSet(redisHashSetKey, {
        viewCount: article.viewCount,
        likeCount: article.likeCount,
        collectCount: article.collectCount,
      });

      // 在用户访问文章的时候在 redis 存一个 10 分钟过期的标记，有这个标记的时候阅读量不增加。
      await this.redisService.set(viewTimeoutHashSetKey, 1, viewTimeout);
      return article.viewCount;
    } else {
      // 查到了就更新 redis 的 viewCount，直接返回 viewCount + 1
      const isReadInTimeout = await this.redisService.get(
        viewTimeoutHashSetKey,
      );
      console.log('isReadInTimeout', isReadInTimeout);
      if (isReadInTimeout) {
        return res.viewCount;
      }
      const newViewCount = Number(res.viewCount) + 1;
      await this.redisService.hashSet(redisHashSetKey, {
        viewCount: newViewCount,
      });
      await this.redisService.set(viewTimeoutHashSetKey, 1, viewTimeout);
      return newViewCount;
    }
  }

  async flushRedisToDB() {
    const keys = await this.redisService.getKeys('article_*');
    console.log('flushRedisToDB keys', keys);

    for (const key of keys) {
      const res = await this.redisService.hashGet(key);
      if (res) {
        const [, id] = key.split('_');
        await this.entityManager.update(
          Article,
          {
            id: Number(id),
          },
          {
            viewCount: Number(res.viewCount),
          },
        );
      }
    }
  }
}
