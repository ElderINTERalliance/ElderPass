"use strict";

/**
 * A StudentNotFoundError should be thrown if a student cannot be found in
 * our records. This should be properly handled by the caller.
 * @class
 * @augments Error
 */
class StudentNotFoundError extends Error {
	/**
	 * Creates a new StudentNotFoundError
	 * @param {string} studentId - The student id to format
	 */
	constructor(studentId) {
		super(`Error! Could not find student "${studentId}".`);
		this.name = "StudentNotFoundError";
	}
}

/**
 * A FileNotFoundError should be thrown if a file could not be found.
 * @class
 * @augments Error
 */
class FileNotFoundError extends Error {
	/**
	 * Creates a new FileNotFoundError
	 * @param {string} message - The message to the user
	 * @param {string} filePath - The place where the file should have been
	 */
	constructor(message, filePath) {
		super(`${message} @ ${filePath}`);
		this.name = "FileNotFoundError";
	}
}

module.exports = {
	StudentNotFoundError,
	FileNotFoundError
}

