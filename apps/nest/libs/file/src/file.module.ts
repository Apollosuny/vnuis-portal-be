import { Module } from '@nestjs/common';
import { SimpleAuthModule } from '@app/core/modules/simple-auth/simple-auth.module';
import { FileController } from './controllers/file.controller';
import { FileService } from './services/file.service';

@Module({
  imports: [SimpleAuthModule],
  providers: [FileService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}
