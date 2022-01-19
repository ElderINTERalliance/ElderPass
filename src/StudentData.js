// This file contains functions that handle student data

"use strict";

/**
 * Full student information for jsdoc
 * @typedef {{ id: string, lastName: string, firstName: string, middleName: string, email: string, gradYear: string, commonName: string, fullName: string }} Student
 */

const assert = require("assert");
const csv = require("csv-parser");
const fs = require("fs");

// this is an export from our student database
const FILE_NAME = "../StudentDatabase.csv"

const StudentData = new Map();

/**
 * loads a student object into the global Map object
 * Note that the map stores students with their student ID as the key,
 * and the full data as the value.
 * @param {Student} - The student to load into the Map.
 * @throws {AssertionError} - One of the fields in the student was invalid.
 */
function loadStudent(student) {
	// have renamable keys in case the csv's headers change
	const idKey = "Student ID";
	const lastNameKey   = "Last Name";
	const firstNameKey  = "First Name";
	const middleNameKey = "Middle Name";
	const emailKey      = "ElderEmail";
	const gradYearKey   = "Grad Year";

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
		id:         student[idKey],
		lastName:   student[lastNameKey],
		firstName:  student[firstNameKey],
		middleName: student[middleNameKey],
		email:      student[emailKey],
		gradYear:   student[gradYearKey],
		commonName: commonName,
		fullName:   fullName
	});
}

// TODO: Create logger module and use it everywhere
fs.createReadStream(FILE_NAME)
  .pipe(csv())
  .on('data', (student) => {
	// TODO: Use redis as a key value store?
	// TODO: move this to other function and make strings into variables to change
	  try {
		  loadStudent(student);
	  } catch {
		  console.log(`error loading student: `, student);
	  }
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
	console.log(StudentData);
  })
  .on('error', (err) => {
    console.log('there was a terrible error!');
	throw new Error(`Error in parsing: ${err}`);
  });


/**
 * getStudent takes a student Id and returns an object with
 * all of the student data.
 *
 * @param {string} studentId - The student id
 * @return {Student} - the {@link Student} with that ID
 * @throws {StudentNotFoundException} - Student was not found
 */
function getStudent(studentId) {
	// ...
}


console.log("hello from getStudent")

