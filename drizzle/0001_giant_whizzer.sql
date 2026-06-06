CREATE TABLE "Budget" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Budget_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" integer NOT NULL,
	"startMonth" date NOT NULL,
	"endMonth" date,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_name_unique";--> statement-breakpoint
ALTER TABLE "Tag" ADD COLUMN "color" varchar(32) DEFAULT 'sage' NOT NULL;--> statement-breakpoint
ALTER TABLE "Tag" ADD COLUMN "icon" varchar(64) DEFAULT 'Tag' NOT NULL;--> statement-breakpoint
ALTER TABLE "Tag" ADD COLUMN "budget" integer;--> statement-breakpoint
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_name_unique" UNIQUE("userId","name");