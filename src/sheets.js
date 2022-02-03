/**
 * @module Sheets
 */

/**
 * All of the information associated with a check in/check out event
 * @global
 * @typedef {Object} DatabaseSubmission
 * @property {string} id - Student id, prefixed with STU
 * @property {string} lastName - Last name may have punctuation
 * @property {string} firstName - I don't believe this can have punctuation, but I'm not sure
 * @property {string} middleName - Middle name may be empty and may have punctuation
 * @property {string} studentEmail - Elder email, should be prefixed with "e##-"
 * @property {string} teacherEmail - A teacher's email
 * @property {string} teacherName - A teacher's name
 * @property {string} time - The time the check in/out occurred.
 * @property {"IN"|"OUT"} checkIn - Whether the student is checking in or out
 */

/**
 * @param {Array} arr - The array with all of the data to submit
 * @see DatabaseSubmission
 * @description - This will add a value to the queue of things to upload
 */

"use strict";

const { GoogleSpreadsheet } = require("google-spreadsheet");
const path = require("path");
const { logger } = require('./loggers');
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const creds = require("../service-account-creds.json");

let doc;
async function authenticate() {
	try {
		if (doc)
			return doc;

		const newDoc = new GoogleSpreadsheet(process.env.SHEET_ID);
		await newDoc.useServiceAccountAuth(creds);
		logger.info("Google sheets loaded!");
		doc = newDoc;
		return doc;
	} catch (error) {
		logger.fatal("error loading google sheets", error);
		throw new Error("cannot access google sheets - We might miss data.");
	}
}

// TODO: JSDOC
// @throws Error
async function submitToDatabase(databaseSubmission) {
	// saves a single student to Google Sheets
	// REVIEW - Is there any way to save more than one at a time?
	await authenticate();
	await doc.loadInfo();
	const data = doc.sheetsByIndex[0];
	const row = await data.addRow(databaseSubmission);
	logger.info(`submitted a row to Google sheets`);
}

let queue = [/* array of DatabaseSubmissions */];

// TODO: JSDOC
function addToQueue(databaseSubmission) {
	queue.push(databaseSubmission);
}

// TODO: JSDOC
async function submitQueue() {
	if (queue.length === 0) {
		logger.trace("nothing to append");
		return;
	}
	logger.info("attempting to submit students...");
	// add everything from the queue to google sheets
	try {
		for (const submission of [...queue]) {
			await submitToDatabase(submission);
			queue.shift();
		}
	} catch (error) {
		logger.fatal("could not submit to google sheets", error)
	}
}

const TIMEOUT = 10000; // 10 seconds
const interval = setInterval(submitQueue, TIMEOUT);

// gracefully shutdown
process.on('SIGINT', async () => {
	logger.trace("SHUTTING DOWN");
	await submitQueue(); // try to back up any last data
	clearInterval(interval);
	logger.trace("shutdown google sheets interval");
	process.exit(0);
});

module.exports = {
	addToQueue
};
