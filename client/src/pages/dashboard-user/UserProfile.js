import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loaders';
import { userService } from '../../services/user.service';
import { useNavigate } from 'react-router-dom';

// Helper for input styling
const inputStyle = "px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";

// =========================================================================
// --- DUMB COMPONENTS (Used to organize the massive form fields) ---
// =========================================================================

const TravellerFields = (props) => (
    <>
        <h2 className="text-xl font-semibold border-t pt-4 mt-4">Traveller Profile</h2>
        
        {/* Phone Number */}
        <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input type="tel" id="phoneNumber" value={props.phoneNumber} onChange={(e) => props.setPhoneNumber(e.target.value)} className={`mt-1 block w-full ${inputStyle}`}/>
            {/* You can add OTP logic for travellers here too if needed */}
        </div>
        
        {/* Gender & DOB */}
        <div className="grid grid-cols-2 gap-4">
          <div><label htmlFor="travellerGender" className="block text-sm font-medium text-gray-700">Gender</label><select id="travellerGender" value={props.travellerGender} onChange={(e) => props.setTravellerGender(e.target.value)} className={`mt-1 block w-full ${inputStyle}`}><option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
          <div><label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label><input type="date" id="dateOfBirth" value={props.dateOfBirth} onChange={(e) => props.setDateOfBirth(e.target.value)} className={`mt-1 block w-full ${inputStyle}`}/></div>
        </div>
        
        {/* Address */}
        <div className="grid grid-cols-2 gap-4">
          <div><label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label><input type="text" id="city" value={props.address.city} onChange={(e) => props.setAddress({ ...props.address, city: e.target.value })} className={`mt-1 block w-full ${inputStyle}`}/></div>
          <div><label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label><input type="text" id="state" value={props.address.state} onChange={(e) => props.setAddress({ ...props.address, state: e.target.value })} className={`mt-1 block w-full ${inputStyle}`}/></div>
          <div><label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label><input type="text" id="country" value={props.address.country} onChange={(e) => props.setAddress({ ...props.address, country: e.target.value })} className={`mt-1 block w-full ${inputStyle}`}/></div>
          <div><label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label><input type="text" id="pincode" value={props.address.pincode} onChange={(e) => props.setAddress({ ...props.address, pincode: e.target.value })} className={`mt-1 block w-full ${inputStyle}`}/></div>
        </div>

        <h3 className="text-lg font-medium pt-4 border-t">Preferences & Bio</h3>
        
        {/* Preferred Travel Style */}
        <div><label htmlFor="preferredTravelStyle" className="block text-sm font-medium text-gray-700">Preferred Travel Style</label>
        <select multiple id="preferredTravelStyle" value={props.preferredTravelStyle} onChange={(e) => props.setPreferredTravelStyle(Array.from(e.target.selectedOptions, option => option.value))} className={`mt-1 block w-full ${inputStyle} h-24`}>
            <option value="Adventure">Adventure</option>
            <option value="Relaxation">Relaxation</option>
            <option value="Cultural">Cultural</option>
            <option value="Nature">Nature</option>
            <option value="Luxury">Luxury</option>
            <option value="Budget">Budget</option>
        </select></div>
        
        {/* Languages, Food, Bio */}
        <div className="grid grid-cols-2 gap-4">
            <div><label htmlFor="preferredLanguages" className="block text-sm font-medium text-gray-700">Preferred Languages</label><input type="text" id="preferredLanguages" value={props.preferredLanguages} onChange={(e) => props.setPreferredLanguages(e.target.value)} placeholder="e.g., English, Hindi" className={`mt-1 block w-full ${inputStyle}`}/></div>
            <div><label htmlFor="foodPreference" className="block text-sm font-medium text-gray-700">Food Preference</label><select id="foodPreference" value={props.foodPreference} onChange={(e) => props.setFoodPreference(e.target.value)} className={`mt-1 block w-full ${inputStyle}`}><option value="">Select...</option><option value="Veg">Veg</option><option value="Non-Veg">Non-Veg</option></select></div>
        </div>
        <div><label htmlFor="profileBio" className="block text-sm font-medium text-gray-700">Profile Bio</label><textarea id="profileBio" rows={3} value={props.profileBio} onChange={(e) => props.setProfileBio(e.target.value)} placeholder="Tell us about yourself..." className={`mt-1 block w-full ${inputStyle}`}></textarea></div>
    </>
);

const GuidePublicFields = (props) => (
    <>
        <h2 className="text-xl font-semibold border-t pt-4 mt-4">Public Guide Information</h2>

        <div className="grid grid-cols-2 gap-4">
            <div><label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth *</label><input type="date" id="dob" value={props.dob} onChange={(e) => props.setDob(e.target.value)} className={`mt-1 block w-full ${inputStyle}`} required={!props.isProfileComplete}/></div>
            <div><label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender *</label><select id="gender" value={props.gender} onChange={(e) => props.setGender(e.target.value)} className={`mt-1 block w-full ${inputStyle}`} required={!props.isProfileComplete}><option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
        </div>

        <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number *</label>
            <div className="flex space-x-2">
              <input type="tel" id="contactNumber" value={props.contactNumber} onChange={props.handleContactNumberChange} className={`mt-1 block w-full ${inputStyle}`} required={!props.isProfileComplete}/>
              {!props.otpVerified && (
                <Button onClick={props.handleSendOTP} type="button" size="sm" disabled={!props.contactNumber}>
                  {props.otpSent ? 'Resend OTP' : 'Send OTP'}
                </Button>
              )}
              {props.otpVerified && <span className="text-green-600 mt-2">✓ Verified</span>}
            </div>
            {props.validationErrors.contactNumber && <p className="text-red-500 text-sm mt-1">{props.validationErrors.contactNumber}</p>}
            {props.otpSent && !props.otpVerified && (
              <div className="mt-2 flex space-x-2">
                <input type="text" placeholder="Enter OTP" value={props.otp} onChange={(e) => props.setOtp(e.target.value)} className={`flex-1 ${inputStyle}`}/>
                <Button onClick={props.handleVerifyOTP} type="button" size="sm">Verify</Button>
              </div>
            )}
        </div>

        <h3 className="text-lg font-medium border-t pt-4">Professional Details</h3>

        <div className="grid grid-cols-2 gap-4">
            <div><label htmlFor="baseLocation" className="block text-sm font-medium text-gray-700">Base Location *</label><input type="text" id="baseLocation" value={props.baseLocation} onChange={(e) => props.setBaseLocation(e.target.value)} className={`mt-1 block w-full ${inputStyle}`} required={!props.isProfileComplete}/></div>
            <div><label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700">Years of Experience *</label><input type="number" id="yearsExperience" value={props.yearsExperience} onChange={(e) => props.setYearsExperience(e.target.value)} className={`mt-1 block w-full ${inputStyle}`} required={!props.isProfileComplete}/></div>
            <div><label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700">Price per Day (USD) *</label><input type="number" id="pricePerDay" value={props.pricePerDay} onChange={(e) => props.setPricePerDay(e.target.value)} className={`mt-1 block w-full ${inputStyle}`} required={!props.isProfileComplete}/></div>
        </div>

        <div><label htmlFor="languages" className="block text-sm font-medium text-gray-700">Languages Spoken (comma-separated) *</label><input type="text" id="languages" value={props.languages} onChange={(e) => props.setLanguages(e.target.value)} placeholder="e.g., English, Hindi, French" className={`mt-1 block w-full ${inputStyle}`} required={!props.isProfileComplete}/></div>
        <div><label htmlFor="expertiseRegions" className="block text-sm font-medium text-gray-700">Local Areas of Expertise (comma-separated) *</label><input type="text" id="expertiseRegions" value={props.expertiseRegions} onChange={(e) => props.setExpertiseRegions(e.target.value)} placeholder="e.g., Paris City Center, Normandy" className={`mt-1 block w-full ${inputStyle}`} required={!props.isProfileComplete}/></div>
        <div><label htmlFor="specialties" className="block text-sm font-medium text-gray-700">Specialties (comma-separated) *</label><input type="text" id="specialties" value={props.specialties} onChange={(e) => props.setSpecialties(e.target.value)} placeholder="e.g., Food Tours, Art History" className={`mt-1 block w-full ${inputStyle}`} required={!props.isProfileComplete}/></div>
        <div><label htmlFor="availabilitySchedule" className="block text-sm font-medium text-gray-700">Availability Schedule (Description) *</label><textarea id="availabilitySchedule" rows={2} value={props.availabilitySchedule} onChange={(e) => props.setAvailabilitySchedule(e.target.value)} className={`mt-1 block w-full ${inputStyle}`} required={!props.isProfileComplete}></textarea></div>
        <div><label htmlFor="bio" className="block text-sm font-medium text-gray-700">About Me (Public Bio) *</label><textarea id="bio" rows={4} value={props.bio} onChange={(e) => props.setBio(e.target.value)} className={`mt-1 block w-full ${inputStyle}`} required={!props.isProfileComplete}></textarea></div>
    </>
);

const GuidePrivateFields = (props) => (
    <>
        <h2 className="text-xl font-semibold border-t pt-4 mt-4">Private Verification & Payment</h2>
        <p className="text-sm text-gray-600 mb-4">This information is **only** visible to the site Admin. Files must be re-uploaded if you wish to change them.</p>

        <h3 className="text-lg font-medium">Verification Documents (Required)</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700">Aadhaar Number *</label>
            <input type="text" id="aadhaarNumber" value={props.aadhaarNumber} onChange={props.handleAadhaarNumberChange} className={`mt-1 block w-full ${props.inputStyle}`} required={!props.isProfileComplete}/>
            {props.validationErrors.aadhaarNumber && <p className="text-red-500 text-sm mt-1">{props.validationErrors.aadhaarNumber}</p>}
          </div>
          <div>
            <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700">PAN Number *</label>
            <input type="text" id="panNumber" value={props.panNumber} onChange={props.handlePanNumberChange} className={`mt-1 block w-full ${props.inputStyle}`} required={!props.isProfileComplete}/>
            {props.validationErrors.panNumber && <p className="text-red-500 text-sm mt-1">{props.validationErrors.panNumber}</p>}
          </div>
          <div>
            <label htmlFor="tourismLicenseNumber" className="block text-sm font-medium text-gray-700">Tourism License No. (Optional)</label>
            <input type="text" id="tourismLicenseNumber" value={props.tourismLicenseNumber} onChange={(e) => props.setTourismLicenseNumber(e.target.value)} className={`mt-1 block w-full ${props.inputStyle}`}/>
          </div>
          <div><label htmlFor="policeVerificationNumber" className="block text-sm font-medium text-gray-700">Police Verification No. *</label><input type="text" id="policeVerificationNumber" value={props.policeVerificationNumber} onChange={(e) => props.setPoliceVerificationNumber(e.target.value)} className={`mt-1 block w-full ${props.inputStyle}`} required={!props.isProfileComplete}/></div>
        </div>

        {/* --- THIS IS THE UPDATED FILE UPLOAD SECTION --- */}
        <div className="grid grid-cols-2 gap-4 mt-4">
            
            <FileUploadField
              label="Aadhaar Card (Image/PDF) *"
              name="aadhaarCard"
              fileUrl={props.aadhaarCardUrl}
              newFile={props.aadhaarCardFile}
              onChange={props.handleFileChange}
            />
            <FileUploadField
              label="PAN Card (Image/PDF) *"
              name="panCard"
              fileUrl={props.panCardUrl}
              newFile={props.panCardFile}
              onChange={props.handleFileChange}
            />
            <FileUploadField
              label="Tourism License Proof (Optional)"
              name="tourismLicense"
              fileUrl={props.tourismLicenseUrl}
              newFile={props.tourismLicenseFile}
              onChange={props.handleFileChange}
            />
            <FileUploadField
              label="Police Verification Certificate *"
              name="policeVerification"
              fileUrl={props.policeVerificationUrl}
              newFile={props.policeVerificationFile}
              onChange={props.handleFileChange}
            />

        </div>
        
        <h3 className="text-lg font-medium pt-4 border-t mt-4">Payment Details (Required for Payouts)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label htmlFor="bankAccountName" className="block text-sm font-medium text-gray-700">Bank Account Name *</label><input type="text" id="bankAccountName" value={props.bankAccountName} onChange={(e) => props.setBankAccountName(e.target.value)} className={`mt-1 block w-full ${props.inputStyle}`} required={!props.isProfileComplete}/></div>
          <div><label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700">Bank Account Number *</label><input type="text" id="bankAccountNumber" value={props.bankAccountNumber} onChange={(e) => props.setBankAccountNumber(e.target.value)} className={`mt-1 block w-full ${props.inputStyle}`} required={!props.isProfileComplete}/></div>
          <div><label htmlFor="bankIFSC" className="block text-sm font-medium text-gray-700">Bank IFSC Code *</label><input type="text" id="bankIFSC" value={props.bankIFSC} onChange={(e) => props.setBankIFSC(e.target.value)} className={`mt-1 block w-full ${props.inputStyle}`} required={!props.isProfileComplete}/></div>
          <div><label htmlFor="upiId" className="block text-sm font-medium text-gray-700">UPI ID (Optional)</label><input type="text" id="upiId" value={props.upiId} onChange={(e) => props.setUpiId(e.target.value)} className={`mt-1 block w-full ${props.inputStyle}`}/></div>
        </div>
    </>
);

// --- Reusable File Input Component ---
const FileUploadField = ({ label, name, fileUrl, newFile, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        {/* If a URL exists and no new file is being staged, show the "View" link */}
        {fileUrl && !newFile ? (
            <div className="mt-1">
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-green-600 hover:text-green-800">
                    ✓ View Uploaded Document
                </a>
                {/* "Change" button that clicks the hidden input */}
                <label htmlFor={name} className="cursor-pointer text-sm text-blue-500 hover:underline ml-3">Change</label>
                <input type="file" id={name} name={name} onChange={onChange} className="sr-only"/>
            </div>
        ) : (
            // Otherwise, show the file input
            <>
                <input type="file" id={name} name={name} onChange={onChange} className="mt-1 text-sm"/>
                {newFile && <p className="text-xs text-blue-600 mt-1">New: {newFile.name} (Ready to upload)</p>}
            </>
        )}
    </div>
);


// =========================================================================
// --- MAIN USER PROFILE COMPONENT ---
// =========================================================================

const UserProfile = () => {
  const { user: authUser, loading: authLoading, setUser: setAuthUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(authUser);
  const navigate = useNavigate();

  // --- STATE ---
  // Basic
  const [fullName, setFullName] = useState('');
  // Traveller fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [travellerGender, setTravellerGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState({ city: '', state: '', country: '', pincode: '' });
  const [preferredTravelStyle, setPreferredTravelStyle] = useState([]);
  const [preferredLanguages, setPreferredLanguages] = useState(''); 
  const [foodPreference, setFoodPreference] = useState('');
  const [profileBio, setProfileBio] = useState('');
  // Guide fields
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [baseLocation, setBaseLocation] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [languages, setLanguages] = useState('');
  const [expertiseRegions, setExpertiseRegions] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [availabilitySchedule, setAvailabilitySchedule] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [bio, setBio] = useState('');
  // Identity/Payment text fields
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [tourismLicenseNumber, setTourismLicenseNumber] = useState('');
  const [policeVerificationNumber, setPoliceVerificationNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIFSC, setBankIFSC] = useState('');
  const [upiId, setUpiId] = useState('');
  // OTP
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Validation functions
  const validateContactNumber = (value) => {
    const regex = /^\d{10}$/;
    return regex.test(value) ? '' : 'Contact number must be exactly 10 digits.';
  };

  const validateAadhaarNumber = (value) => {
    const regex = /^\d{12}$/;
    return regex.test(value) ? '' : 'Aadhaar number must be exactly 12 digits.';
  };

  const validatePanNumber = (value) => {
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return regex.test(value) ? '' : 'PAN number must be in the format AAAAA9999A.';
  };

  const validateBankIFSC = (value) => {
    const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return regex.test(value) ? '' : 'IFSC code must be 11 characters in the format XXXX0YYYYYY.';
  };

  const validateBankAccountNumber = (value) => {
    const regex = /^\d+$/;
    return regex.test(value) ? '' : 'Bank account number must contain only digits.';
  };

  const validateTourismLicenseNumber = (value) => {
    if (!value) return ''; // Optional field
    const regex = /^[A-Z0-9]{5,}$/;
    return regex.test(value) ? '' : 'Tourism license number must be at least 5 alphanumeric characters.';
  };

  // Handle input changes with validation
  const handleContactNumberChange = (e) => {
    const value = e.target.value;
    setContactNumber(value);
    const error = validateContactNumber(value);
    setValidationErrors(prev => ({ ...prev, contactNumber: error }));
  };

  const handleAadhaarNumberChange = (e) => {
    const value = e.target.value;
    setAadhaarNumber(value);
    const error = validateAadhaarNumber(value);
    setValidationErrors(prev => ({ ...prev, aadhaarNumber: error }));
  };

  const handlePanNumberChange = (e) => {
    const value = e.target.value.toUpperCase();
    setPanNumber(value);
    const error = validatePanNumber(value);
    setValidationErrors(prev => ({ ...prev, panNumber: error }));
  };

  const handleBankIFSCChange = (e) => {
    const value = e.target.value.toUpperCase();
    setBankIFSC(value);
    const error = validateBankIFSC(value);
    setValidationErrors(prev => ({ ...prev, bankIFSC: error }));
  };

  const handleBankAccountNumberChange = (e) => {
    const value = e.target.value;
    setBankAccountNumber(value);
    const error = validateBankAccountNumber(value);
    setValidationErrors(prev => ({ ...prev, bankAccountNumber: error }));
  };

  const handleTourismLicenseNumberChange = (e) => {
    const value = e.target.value.toUpperCase();
    setTourismLicenseNumber(value);
    const error = validateTourismLicenseNumber(value);
    setValidationErrors(prev => ({ ...prev, tourismLicenseNumber: error }));
  };

  // --- FILE STATES ---
  const [avatarFile, setAvatarFile] = useState(null);
  const [aadhaarCardFile, setAadhaarCardFile] = useState(null);
  const [panCardFile, setPanCardFile] = useState(null);
  const [tourismLicenseFile, setTourismLicenseFile] = useState(null);
  const [policeVerificationFile, setPoliceVerificationFile] = useState(null);

  // --- URL/STATUS STATES ---
  const [avatarPreview, setAvatarPreview] = useState('');
  const [aadhaarCardUrl, setAadhaarCardUrl] = useState('');
  const [panCardUrl, setPanCardUrl] = useState('');
  const [tourismLicenseUrl, setTourismLicenseUrl] = useState('');
  const [policeVerificationUrl, setPoliceVerificationUrl] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // --- SINGLE FILE CHANGE HANDLER ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name; 
    
    if (!file) return;

    if (name === 'avatar') {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else if (name === 'aadhaarCard') {
      setAadhaarCardFile(file);
    } else if (name === 'panCard') {
      setPanCardFile(file);
    } else if (name === 'tourismLicense') {
      setTourismLicenseFile(file);
    } else if (name === 'policeVerification') {
      setPoliceVerificationFile(file);
    }
  };

  // Helper to parse comma-separated strings
  const parseArrayString = (arr) => Array.isArray(arr) ? arr.join(', ') : (arr || '');

  // --- Fetch Profile On Load ---
  useEffect(() => {
    if (!authUser || authLoading) return;
    setLoading(true);
    userService.getMyProfile()
      .then(fetchedUser => {
        setCurrentUser(fetchedUser);
        setFullName(fetchedUser.fullName || '');
        setAvatarPreview(fetchedUser.avatar || '');

        if (fetchedUser.travellerProfile) {
            setPhoneNumber(fetchedUser.travellerProfile.phoneNumber || '');
            setTravellerGender(fetchedUser.travellerProfile.gender || '');
            setDateOfBirth(fetchedUser.travellerProfile.dateOfBirth ? fetchedUser.travellerProfile.dateOfBirth.split('T')[0] : '');
            setAddress(fetchedUser.travellerProfile.address || { city: '', state: '', country: '', pincode: '' });
            setPreferredTravelStyle(fetchedUser.travellerProfile.preferredTravelStyle || []);
            setPreferredLanguages(parseArrayString(fetchedUser.travellerProfile.preferredLanguages));
            setFoodPreference(fetchedUser.travellerProfile.foodPreference || '');
            setProfileBio(fetchedUser.travellerProfile.profileBio || '');
        }

        if (fetchedUser.guideProfile) {
            setDob(fetchedUser.guideProfile.dob ? fetchedUser.guideProfile.dob.split('T')[0] : '');
            setGender(fetchedUser.guideProfile.gender || '');
            setContactNumber(fetchedUser.guideProfile.contactNumber || '');
            setBaseLocation(fetchedUser.guideProfile.baseLocation || '');
            setYearsExperience(fetchedUser.guideProfile.yearsExperience || '');
            setLanguages(parseArrayString(fetchedUser.guideProfile.languages));
            setExpertiseRegions(parseArrayString(fetchedUser.guideProfile.expertiseRegions));
            setSpecialties(parseArrayString(fetchedUser.guideProfile.specialties));
            setAvailabilitySchedule(fetchedUser.guideProfile.availabilitySchedule || '');
            setPricePerDay(fetchedUser.guideProfile.pricePerDay || '');
            setBio(fetchedUser.guideProfile.bio || '');
            setOtpVerified(fetchedUser.guideProfile.isContactVerified || false);
        }

        if (fetchedUser.identityVerification) {
            setAadhaarNumber(fetchedUser.identityVerification.aadhaarNumber || '');
            setPanNumber(fetchedUser.identityVerification.panNumber || '');
            setTourismLicenseNumber(fetchedUser.identityVerification.tourismLicenseNumber || '');
            setPoliceVerificationNumber(fetchedUser.identityVerification.policeVerificationNumber || '');
            setAadhaarCardUrl(fetchedUser.identityVerification.aadhaarCard || '');
            setPanCardUrl(fetchedUser.identityVerification.panCard || '');
            setTourismLicenseUrl(fetchedUser.identityVerification.tourismLicense || '');
            setPoliceVerificationUrl(fetchedUser.identityVerification.policeVerification || '');
        }
        if (fetchedUser.paymentDetails) {
            setBankAccountName(fetchedUser.paymentDetails.bankAccountName || '');
            setBankAccountNumber(fetchedUser.paymentDetails.bankAccountNumber || '');
            setBankIFSC(fetchedUser.paymentDetails.bankIFSC || '');
            setUpiId(fetchedUser.paymentDetails.upiId || '');
        }
      })
      .catch(err => {
        setMessage('Error fetching profile data.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [authUser, authLoading]);

  // --- Handle OTP ---
  const handleSendOTP = async (e) => {
    e.preventDefault();
    const numberToSend = currentUser.role === 'guide' ? contactNumber : phoneNumber;
    if (!numberToSend) { setMessage('Please enter a contact number first.'); return; }
    try {
      await userService.sendPhoneOTP({ phoneNumber: numberToSend });
      setOtpSent(true);
      setMessage('OTP sent successfully!');
    } catch (err) {
      setMessage('Failed to send OTP.');
      console.error(err);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const numberToVerify = currentUser.role === 'guide' ? contactNumber : phoneNumber;
    if (!otp) { setMessage('Please enter the OTP.'); return; }
    try {
      const updatedUser = await userService.verifyPhoneOTP({ phoneNumber: numberToVerify, otp });
      setCurrentUser(updatedUser);
      setAuthUser(updatedUser);
      setOtpVerified(true);
      setOtpSent(false);
      setOtp('');
      setMessage('Phone number verified successfully!');
    } catch (err) {
      setMessage('Failed to verify OTP.');
      console.error(err);
    }
  };
  
  // --- Handle Main Profile Submit (Combined Text and Files) ---
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const formData = new FormData();
    
    // Helper to append text fields
    const appendIfPresent = (key, value) => {
        if (value !== null && value !== undefined && value !== '') {
            if (key === 'preferredTravelStyle') { // Handle multi-select
                value.forEach(v => formData.append(`${key}[]`, v));
            } else if (typeof value === 'object' && value.city !== undefined) {
                 // Handle address object
                 formData.append('address[city]', value.city || '');
                 formData.append('address[state]', value.state || '');
                 formData.append('address[country]', value.country || '');
                 formData.append('address[pincode]', value.pincode || '');
            } else {
                 formData.append(key, value);
            }
        }
    };
    
    // --- Append ALL text fields ---
    appendIfPresent('fullName', fullName);
    
    if (currentUser.role === 'user') {
        appendIfPresent('phoneNumber', phoneNumber);
        appendIfPresent('gender', travellerGender);
        appendIfPresent('dateOfBirth', dateOfBirth);
        appendIfPresent('foodPreference', foodPreference);
        appendIfPresent('profileBio', profileBio);
        appendIfPresent('preferredTravelStyle', preferredTravelStyle);
        appendIfPresent('preferredLanguages', preferredLanguages);
        appendIfPresent('address', address); 
    } 
    
    if (currentUser.role === 'guide') {
        // Public Guide Info
        appendIfPresent('dob', dob);
        appendIfPresent('gender', gender);
        appendIfPresent('contactNumber', contactNumber);
        appendIfPresent('baseLocation', baseLocation);
        appendIfPresent('yearsExperience', yearsExperience);
        appendIfPresent('languages', languages);
        appendIfPresent('expertiseRegions', expertiseRegions);
        appendIfPresent('specialties', specialties);
        appendIfPresent('availabilitySchedule', availabilitySchedule);
        appendIfPresent('pricePerDay', pricePerDay);
        appendIfPresent('bio', bio);
        
        // Private Verification/Payment Text
        appendIfPresent('aadhaarNumber', aadhaarNumber);
        appendIfPresent('panNumber', panNumber);
        appendIfPresent('tourismLicenseNumber', tourismLicenseNumber);
        appendIfPresent('policeVerificationNumber', policeVerificationNumber);
        appendIfPresent('bankAccountName', bankAccountName);
        appendIfPresent('bankAccountNumber', bankAccountNumber);
        appendIfPresent('bankIFSC', bankIFSC);
        appendIfPresent('upiId', upiId);
    }

    // --- Append ALL file fields (if they exist) ---
    if (avatarFile) formData.append('avatar', avatarFile);
    if (aadhaarCardFile) formData.append('aadhaarCard', aadhaarCardFile);
    if (panCardFile) formData.append('panCard', panCardFile);
    if (tourismLicenseFile) formData.append('tourismLicense', tourismLicenseFile);
    if (policeVerificationFile) formData.append('policeVerification', policeVerificationFile);

    // --- Validation (Basic client-side check) ---
    if (currentUser.role === 'guide' && !currentUser.isProfileComplete) {
        if (!baseLocation || !pricePerDay || !aadhaarNumber || !bankAccountName) { 
             setMessage('Please fill in all required fields (*) and try again.');
             setIsSubmitting(false); 
             return;
        }
    }
    // -----------------------------------------------------

    try {
      const updatedUser = await userService.updateMyProfile(formData);
      setCurrentUser(updatedUser);
      setAuthUser(updatedUser); // Update global state
      setMessage('Profile updated successfully!');
      
      // --- UPDATE URLS AFTER SAVE ---
      if (updatedUser.identityVerification) {
          setAadhaarCardUrl(updatedUser.identityVerification.aadhaarCard || '');
          setPanCardUrl(updatedUser.identityVerification.panCard || '');
          setTourismLicenseUrl(updatedUser.identityVerification.tourismLicense || '');
          setPoliceVerificationUrl(updatedUser.identityVerification.policeVerification || '');
      }
      setAvatarPreview(updatedUser.avatar || '');

      // Reset file states so they don't show "new file"
      setAvatarFile(null);
      setAadhaarCardFile(null);
      setPanCardFile(null);
      setTourismLicenseFile(null);
      setPoliceVerificationFile(null);
      
      if (updatedUser.role === 'guide' && !currentUser.isProfileComplete && updatedUser.isProfileComplete) {
          navigate('/dashboard-guide');
      }
    } catch (err) {
      setMessage('Failed to save changes. Check server log for validation errors.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <PageLoader text="Loading profile..." />;
  }
  if (!currentUser) return null;

  const user = currentUser;
  const isProfileComplete = user.isProfileComplete;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

      {user.role === 'guide' && !isProfileComplete && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>🧾 Complete Your Guide Profile - Required</strong><br />
          <p className="mt-2">Your guide profile is incomplete. You must fill all *required fields* and upload necessary documents to be visible in the marketplace.</p>
        </div>
      )}

      {/* The form submission is now a single, unified call */}
      <form onSubmit={handleProfileSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200 max-w-4xl space-y-6">
        {message && <p className={`p-3 rounded-md ${message.includes('successfully') ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>{message}</p>}

        {/* --- SECTION 1: BASIC INFO & AVATAR --- */}
        <h2 className="text-xl font-semibold border-b pb-2">Basic Information & Photo</h2>

        <div className="flex items-center space-x-4">
          <img src={avatarPreview || "https://via.placeholder.com/150"} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2"/>
          <div>
            <label htmlFor="avatar-upload" className="block text-sm font-medium text-gray-700">Profile Photo</label>
            {/* Hidden file input */}
            <input id="avatar-upload" name="avatar" type="file" accept="image/*" onChange={handleFileChange} className="sr-only"/>
            {/* Conditional buttons */}
            {avatarPreview ? (
              <div className="mt-1 flex space-x-2">
                <button
                  type="button"
                  onClick={() => document.getElementById('avatar-upload').click()}
                  className="text-sm font-medium text-green-600 hover:text-green-800"
                >
                  Change file
                </button>
                <a
                  href={avatarPreview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View
                </a>
              </div>
            ) : (
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => document.getElementById('avatar-upload').click()}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Choose file
                </button>
              </div>
            )}
            {avatarFile && <p className="text-xs text-blue-600 mt-1">New: {avatarFile.name} (Ready to upload)</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className={`mt-1 block w-full ${inputStyle}`} required/>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (ID)</label>
              <input type="email" id="email" value={user.email} disabled className={`mt-1 block w-full ${inputStyle} bg-gray-100`}/>
            </div>
        </div>

        {/* --- SECTION 2: TRAVELLER PROFILE --- */}
        {user.role === 'user' && (
          <TravellerFields
            phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
            travellerGender={travellerGender} setTravellerGender={setTravellerGender}
            dateOfBirth={dateOfBirth} setDateOfBirth={setDateOfBirth}
            address={address} setAddress={setAddress}
            preferredTravelStyle={preferredTravelStyle} setPreferredTravelStyle={setPreferredTravelStyle}
            preferredLanguages={preferredLanguages} setPreferredLanguages={setPreferredLanguages}
            foodPreference={foodPreference} setFoodPreference={setFoodPreference}
            profileBio={profileBio} setProfileBio={setProfileBio}
            inputStyle={inputStyle}
            // Pass OTP props
            handleSendOTP={handleSendOTP} otpSent={otpSent} otpVerified={otpVerified}
            otp={otp} setOtp={setOtp} handleVerifyOTP={handleVerifyOTP}
          />
        )}

        {/* --- SECTION 3: GUIDE PROFILE (PUBLIC) --- */}
        {user.role === 'guide' && (
          <GuidePublicFields
            dob={dob} setDob={setDob}
            gender={gender} setGender={setGender}
            contactNumber={contactNumber} setContactNumber={setContactNumber}
            handleContactNumberChange={handleContactNumberChange}
            baseLocation={baseLocation} setBaseLocation={setBaseLocation}
            yearsExperience={yearsExperience} setYearsExperience={setYearsExperience}
            languages={languages} setLanguages={setLanguages}
            expertiseRegions={expertiseRegions} setExpertiseRegions={setExpertiseRegions}
            specialties={specialties} setSpecialties={setSpecialties}
            availabilitySchedule={availabilitySchedule} setAvailabilitySchedule={setAvailabilitySchedule}
            pricePerDay={pricePerDay} setPricePerDay={setPricePerDay}
            bio={bio} setBio={setBio}
            handleSendOTP={handleSendOTP} otpSent={otpSent} otpVerified={otpVerified}
            otp={otp} setOtp={setOtp} handleVerifyOTP={handleVerifyOTP}
            isProfileComplete={isProfileComplete}
            inputStyle={inputStyle}
            validationErrors={validationErrors}
          />
        )}

        {/* --- SECTION 4: GUIDE VERIFICATION (PRIVATE) --- */}
        {user.role === 'guide' && (
          <GuidePrivateFields
            aadhaarNumber={aadhaarNumber} setAadhaarNumber={setAadhaarNumber}
            panNumber={panNumber} setPanNumber={setPanNumber}
            tourismLicenseNumber={tourismLicenseNumber} setTourismLicenseNumber={setTourismLicenseNumber}
            policeVerificationNumber={policeVerificationNumber} setPoliceVerificationNumber={setPoliceVerificationNumber}
            bankAccountName={bankAccountName} setBankAccountName={setBankAccountName}
            bankAccountNumber={bankAccountNumber} setBankAccountNumber={setBankAccountNumber}
            bankIFSC={bankIFSC} setBankIFSC={setBankIFSC}
            upiId={upiId} setUpiId={setUpiId}
            // Pass file states and handler
            handleFileChange={handleFileChange}
            aadhaarCardFile={aadhaarCardFile}
            panCardFile={panCardFile}
            tourismLicenseFile={tourismLicenseFile}
            policeVerificationFile={policeVerificationFile}
            // Pass URLs for display
            aadhaarCardUrl={aadhaarCardUrl} 
            panCardUrl={panCardUrl}
            tourismLicenseUrl={tourismLicenseUrl} 
            policeVerificationUrl={policeVerificationUrl}
            isProfileComplete={isProfileComplete}
            inputStyle={inputStyle}
          />
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isProfileComplete ? 'Save Changes' : 'Complete Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;