/**
 * @module Analyze
 */

const { logger } = require("./loggers");
const { getDataFromDate, getAllData } = require("./sheets");

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
 * checks to see if the data we have on a student is problematic.
 * "Problematic" means that they either did not check in in time, or at all.
 * @param {DatabaseSubmission[]} entries - all of the rows associated with that student, sorted by time
 * @returns {boolean} - true if the student is problematic
 */
function studentIsProblematic(entries) {
    let timesIn = 0;
    let timesOut = 0;
    for (let i = 0; i < entries.length; i++) {
        if (entries[i].checkIn === "IN") {
            timesIn++;
        } else if (entries[i].checkIn === "OUT") {
            timesOut++;
        }
    }
    return timesIn !== timesOut;
    // TODO: Pick up here tomorrow
    // TODO: extract into function
}

// TODO: JSDOC
async function getAnalysis(dateStamp) {
    console.time("getData")
    let db;
    if (dateStamp) {
        db = await getDataFromDate(dateStamp);
    } else {
        db = await getAllData();
    }
    console.timeEnd("getData")
    console.time("processData")

    if (Object.keys(db).length === 0) {
        return {};
    }

    let rows = db.map((row) => rowToObj(row._rawData));

    // group data by student
    const data = {};
    for (const row of rows) {
        data[row.id] ??= {};
        data[row.id].entries ??= [];
        data[row.id].entries.push(row);
    }

    for (const studentId in data) {
        data[studentId].entries.sort((a, b) => a.time.localeCompare(b.time));
        data[studentId].isProblematic = studentIsProblematic(data[studentId].entries);
    }

    return data;
}

module.exports = { getAnalysis };
