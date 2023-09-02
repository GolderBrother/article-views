import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { ArticleModule } from '../article/article.module';

@Module({
  providers: [TaskService],
  imports: [ArticleModule],
  exports: [TaskService],
})
export class TaskModule {}
