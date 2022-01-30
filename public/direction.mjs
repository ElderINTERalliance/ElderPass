/**
 * @module Direction
 * @description i.e. Is the student checking in or out?
 */

function toggleButton() {
    document.getElementById("toggle-button").click();
}

/**
 * Mounts the direction button
 * to the DOM
 */
function mountDirection() {
    document.getElementById("direction-slider").addEventListener("keydown", (key) => {
        if (key.code === "Enter")
            toggleButton();
    });
}

/**
 * Gets the direction the student is going
 * @returns {"IN" | "OUT"}
 */
function getDirection() {
    const toggle = document.getElementById("toggle-button");
    if (toggle.checked) {
        return "IN";
    } else {
        return "OUT";
    }
}

export {
    mountDirection,
    getDirection,
}
