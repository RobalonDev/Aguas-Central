import { Module } from '@nestjs/common';
import { DataBaseService } from './database.service';

@Module({
  controllers: [],
  providers: [DataBaseService],
  imports: [],
  exports: [DataBaseService],
})
export class DatabaseModule {}
