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

/**
 * This is to be used when working with the google sheet.
 * @param {string} ISOTimestamp 
 * @returns {string} - YYYY-M-D
 */
function getLocalDateStampFromISO(ISOTimestamp) {
	const date = new Date(ISOTimestamp);
	const yyyy = date.getFullYear();
	const mm = (date.getMonth() + 1).toString().padStart(2, "0");
	const dd = date.getDate().toString().padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

/**
 * NOTE: doc.loadinfo() must be called before calling this.
 * @returns {string[]} - Sheet names
 */
function getListOfSheetNames() {
	return Object.keys(doc.sheetsByTitle);
}

// TODO: add jsdoc
// @throws error
async function ensureSheetExists(sheetName) {
	if (!getListOfSheetNames().includes(sheetName)) {
		const headerValues = [
			"id",
			"lastName",
			"firstName",
			"middleName",
			"teacherName",
			"checkIn",
			"time",
			"studentEmail",
			"teacherEmail"
		];
		// create sheet with a name and initial values
		await doc.addSheet({
			title: sheetName,
			headerValues: headerValues
		});
		const sheet = doc.sheetsByTitle[sheetName];
		// make header values bold
		await sheet.loadCells("A1:I1");
		for (let col = 0; col < headerValues.length; col++) {
			const cell = sheet.getCell(0, col);
			cell.textFormat = { bold: true };
		}
		await sheet.saveUpdatedCells();
		logger.info(`created sheet "${sheetName}"`);
	} else {
		logger.trace(`did not create sheet "${sheetName}"`);
	}
}

// TODO: make work with date
/**
 * Submits to google sheets
 * @param {DatabaseSubmission} databaseSubmission 
 * @throws {Error} - This can throw an error in authenticating or in submitting the data.
 */
async function submitToDatabase(databaseSubmission) {
	// saves a single student to Google Sheets
	// REVIEW - Is there any way to save more than one at a time?
	await authenticate();
	await doc.loadInfo();
	const sheetName = getLocalDateStampFromISO(databaseSubmission.time);
	await ensureSheetExists(sheetName);
	const data = doc.sheetsByTitle[sheetName];
	await data.addRow(databaseSubmission);
	logger.trace(`submitted a row to Google sheets`);
}

let queue = [/* array of DatabaseSubmissions */];

/**
 * Adds to the queue of submissions.
 * We don't want the user to wait to submit to the database
 * for the sake of performance.
 * @param {DatabaseSubmission} databaseSubmission 
 */
function addToQueue(databaseSubmission) {
	queue.push(databaseSubmission);
}

/**
 * Attempts to submit the queue of database submissions.
 * This is called in an interval in order to offload the
 * work of submitting to the database. 
 */
async function submitQueue() {
	if (queue.length === 0) {
		logger.trace("nothing to append");
		return;
	}
	logger.info(`attempting to submit ${queue.length} students...`);
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

// TODO: JSDOC
async function getDataFromSheetName(sheetName) {
	if (!getListOfSheetNames().includes(sheetName)) {
		logger.info(`getDataFromDate: no data found for sheetName "${sheetName}"`);
		return [];
	}
	const sheet = doc.sheetsByTitle[sheetName];
	const rows = await sheet.getRows();
	return rows;
}

// TODO: JSDOC
async function getDataFromDate(sheetName) {
	await authenticate();
	await doc.loadInfo();
	return await getDataFromSheetName(sheetName);
}

// TODO: JSDOC
// @throws error
async function getAllData() {
	logger.info("getting all data!");
	await authenticate();
	await doc.loadInfo();
	const sheetNames = getListOfSheetNames();
	// execute async calls in parallel
	const promises = sheetNames.map((sheet) => getDataFromSheetName(sheet));
	const results = await Promise.all(promises);
	return results.flat();
}

// gracefully shutdown
process.on('SIGINT', async () => {
	logger.trace("SHUTTING DOWN");
	await submitQueue(); // try to back up any last data
	clearInterval(interval);
	logger.trace("shutdown google sheets interval");
	process.exit(0);
});

module.exports = {
	addToQueue,
	getDataFromDate,
	getAllData,
	getLocalDateStampFromISO
};
