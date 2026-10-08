chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    void chrome.runtime.openOptionsPage();
  }
});
