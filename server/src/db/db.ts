import { Module } from '@nestjs/common';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

@Module({
  providers: [
    {
      provide: 'db',
      useFactory: async () => {
        return drizzle(process.env.DATABASE_URL);
       
      },
    },
  ],
  exports: ['db'],
})
export class DatabaseModule {}
