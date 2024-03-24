CREATE TABLE `userHighlights` (
	`user_id` text NOT NULL,
	`highlight_id` text NOT NULL,
	`played` integer DEFAULT false,
	`saved` integer DEFAULT false,
	`liked` integer DEFAULT false,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(`highlight_id`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`highlight_id`) REFERENCES `highlights`(`id`) ON UPDATE no action ON DELETE no action
);
