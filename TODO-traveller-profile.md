# TODO: Add Traveller Profile Fields

## Tasks
- [x] Add travellerProfile sub-schema to user.model.js with fields: phoneNumber, gender, dateOfBirth, address (city, state, country, pincode), preferredTravelStyle (array), preferredLanguages (array), foodPreference, profileBio, profilePhoto (optional)
- [x] Update UserProfile.js to conditionally render traveller fields when user.role === 'user'
- [x] Add form state and handlers for new traveller fields in UserProfile.js, including dropdowns for preferences
- [x] Update backend controllers/services to handle saving/retrieving traveller profile data
- [x] Fix validation issues in updateMyProfile for traveller fields (prevent empty strings on enum fields, invalid dates)
- [x] Test the traveller profile update functionality
