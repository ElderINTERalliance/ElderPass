/*
 * This is the script for the /search page.
 * it allows teachers to search for students by name to check them in/out.
 */

"use strict";

import { searchForStudents } from "./lib.mjs";


document.getElementById("submit").addEventListener("click", async () => {
    const name = document.getElementById("studentName").value;
    const response = await searchForStudents(name);

    document.getElementById("submission-data").textContent = JSON.stringify(response, null, 1);
})
