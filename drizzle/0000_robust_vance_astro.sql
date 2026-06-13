CREATE TABLE IF NOT EXISTS "Budget" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Budget_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" integer NOT NULL,
	"startMonth" date NOT NULL,
	"endMonth" date,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Oauth_account" (
	"provider" varchar(32) NOT NULL,
	"provider_user_id" varchar(255) NOT NULL,
	"userId" uuid NOT NULL,
	CONSTRAINT "Oauth_account_provider_provider_user_id_pk" PRIMARY KEY("provider","provider_user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Payment" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Payment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" integer NOT NULL,
	"note" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "_PaymentToTag" (
	"A" integer NOT NULL,
	"B" integer NOT NULL,
	CONSTRAINT "_PaymentToTag_A_B_pk" PRIMARY KEY("A","B")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Session" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Tag" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Tag_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"color" varchar(32) DEFAULT 'sage' NOT NULL,
	"icon" varchar(64) DEFAULT 'Tag' NOT NULL,
	"budget" integer,
	"userId" uuid NOT NULL,
	CONSTRAINT "Tag_userId_name_unique" UNIQUE("userId","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255),
	"passwordHash" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_username_unique" UNIQUE("username"),
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Budget_userId_User_id_fk') THEN ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Oauth_account_userId_User_id_fk') THEN ALTER TABLE "Oauth_account" ADD CONSTRAINT "Oauth_account_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_userId_User_id_fk') THEN ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_PaymentToTag_A_Payment_id_fk') THEN ALTER TABLE "_PaymentToTag" ADD CONSTRAINT "_PaymentToTag_A_Payment_id_fk" FOREIGN KEY ("A") REFERENCES "public"."Payment"("id") ON DELETE no action ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '_PaymentToTag_B_Tag_id_fk') THEN ALTER TABLE "_PaymentToTag" ADD CONSTRAINT "_PaymentToTag_B_Tag_id_fk" FOREIGN KEY ("B") REFERENCES "public"."Tag"("id") ON DELETE no action ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Session_userId_User_id_fk') THEN ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action; END IF; END $$;--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Tag_userId_User_id_fk') THEN ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action; END IF; END $$;
