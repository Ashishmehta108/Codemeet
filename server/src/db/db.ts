import { Module } from '@nestjs/common';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

@Module({
  providers: [
    {
      provide: 'db',
      useFactory: async () => {
        // return drizzle(process.env.DATABASE_URL);
        return drizzle(
          'postgresql://codemeet_user:HjhK33a4YnWxal7rLFleG4YKNRSxG9v6@dpg-d2cbpd8gjchc73fvnjfg-a/codemeet',
        );
      },
    },
  ],
  exports: ['db'],
})
export class DatabaseModule {}
