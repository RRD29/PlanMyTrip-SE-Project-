# TODO: Add Validations for Guide Profile Fields

## Steps to Complete

- [ ] Add state variables for validation errors (e.g., contactNumberError, aadhaarError, etc.)
- [ ] Create validation functions for each field:
  - contactNumber: exactly 10 digits
  - aadhaarNumber: exactly 12 digits
  - panNumber: 10 characters, format AAAAA9999A
  - bankIFSC: 11 characters, format XXXX0YYYYYY
  - bankAccountNumber: numeric only
- [ ] Update onChange handlers to call validation functions and set errors
- [ ] Display error messages below invalid fields
- [ ] Prevent form submission if any validation errors exist
- [ ] Test validations with invalid inputs
