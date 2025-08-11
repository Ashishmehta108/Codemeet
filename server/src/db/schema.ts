import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  userId: varchar('userId', { length: 255 }).notNull().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  refreshToken: varchar('refreshToken', { length: 255 }),
  socketId: varchar('socketId', { length: 255 }),
});

export const roomUsersTable = pgTable('room_users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  roomId: varchar('room_id', { length: 255 })
    .notNull()
    .references(() => roomTable.roomId),
  userId: varchar('userId', { length: 255 })
    .notNull()
    .references(() => usersTable.userId),
  socketId: varchar('socketId', { length: 255 }).notNull(),
});

export const roomTable = pgTable('room', {
  roomId: varchar('roomId', { length: 255 }).notNull().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: varchar('createdAt', { length: 255 }).notNull(),
});
