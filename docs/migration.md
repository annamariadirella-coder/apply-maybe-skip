# Move to JobOps

## Existing Chrome extension

1. Export your existing local documents/profile data if needed, and download JobOps into the same folder used by the unpacked extension.
2. Keep that existing extension entry in `chrome://extensions` and choose Reload. Loading a different path as a new unpacked extension may give it a different ID and separate storage.
3. Open Options: it now opens the JobOps dashboard. Your existing `candidateProfileSettings`, document memory and career-intelligence keys are retained.
4. Use Your profile → Document & evidence setup for the advanced document workflow. Browser-page roles can now be saved into the dashboard.

Do not use the fictional demo as your real profile.

## Existing Apps Script collector

Your Google installation and its daily trigger are independent of the GitHub repository. Keep the existing Script Properties, source IDs, private output folder, state and trigger.

Replace the contents of **Code.gs** with [the canonical JobOps file](../services/collector/Code.gs). Do not initialise another output folder or add another daily trigger. `Scoring.gs` and `ScoringConfig.gs` are optional; paid scoring remains off unless explicitly enabled in Script Properties. If you already use them, update both from the same version. Preserve the existing manifest/scopes.

Run **scanJobs** once. Its Drive report retains the version-1 state and queue, adds the audit/runtime source inventory, and identifies the active versus paused catalog counts. The catalog pauses 404/410 feed endpoints from the dated audit; missing feeds do not mean employers have stopped hiring. `RETRY_UNAVAILABLE_BOARDS=true` explicitly re-enables these feeds for a diagnostic retry. Review the current report, not the historical audit, when evaluating coverage.

Download **candidates.json** from that private Drive folder and select **Import scan** in JobOps. Export the existing Google Tracker tab as CSV and use **Import tracker**. This imports current states; it does not connect ongoing two-way synchronisation or write to Google Sheets. Repeat imports when needed.

## Repository transition

The public repository now contains the consolidated JobOps project. Existing links to its original repository name continue to lead to this project. The private agent repository remains private and preserves its operational history. JobOps is the canonical public source for new changes; source documents, credentials and live outputs remain private.

Renaming the public repository to `jobops` is a separate GitHub repository-administration action. A rename is cosmetic; it does not install the extension or update Apps Script. GitHub normally redirects old repository links after a rename. The project works under the existing repository URL.
