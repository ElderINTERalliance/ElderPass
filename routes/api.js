/**
 * @module API
 */

/**
 * @global
 * @typedef {Object} StudentResponse
 * @property {Student|Object} data - Return a student if they are found. Otherwise, return an empty object, and populate the error.
 * @property {string} error - The error message if a student is not found. Otherwise, it is "".
 */

/**
 * @global
 * @typedef {Object} StudentSearchResponse
 * @property {Student[]} data - Return a student if they are found. Otherwise, return an empty object, and populate the error.
 * @property {string} error - The error message if a student is not found. Otherwise, it is "".
 */

const apiRouter = require('express').Router();
const { requiresAuth } = require('express-openid-connect');
const { logger } = require('../src/loggers');
const { getStudent, searchForStudents } = require('../src/student_data');
const { addToQueue } = require('../src/sheets.js');
const { getAnalysis } = require('../src/analyze');

/**
 * @name post/api/submitstudent
 * @description checks a student in or out
 * @type {StudentResponse}
 */
apiRouter.post('/submitstudent', requiresAuth(), async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    // take data from query parameters
    const id = req.query.id;
    const sign = req.query.sign;
    const time = req.query.time || new Date().toISOString();

    // make sure the id starts with "STU" and only has numbers after it
    if (!/STU\d+/.test(id)) {
        res.status(400).end(JSON.stringify({
            data: {},
            error: 'Error: Invalid student id'
        }));
        logger.warn(`Student id "${id}" was invalid`);
        return;
    }

    if (!['IN', 'OUT'].includes(sign)) {
        res.status(400).end(JSON.stringify({
            data: {},
            error: 'Error: use `sign=IN` or `sign=OUT`. Current request was invalid.'
        }));
        logger.warn(`sign "${sign}" was not valid.`);
        return;
    }

    let response;
    try {
        // get student will throw an error if the student cannot be found
        response = {
            data: getStudent(id),
            error: ''
        };
    } catch (err) {
        res.status(404).end(JSON.stringify({
            data: {},
            error: `Student "${id}" was not found`
        }));
        logger.warn(`Student "${id}" was not found.`);
        return;
    }

    const student = response.data;
    const teacher = req.oidc.user;

    await addToQueue({
        id: student.id,
        lastName: student.lastName,
        firstName: student.firstName,
        middleName: student.middleName,
        teacherName: teacher.name,
        checkIn: sign,  // IN / OUT
        time: time,
        studentEmail: student.email,
        teacherEmail: teacher.email
    });

    res.end(JSON.stringify(response));
});

/**
 * @name get/api/getstudent/studentid=id
 * @description returns all the data on the student with that id.
 * See the regex for more info.
 * @type {StudentResponse}
 */
apiRouter.get('/getstudent/studentid=:id', requiresAuth(), function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const id = req.params.id;

    // make sure the id starts with "STU" and only has numbers after it
    if (!/STU\d+/.test(id)) {
        res.status(404).end(JSON.stringify({
            data: {},
            error: 'Error: Invalid student id'
        }));
        logger.warn(`Student id "${id}" was invalid`);
        return;
    }

    let response;
    try {
        response = {
            data: getStudent(id),
            error: ''
        };
    } catch (err) {
        response = {
            data: {},
            error: `Student "${id}" was not found.`
        };
        logger.warn(`Student "${id}" was not found.`);
    }
    res.end(JSON.stringify(response));
});

// TODO: JSDOC parameters
/**
 * @name get/api/search
 * @description takes a parameter and tries to find a
 * student name that matches.
 * @type {StudentSearchResponse}
 */
apiRouter.get('/search', requiresAuth(), function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const commonName = req.query.name;

    if (!commonName) {
        res.status(400).end(JSON.stringify({
            data: {},
            error: 'Please fill out a student name.'
        }));
        return;
    }

    const students = searchForStudents(commonName);

    if (students.length > 0) {
        response = {
            data: students,
            error: ''
        };
    } else {
        response = {
            data: {},
            error: 'Student could not be found. Consider using their last name.'
        };
        logger.trace(`Student "${commonName}" could not be found`);
    }

    res.end(JSON.stringify(response));
});


// TODO: JSDOC
apiRouter.get('/analyze', requiresAuth(), async function (req, res, next) {
    const shouldFilterByDate = req.query.shouldFilterByDate === "true";
    const date = req.query.date;

    logger.info({ shouldFilterByDate, date });

    try {
        let response;
        if (shouldFilterByDate) {
            response = await getAnalysis(date);
        } else {
            response = await getAnalysis();
        }

        res.end(JSON.stringify({
            allData: response.allData,
            problematicStudents: response.problematicStudents,
            error: ""
        }));
    } catch (error) {
        logger.error("/analyze: ", error);
        res.status(400).end(JSON.stringify({
            allData: [],
            problematicStudents: [],
            error: 'Could not analyze data.'
        }));
    } finally {
        console.timeEnd("processData");
    }
});

module.exports = apiRouter;
