/**
 * @module Analyze
 */

const { logger } = require("./loggers");
const { getDatabase } = require("./sheets");

// TODO: JSDOC
function rowToObj(row) {
    return {
        id: row[0],
        lastName: row[1],
        firstName: row[2],
        middleName: row[3],
        teacherName: row[4],
        checkIn: row[5],
        time: row[6],
        studentEmail: row[7],
        teacherEmail: row[8]
    };
}

// TODO: JSDOC
function datesAreOnSameDay(first, second) {
    return first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate();
}

/**
 * @param {DatabaseSubmission[]} entries
 * @returns {boolean} - true if the student is problematic
 */
function studentIsProblematic(entries) {
    const checkingIn = entries.filter((entry) => entry.checkIn === "IN");
    const checkingOut = entries.filter((entry) => entry.checkIn === "OUT");

    if (checkingIn.length !== checkingOut.length)
        return true;
    // TODO: Pick up here tomorrow
    return false;
}

/**
 * Finds all of the students who have checked in too late or not at all.
 * @param {Object} data - an object with all of the movement data organized by student id
 * @returns {number[]} - all of the students with problematic data
 */
function getProblematicStudents(data) {
    const students = [];
    for (const [studentId, entries] of Object.entries(data)) {
        if (studentIsProblematic(entries)) {
            students.push(studentId);
        }
    }
    return students;
}

// TODO: JSDOC
async function getAnalysis(dateStamp) {
    console.time("getData")
    const db = await getDatabase();
    console.timeEnd("getData")
    console.time("processData")
    let rows = db.map((row) => rowToObj(row._rawData));

    if (dateStamp) {
        // if the user asked for a specific date,
        // only return the rows submitted on that date.
        // I don't know of any way to query this when we
        // initially pull the data.
        rows = rows.filter((entry) =>
            datesAreOnSameDay(new Date(entry.time), new Date(dateStamp))
        );
    }

    // group data by student
    const data = {};
    for (const row of rows) {
        data[row.id] ??= [];
        data[row.id].push(row);
    }

    for (const studentId in data) {
        data[studentId].sort((a, b) => a.time.localeCompare(b.time));
    }

    return {
        allData: data,
        problematicStudents: getProblematicStudents(data)
    };
}

module.exports = { getAnalysis };
