CREATE TYPE "public"."RecurringInterval" AS ENUM('weekly', 'monthly', 'yearly', 'daily');--> statement-breakpoint
CREATE TABLE "RecurringPayment" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "RecurringPayment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"amount" integer NOT NULL,
	"note" text,
	"interval" "RecurringInterval" NOT NULL,
	"intervalCount" integer DEFAULT 1 NOT NULL,
	"startDate" timestamp NOT NULL,
	"nextRunAt" timestamp NOT NULL,
	"endDate" timestamp,
	"paused" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_RecurringPaymentToTag" (
	"A" integer NOT NULL,
	"B" integer NOT NULL,
	CONSTRAINT "_RecurringPaymentToTag_A_B_pk" PRIMARY KEY("A","B")
);
--> statement-breakpoint
ALTER TABLE "Payment" ADD COLUMN "recurringPaymentId" integer;--> statement-breakpoint
ALTER TABLE "Payment" ADD COLUMN "confirmed" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "RecurringPayment" ADD CONSTRAINT "RecurringPayment_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_RecurringPaymentToTag" ADD CONSTRAINT "_RecurringPaymentToTag_A_RecurringPayment_id_fk" FOREIGN KEY ("A") REFERENCES "public"."RecurringPayment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_RecurringPaymentToTag" ADD CONSTRAINT "_RecurringPaymentToTag_B_Tag_id_fk" FOREIGN KEY ("B") REFERENCES "public"."Tag"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "RecurringPayment_userId_nextRunAt_idx" ON "RecurringPayment" USING btree ("userId","nextRunAt");--> statement-breakpoint
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_recurringPaymentId_RecurringPayment_id_fk" FOREIGN KEY ("recurringPaymentId") REFERENCES "public"."RecurringPayment"("id") ON DELETE set null ON UPDATE no action;