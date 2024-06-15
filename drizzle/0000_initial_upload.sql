CREATE TABLE IF NOT EXISTS "profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"selected" boolean DEFAULT false NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "profile_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jwt" text NOT NULL,
	"valid" boolean DEFAULT true NOT NULL,
	"profile_id" uuid NOT NULL,
	"created_at" timestamp,
	CONSTRAINT "session_jwt_unique" UNIQUE("jwt")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text,
	"username" text,
	"password" text NOT NULL,
	"preferred_language" text DEFAULT 'en',
	"registration_country" text DEFAULT 'US',
	"created_at" timestamp,
	"updated_at" timestamp,
	"role" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
