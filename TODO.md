# TODO: Add Autocomplete Suggestions to ExplorePlaces Search Input

## Steps to Complete:
1. Add `fetchAutocompleteSuggestions` function in `client/src/utils/geoapify-utils.js` to call Geoapify Autocomplete API, limiting to cities and places.
2. In `client/src/pages/dashboard-user/ExplorePlaces.js`:
   - Import useCallback and useEffect for debouncing.
   - Add state: `suggestions` (array), `showSuggestions` (boolean), `selectedIndex` (number).
   - Implement debounced suggestion fetching on input change.
   - Update input onChange to fetch suggestions and show dropdown.
   - Add onKeyDown handler for keyboard navigation (up/down arrows, enter, escape).
   - Render dropdown UI below input with suggestions list, click handlers.
   - On selection: update searchQuery, close dropdown.
   - Add onBlur to close dropdown with delay.
3. Style dropdown with Tailwind for absolute positioning, hover effects.
4. Test autocomplete functionality: typing, suggestions, selection, search trigger.
5. Handle edge cases: no suggestions, API errors, mobile view.

## Progress:
- [x] Step 1: Add fetchAutocompleteSuggestions in geoapify-utils.js
- [x] Step 2: Update ExplorePlaces.js with state and handlers
- [x] Step 3: Add dropdown UI in ExplorePlaces.js
- [x] Step 4: Test and debug
- [x] Step 5: Handle edge cases
# TODO: Add Home Page Button to Dashboard

## Steps to Complete
- [x] Add HomeIcon to client/src/assets/icons/index.js
- [x] Update DashboardLayout.js to include Home link in UserNav, GuideNav, and AdminNav
- [ ] Test the changes to ensure Home button appears in dashboard sidebar for all roles
# TODO: Fix Forgot Password Functionality

## Tasks
- [x] Implement forgotPassword controller in auth.controller.js
- [x] Implement resetPassword controller in auth.controller.js
- [x] Test the forgot password flow
- [ ] Test the reset password flow
