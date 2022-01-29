"use strict";

/**
 * Note: This script is intended to be run in the browser.
 */

// modified from https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// TODO: import from lib
async function sendData(url) {
	const response = await fetch(url, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json'
		},
		redirect: 'follow',
		referrerPolicy: 'no-referrer',
		body: ""
	});
	return response.json(); // parses JSON response into native JavaScript objects
}

// TODO: Make way to type names instead of student ids
// 	TODO: Figure out how to search properly

// TODO: add barcode scanner here

document.getElementById("submit").addEventListener("click", async () => {
	const sign = document.getElementById("sign-direction").value;
	const id = document.getElementById("stuid").value;
	const data = await sendData(`/api/submitstudent?id=${id}&sign=${sign}`);
	document.getElementById("submission-data").textContent = JSON.stringify(data, null, 1);
});

