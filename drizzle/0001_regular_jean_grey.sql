CREATE TABLE `sessionHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`triageRecordId` int NOT NULL,
	`sessionStartedAt` timestamp NOT NULL DEFAULT (now()),
	`sessionEndedAt` timestamp,
	`detectedLanguage` varchar(10) NOT NULL,
	`urgencyLevel` int NOT NULL,
	`chiefComplaint` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessionHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `triageRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`chiefComplaint` text NOT NULL,
	`symptomList` text NOT NULL,
	`urgencyLevel` int NOT NULL,
	`medicationFound` varchar(255),
	`recommendedAction` text NOT NULL,
	`patientLanguage` varchar(10) NOT NULL,
	`confidence` int NOT NULL,
	`audioTranscript` text,
	`audioMedication` varchar(255),
	`imageMedication` varchar(255),
	`audioImageMatch` int NOT NULL DEFAULT 1,
	`verificationWarning` text,
	`patientInstructions` text,
	`audioFileKey` varchar(512),
	`imageFileKey` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `triageRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `sessionHistory` ADD CONSTRAINT `sessionHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessionHistory` ADD CONSTRAINT `sessionHistory_triageRecordId_triageRecords_id_fk` FOREIGN KEY (`triageRecordId`) REFERENCES `triageRecords`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `triageRecords` ADD CONSTRAINT `triageRecords_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;