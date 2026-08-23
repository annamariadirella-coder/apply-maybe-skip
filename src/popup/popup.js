/**
 * Popup controller.
 *
 * This milestone verifies the UI shell only. Page extraction and screening
 * will be connected after the candidate profile and rules are defined.
 */

const analyzeButton = document.querySelector("#analyze-button");
const statusMessage = document.querySelector("#status-message");

analyzeButton.addEventListener("click", () => {
  statusMessage.textContent =
    "Scaffold verified. End-to-end job analysis is planned for a later milestone.";
});
