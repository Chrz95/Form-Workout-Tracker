CREATE TABLE "workout_links" (
	"parent_id" uuid NOT NULL,
	"child_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "workout_links_parent_id_child_id_pk" PRIMARY KEY("parent_id","child_id"),
	CONSTRAINT "workout_link_position" UNIQUE("parent_id","position"),
	CONSTRAINT "workout_link_not_self" CHECK ("workout_links"."parent_id" <> "workout_links"."child_id"),
	CONSTRAINT "workout_link_position_positive" CHECK ("workout_links"."position" >= 0)
);
--> statement-breakpoint
ALTER TABLE "workout_links" ADD CONSTRAINT "workout_links_parent_id_workouts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_links" ADD CONSTRAINT "workout_links_child_id_workouts_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."workouts"("id") ON DELETE restrict ON UPDATE no action;