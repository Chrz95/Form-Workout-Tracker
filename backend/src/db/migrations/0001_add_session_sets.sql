CREATE TABLE "session_sets" (
	"session_id" uuid NOT NULL,
	"exercise_id" text NOT NULL,
	"position" integer NOT NULL,
	"reps" integer NOT NULL,
	"weight" numeric NOT NULL,
	"rpe" numeric,
	"kind" text DEFAULT 'working' NOT NULL,
	CONSTRAINT "session_sets_session_id_exercise_id_position_pk" PRIMARY KEY("session_id","exercise_id","position"),
	CONSTRAINT "session_set_valid" CHECK ("session_sets"."reps" > 0 AND "session_sets"."weight" >= 0 AND "session_sets"."position" >= 0),
	CONSTRAINT "session_set_rpe_valid" CHECK ("session_sets"."rpe" IS NULL OR ("session_sets"."rpe" >= 1 AND "session_sets"."rpe" <= 10)),
	CONSTRAINT "session_set_kind_valid" CHECK ("session_sets"."kind" IN ('working', 'warmup'))
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "submission_id" uuid;--> statement-breakpoint
ALTER TABLE "session_sets" ADD CONSTRAINT "session_sets_session_id_exercise_id_session_items_session_id_exercise_id_fk" FOREIGN KEY ("session_id","exercise_id") REFERENCES "public"."session_items"("session_id","exercise_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_submission_id_unique" UNIQUE("submission_id");