CREATE TABLE "room" (
	"roomId" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"createdAt" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "room_users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"room_id" varchar(255) NOT NULL,
	"userId" varchar(255) NOT NULL,
	"socketId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"userId" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"refreshToken" varchar(255),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "room_users" ADD CONSTRAINT "room_users_room_id_room_roomId_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("roomId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_users" ADD CONSTRAINT "room_users_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE no action ON UPDATE no action;