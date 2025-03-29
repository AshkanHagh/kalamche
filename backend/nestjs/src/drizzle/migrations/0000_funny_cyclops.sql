CREATE TYPE "public"."payment_status_enum" AS ENUM('COMPLETED', 'PENDING', 'FAILED');--> statement-breakpoint
CREATE TABLE "click_plans" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(500) NOT NULL,
	"clicks" integer NOT NULL,
	"price" bigint NOT NULL,
	"price_per_click" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"avatar_url" varchar(300) DEFAULT '#' NOT NULL,
	"password_hash" varchar(300),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_permissions" (
	"permission_id" bigserial NOT NULL,
	"user_id" bigserial NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "login_tokens" (
	"user_id" bigserial PRIMARY KEY NOT NULL,
	"token_hash" varchar(300) NOT NULL,
	"ip" varchar DEFAULT '127.0.0.1',
	"published" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_accounts" (
	"oauth_user_id" varchar(50) NOT NULL,
	"user_id" bigserial NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pending_users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(300),
	"token" varchar(300) NOT NULL,
	"published" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_histories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"click_id" bigserial NOT NULL,
	"user_id" bigserial NOT NULL,
	"amount" bigint NOT NULL,
	"clicks" integer NOT NULL,
	"status" "payment_status_enum" DEFAULT 'PENDING' NOT NULL,
	"transaction_id" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"clicks" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_tokens" ADD CONSTRAINT "login_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_histories" ADD CONSTRAINT "payment_histories_click_id_click_plans_id_fk" FOREIGN KEY ("click_id") REFERENCES "public"."click_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_histories" ADD CONSTRAINT "payment_histories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "payment_histories_click_id_idx" ON "payment_histories" USING btree ("click_id");--> statement-breakpoint
CREATE INDEX "payment_histories_user_id_idx" ON "payment_histories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payment_histories_transaction_id_idx" ON "payment_histories" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "wallets_user_id_idx" ON "wallets" USING btree ("user_id");