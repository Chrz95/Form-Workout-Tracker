ALTER TABLE "session_sets" ADD COLUMN "id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "session_sets" ADD CONSTRAINT "session_sets_id_unique" UNIQUE("id");