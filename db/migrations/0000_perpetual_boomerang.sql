CREATE TABLE `bests` (
	`player_id` text PRIMARY KEY NOT NULL,
	`wpm` integer NOT NULL,
	`accuracy` integer NOT NULL,
	`run_id` text NOT NULL,
	`achieved_at` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`run_id`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `bests_wpm_idx` ON `bests` (`wpm`);--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`secret_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_username_unique` ON `players` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `players_secret_hash_unique` ON `players` (`secret_hash`);--> statement-breakpoint
CREATE TABLE `runs` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`wpm` integer NOT NULL,
	`raw_wpm` integer NOT NULL,
	`accuracy` integer NOT NULL,
	`errors` integer NOT NULL,
	`sent` integer NOT NULL,
	`flagged` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `runs_player_idx` ON `runs` (`player_id`,`created_at`);