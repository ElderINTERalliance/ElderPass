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
 * @name get/api/studentid=id
 * @description returns all the data on the student with that id.
 * See the regex for more info.
 * @type {StudentResponse}
 */
router.get('/api/studentid=:id', requiresAuth(), function (req, res, next) {
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
