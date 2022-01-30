/**
 * @module Direction
 * i.e. Is the student checking in or out?
 */

function toggleButton() {
    document.getElementById("togggle-button").click();
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

export {
    mountDirection,
    toggleButton,
}
