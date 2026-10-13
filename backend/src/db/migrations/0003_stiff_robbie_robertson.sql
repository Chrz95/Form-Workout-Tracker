CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"workout_id" uuid,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_workout_date_unique" UNIQUE("workout_id","date")
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "name_key" text;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_name_key_unique" UNIQUE("name_key");