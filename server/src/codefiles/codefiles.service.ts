import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CodefilesService {
    @Inject("db") private readonly database:NodePgDatabase
    constructor(private readonly userService: UserService) { }


    async updateFile(file: string, fileName: string, sender: string) {


    }
}
