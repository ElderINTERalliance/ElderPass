"use strict";

/**
 * A StudentNotFoundError should be thrown if a student cannot be found in
 * our records. This should be properly handled by the caller.
 */
class StudentNotFoundError extends Error {
	constructor(studentId) {
		super(`Error! Could not find student "${studentId}".`);
		this.name = "StudentNotFoundError";
	}
}

/**
 * A FileNotFoundError should be thrown if a file could not be found.
 */
class FileNotFoundError extends Error {
	constructor(message, filePath) {
		super(`${message} @ ${filePath}`);
		this.name = "FileNotFoundError";
	}
}

module.exports = {
	StudentNotFoundError,
	FileNotFoundError
}


