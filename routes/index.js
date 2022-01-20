/**
 * @module Router
 */

/**
 * @global
 * @typedef {Object} StudentResponse
 * @property {Student|Object} data - Return a student if they are found. Otherwise, return an empty object, and populate the error.
 * @property {string} error - The error message if a student is not found. Otherwise, it is "".
 */

const router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');
const { logger } = require('../src/loggers');
const { getStudent } = require('../src/student_data');
const { addToQueue } = require('../src/sheets');

/**
 * @name get/
 * @description the main page the user sees
 */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'ElderPass Home',
    isAuthenticated: req.oidc.isAuthenticated()
  });
});


/**
 * @name get/profile
 * @description the user's profile (requires authentication)
 */
router.get('/profile', requiresAuth(), function (req, res, next) {
  res.render('profile', {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'Profile page'
  });
});

/**
 * @name post/api/submitstudent
 * @description submits a student
 * @type {StudentResponse}
 */
router.post('/api/submitstudent', requiresAuth(), function (req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	// take data from query parameters
	const id = req.query.id;
	const sign = req.query.sign;
	const time = req.query.time || new Date().toISOString();
	logger.debug("submit student was called")

	// make sure the id starts with "STU" and only has numbers after it
	if (!/STU\d+/.test(id)) {
		res.status(400).end(JSON.stringify({
			data: {},
			error: "Error: Invalid student id"
		}));
		logger.warn(`Student id "${id}" was invalid`);
		return;
	}

	if (!["IN", "OUT"].includes(sign)) {
		res.status(400).end(JSON.stringify({
			data: {},
			error: "Error: use `sign=IN` or `sign=OUT`. Current request was invalid."
		}));
		logger.warn(`sign "${sign}" was not valid.`);
		return;
	}

	let response;
	try {
		// get student will throw an error if the student cannot be found
		response = {
			data: getStudent(id),
			error: ""
		};
	} catch (err) {
		res.status(404).end(JSON.stringify({
			data: {},
			error: `Student "${id}" was not found`
		}));
		logger.warn(`Student "${id}" was not found.`)
		return;
	}

	const student = response.data;
	const teacher = req.oidc.user;

	// THIS ORDER MUST MATCH THE COLUMNS IN THE DATABASE
	const databaseSubmission = [
		student.id,         // id
		student.lastName,   // lastName
		student.firstName,  // firstName
		student.middleName, // middleName
		teacher.name,       // teacherName
		sign,               // checking IN / OUT
		time,               // time
		student.email,      // studentEmail
		teacher.email       // teacherEmail
	];
	addToQueue(databaseSubmission);

	res.end(JSON.stringify(response));
});

/**
 * @name get/api/getstudent/studentid=id
 * @description returns all the data on the student with that id.
 * See the regex for more info.
 * @type {StudentResponse}
 */
router.get('/api/getstudent/studentid=:id', requiresAuth(), function (req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	const id = req.params.id;

	// make sure the id starts with "STU" and only has numbers after it
	if (!/STU\d+/.test(id)) {
		res.status(404).end(JSON.stringify({
			data: {},
			error: "Error: Invalid student id"
		}));
		logger.warn(`Student id "${id}" was invalid`)
		return;
	}

	let response;
	try {
		response = {
			data: getStudent(id),
			error: ""
		};
	} catch (err) {
		response = {
			data: {},
			error: `Student "${id}" was not found.`
		}
		logger.warn(`Student "${id}" was not found.`)
	}
	res.end(JSON.stringify(response));
});

module.exports = router;
