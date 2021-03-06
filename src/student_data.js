// This file contains functions that handle student data

"use strict";

/**
 * All of the information associated with a student
 * @typedef {Object} Student
 * @property {string} id - Student id, prefixed with STU
 * @property {string} lastName - Last name may have punctuation
 * @property {string} firstName - I don't believe this can have punctuation, but I'm not sure
 * @property {string} middleName - Middle name may be empty and may have punctuation
 * @property {string} email - Elder email, should be prefixed with "e##-"
 * @property {string} gradYear - 4 digit year
 * @property {string} commonName - firstName lastName
 * @property {string} fullName - firstName middleName? lastName
 */

const assert = require("assert");
const csv = require("csv-parser");
const path = require('path');
const fs = require("fs");

const { logger } = require("./loggers");
const { StudentNotFoundError, FileNotFoundError } = require("./errors");

// this is an export from our student database
const FILE_NAME = path.join(__dirname, "../StudentDatabase.csv");
if (!fs.existsSync(FILE_NAME)) {
	throw new FileNotFoundError('Please make sure the student database is properly loaded.', FILE_NAME);
}

const StudentData = new Map();

/**
 * loads a student object into the global Map object.
 * Note that the map stores students with their student ID as the key,
 * and the full data as the value.
 * @param {Student} - The student to load into the Map.
 * @throws {AssertionError} - One of the fields in the student was invalid.
 */
function loadStudent(student) {
	// have renamable keys in case the csv's headers change
	const idKey = "Student ID";
	const lastNameKey = "Last Name";
	const firstNameKey = "First Name";
	const middleNameKey = "Middle Name";
	const emailKey = "ElderEmail";
	const gradYearKey = "Grad Year";

	// make sure student has the necessary properties
	assert(student[idKey]);
	assert(student[lastNameKey]);
	assert(student[firstNameKey]);
	assert(student[middleNameKey] != null); // middle name may be ""
	assert(student[emailKey]);
	assert(student[gradYearKey]);

	// handle if there's no middle name
	let fullName = student[firstNameKey];
	if (student[middleNameKey]) {
		fullName += ` ${student[middleNameKey]} `;
	} else {
		fullName += " ";
	}
	fullName += student[lastNameKey];

	// common name is Firstname Lastname
	const commonName = `${student[firstNameKey]} ${student[lastNameKey]}`;

	StudentData.set(student[idKey], {
		id: student[idKey],
		lastName: student[lastNameKey],
		firstName: student[firstNameKey],
		middleName: student[middleNameKey],
		email: student[emailKey],
		gradYear: student[gradYearKey],
		commonName: commonName,
		fullName: fullName
	});
}

fs.createReadStream(FILE_NAME)
	.pipe(csv())
	.on('data', (student) => {
		// TODO: Use redis as a key value store?
		try {
			loadStudent(student);
		} catch (err) {
			logger.error(`Error loading student "${JSON.stringify(student)}". | `, err);
		}
	})
	.on('end', () => {
		logger.info('CSV file successfully processed');
	})
	.on('error', (err) => {
		logger.error("error in fs.createReadStream - ", err);
		throw new Error(`Error in parsing: ${err}`);
	});

/**
 * getStudent takes a student id and returns an object with
 * all of the student data.
 *
 * This is a rather short method, but it should be kept in case we want
 * to redesign how we store students.
 *
 * @param {string} studentId - The student id to try to find
 * @return {Student} - The student with that ID
 * @throws {StudentNotFoundError} - The student was not found
 */
function getStudent(studentId) {
	let response = StudentData.get(studentId);
	if (response) {
		return response;
	} else {
		throw new StudentNotFoundError(studentId);
	}
}

/**
 * searchForStudents takes a string (ultimately provided by a teacher)
 * and tries to find a student name that it matches.
 *
 * @param {string} str - The student first name and last name (e.g. John Doe)
 * @return {Student[]} - The student with that ID
 */
function searchForStudents(str) {
	// REVIEW: replace with better search method

	// ewww linear search :(
	// I kinda want to implement an intermediate database layer
	return Array.from(StudentData.values()).filter((student) => {
		const commonName = student.commonName.toLowerCase();
		const fullName = student.fullName.toLowerCase();
		const target = str.toLowerCase();

		return commonName.includes(target) || fullName.includes(target);
	}).sort((a, b) => a.lastName.localeCompare(b.lastName));
}

module.exports = { getStudent, searchForStudents }

