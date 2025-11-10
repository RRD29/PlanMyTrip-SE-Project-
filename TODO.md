# TODO: Update Profile Photo Upload UI in UserProfile.js

## Task Overview
Modify the profile photo (avatar) upload section in `client/src/pages/dashboard-user/UserProfile.js` to conditionally display buttons based on whether a photo is uploaded. Hide the file input to prevent "no file chosen" text. Apply to both user (traveller) and guide profiles.

## Steps
- [ ] Update the avatar upload section in the form to use conditional rendering similar to FileUploadField.
- [ ] If avatarPreview exists (photo uploaded):
  - Display "Change file" button in green font color.
  - Provide a "View" button/link to view the uploaded photo.
- [ ] If no avatarPreview (no photo uploaded):
  - Display "Choose file" button.
- [ ] Hide the file input element (use sr-only or similar) to avoid showing "no file chosen".
- [ ] Ensure the functionality works for both user and guide roles.

## Dependent Files
- `client/src/pages/dashboard-user/UserProfile.js` (main file to edit)

## Followup Steps
- [ ] Test the UI changes in the browser to ensure buttons display correctly and file input is hidden.
- [ ] Verify that uploading and changing photos works as expected.
- [ ] Check for any styling issues or responsiveness.
