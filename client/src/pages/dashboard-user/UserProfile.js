import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loaders';
import { userService } from '../../services/user.service';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const { user: authUser, loading: authLoading, setUser: setAuthUser } = useAuth(); // Get setUser to update context
  const [currentUser, setCurrentUser] = useState(authUser);

  // Form state - Initialize with potentially fetched data
  const [fullName, setFullName] = useState('');
  // Traveller fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [travellerGender, setTravellerGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState({ city: '', state: '', country: '', pincode: '' });
  const [preferredTravelStyle, setPreferredTravelStyle] = useState([]);
  const [preferredLanguages, setPreferredLanguages] = useState([]);
  const [foodPreference, setFoodPreference] = useState('');
  const [profileBio, setProfileBio] = useState('');
  // Guide fields
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [baseLocation, setBaseLocation] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [languages, setLanguages] = useState(''); // Simple comma-separated for now
  const [expertiseRegions, setExpertiseRegions] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [availabilitySchedule, setAvailabilitySchedule] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [bio, setBio] = useState('');
  // Identity verification fields
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [tourismLicenseNumber, setTourismLicenseNumber] = useState('');
  const [policeVerificationNumber, setPoliceVerificationNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIFSC, setBankIFSC] = useState('');
  const [upiId, setUpiId] = useState('');
  // OTP verification
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  // Avatar upload
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  // Document URLs for display
  const [aadhaarCardUrl, setAadhaarCardUrl] = useState('');
  const [panCardUrl, setPanCardUrl] = useState('');
  const [tourismLicenseUrl, setTourismLicenseUrl] = useState('');
  const [policeVerificationUrl, setPoliceVerificationUrl] = useState('');
  // Track upload status for each document
  const [aadhaarCardUploaded, setAadhaarCardUploaded] = useState(false);
  const [panCardUploaded, setPanCardUploaded] = useState(false);
  const [tourismLicenseUploaded, setTourismLicenseUploaded] = useState(false);
  const [policeVerificationUploaded, setPoliceVerificationUploaded] = useState(false);

  const [loading, setLoading] = useState(true); // Start loading true
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // --- Fetch Profile On Load ---
  useEffect(() => {
    if (!authUser || authLoading) return;
    setLoading(true);
    userService.getMyProfile()
      .then(fetchedUser => {
        setCurrentUser(fetchedUser);
        // Initialize form fields from fetched data
        setFullName(fetchedUser.fullName || '');
        // Traveller fields
        setPhoneNumber(fetchedUser.travellerProfile?.phoneNumber || '');
        setTravellerGender(fetchedUser.travellerProfile?.gender || '');
        setDateOfBirth(fetchedUser.travellerProfile?.dateOfBirth ? fetchedUser.travellerProfile.dateOfBirth.split('T')[0] : '');
        setAddress(fetchedUser.travellerProfile?.address || { city: '', state: '', country: '', pincode: '' });
        setPreferredTravelStyle(fetchedUser.travellerProfile?.preferredTravelStyle || []);
        setPreferredLanguages(fetchedUser.travellerProfile?.preferredLanguages || []);
        setFoodPreference(fetchedUser.travellerProfile?.foodPreference || '');
        setProfileBio(fetchedUser.travellerProfile?.profileBio || '');
        // Guide fields
        setDob(fetchedUser.guideProfile?.dob ? fetchedUser.guideProfile.dob.split('T')[0] : '');
        setGender(fetchedUser.guideProfile?.gender || '');
        setContactNumber(fetchedUser.guideProfile?.contactNumber || '');
        setBaseLocation(fetchedUser.guideProfile?.baseLocation || '');
        setYearsExperience(fetchedUser.guideProfile?.yearsExperience || '');
        setLanguages(fetchedUser.guideProfile?.languages?.join(', ') || '');
        setExpertiseRegions(fetchedUser.guideProfile?.expertiseRegions?.join(', ') || '');
        setSpecialties(fetchedUser.guideProfile?.specialties?.join(', ') || '');
        setAvailabilitySchedule(fetchedUser.guideProfile?.availabilitySchedule || '');
        setPricePerDay(fetchedUser.guideProfile?.pricePerDay || '');
        setBio(fetchedUser.guideProfile?.bio || '');
        setAadhaarNumber(fetchedUser.identityVerification?.aadhaarNumber || '');
        setPanNumber(fetchedUser.identityVerification?.panNumber || '');
        setTourismLicenseNumber(fetchedUser.identityVerification?.tourismLicenseNumber || '');
        setPoliceVerificationNumber(fetchedUser.identityVerification?.policeVerificationNumber || '');
        // Set document URLs for display
        setAadhaarCardUrl(fetchedUser.identityVerification?.aadhaarCard || '');
        setPanCardUrl(fetchedUser.identityVerification?.panCard || '');
        setTourismLicenseUrl(fetchedUser.identityVerification?.tourismLicense || '');
        setPoliceVerificationUrl(fetchedUser.identityVerification?.policeVerification || '');
        // Set upload status based on whether documents exist
        setAadhaarCardUploaded(!!fetchedUser.identityVerification?.aadhaarCard);
        setPanCardUploaded(!!fetchedUser.identityVerification?.panCard);
        setTourismLicenseUploaded(!!fetchedUser.identityVerification?.tourismLicense);
        setPoliceVerificationUploaded(!!fetchedUser.identityVerification?.policeVerification);
        setBankAccountName(fetchedUser.paymentDetails?.bankAccountName || '');
        setBankAccountNumber(fetchedUser.paymentDetails?.bankAccountNumber || '');
        setBankIFSC(fetchedUser.paymentDetails?.bankIFSC || '');
        setUpiId(fetchedUser.paymentDetails?.upiId || '');
        setOtpVerified(fetchedUser.guideProfile?.isContactVerified || false);
        setAvatarPreview(fetchedUser.avatar || '');
      })
      .catch(err => {
        setMessage('Error fetching profile data.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [authUser, authLoading]);

  // --- Handle Avatar Upload ---
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    try {
      const updatedUser = await userService.uploadAvatar(formData);
      setCurrentUser(updatedUser);
      setAuthUser(updatedUser);
      setAvatarPreview(updatedUser.avatar);
      setMessage('Avatar uploaded successfully!');
    } catch (err) {
      setMessage('Failed to upload avatar.');
      console.error(err);
    }
  };

  // --- Handle Identity Document Upload ---
  const handleIdentityUpload = async (field, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append(field, file);
    try {
      const updatedUser = await userService.uploadIdentityDoc(field, formData);
      setCurrentUser(updatedUser);
      setAuthUser(updatedUser);
      // Update the specific document URL state
      if (field === 'aadhaarCard') {
        setAadhaarCardUrl(updatedUser.identityVerification?.aadhaarCard || '');
        setAadhaarCardUploaded(true);
      }
      if (field === 'panCard') {
        setPanCardUrl(updatedUser.identityVerification?.panCard || '');
        setPanCardUploaded(true);
      }
      if (field === 'tourismLicense') {
        setTourismLicenseUrl(updatedUser.identityVerification?.tourismLicense || '');
        setTourismLicenseUploaded(true);
      }
      if (field === 'policeVerification') {
        setPoliceVerificationUrl(updatedUser.identityVerification?.policeVerification || '');
        setPoliceVerificationUploaded(true);
      }
      setMessage(`${field} uploaded successfully!`);
    } catch (err) {
      setMessage(`Failed to upload ${field}.`);
      console.error(err);
    }
  };

  // --- Handle OTP ---
  const handleSendOTP = async () => {
    if (!contactNumber) {
      setMessage('Please enter a contact number first.');
      return;
    }
    try {
      await userService.sendPhoneOTP({ phoneNumber: contactNumber });
      setOtpSent(true);
      setMessage('OTP sent successfully!');
    } catch (err) {
      setMessage('Failed to send OTP.');
      console.error(err);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setMessage('Please enter the OTP.');
      return;
    }
    try {
      const updatedUser = await userService.verifyPhoneOTP({ phoneNumber: contactNumber, otp });
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

  // --- Handle Complete Profile Submit ---
  const handleCompleteProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Validate required fields
    if (!fullName || !dob || !gender || !contactNumber || !baseLocation || !yearsExperience || !languages || !expertiseRegions || !specialties || !availabilitySchedule || !pricePerDay || !bio || !bankAccountName || !bankAccountNumber || !bankIFSC) {
      setMessage('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    // Validate required document uploads
    if (!aadhaarCardUploaded || !panCardUploaded || !policeVerificationUploaded) {
      setMessage('Please upload all required identity documents (Aadhaar Card, PAN Card, Police Verification).');
      setIsSubmitting(false);
      return;
    }

    const profileData = {
      fullName,
      dob,
      gender,
      contactNumber,
      baseLocation,
      yearsExperience: Number(yearsExperience),
      languages,
      expertiseRegions,
      specialties,
      availabilitySchedule,
      pricePerDay: Number(pricePerDay),
      bio,
      aadhaarNumber,
      panNumber,
      tourismLicenseNumber,
      policeVerificationNumber,
      bankAccountName,
      bankAccountNumber,
      bankIFSC,
      upiId: upiId || undefined
    };

    try {
      const updatedUser = await userService.updateGuideProfile(profileData);
      setCurrentUser(updatedUser);
      setAuthUser(updatedUser);
      setMessage('Profile completed successfully!');
      // Redirect to guide dashboard
      navigate('/dashboard-guide');
    } catch (err) {
      setMessage('Failed to complete profile. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handle Basic Profile Submit ---
  const handleBasicProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // For traveller users, no required fields, so allow saving even if fields are empty
    const profileData = {
      fullName,
      // Include travellerProfile if the user is a traveller
      ...(currentUser.role === 'user' && {
        phoneNumber: phoneNumber || undefined,
        gender: travellerGender || undefined,
        dateOfBirth: dateOfBirth || undefined,
        address: address || undefined,
        preferredTravelStyle: preferredTravelStyle || undefined,
        preferredLanguages: preferredLanguages || undefined,
        foodPreference: foodPreference || undefined,
        profileBio: profileBio || undefined,
      }),
      // Only include guideProfile if the user is a guide
      ...(currentUser.role === 'guide' && {
          dob: dob || undefined,
          gender: gender || undefined,
          contactNumber: contactNumber || undefined,
          baseLocation: baseLocation || undefined,
          yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
          languages: languages.split(',').map(s => s.trim()).filter(Boolean),
          expertiseRegions: expertiseRegions.split(',').map(s => s.trim()).filter(Boolean),
          specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
          availabilitySchedule: availabilitySchedule || undefined,
          pricePerDay: pricePerDay ? Number(pricePerDay) : undefined,
          bio: bio || undefined,
      })
    };

    try {
      const updatedUser = await userService.updateMyProfile(profileData);
      setCurrentUser(updatedUser);
      setAuthUser(updatedUser);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Failed to save changes. Please try again.');
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
          <p className="mt-2">Your guide profile is incomplete. To access the guide dashboard and appear in the Guide Marketplace, you must:</p>
          <ul className="mt-2 ml-4 list-disc">
            <li>Fill in all personal and professional details</li>
            <li>Upload all required identity documents</li>
            <li>Verify your mobile number with OTP</li>
            <li>Provide complete payment information</li>
          </ul>
          <p className="mt-2 font-semibold">Complete profiles only will be visible to users booking guides.</p>
        </div>
      )}

      <form onSubmit={user.role === 'guide' && !isProfileComplete ? handleCompleteProfileSubmit : handleBasicProfileSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200 max-w-2xl space-y-6">
        {message && <p className={`p-3 rounded-md ${message.includes('successfully') ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>{message}</p>}

        <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>
        {/* Profile Photo Upload */}
        <div className="flex items-center space-x-4">
          <img src={avatarPreview || "https://via.placeholder.com/150"} alt="Avatar" className="w-24 h-24 rounded-full object-cover"/>
          <div>
            <label htmlFor="avatar-upload" className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">Change Photo</label>
            <input id="avatar-upload" name="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only"/>
            {avatarFile && (
              <Button onClick={handleAvatarUpload} className="ml-2" size="sm">
                Upload
              </Button>
            )}
          </div>
        </div>
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name *</label>
          <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full input-style" required/>
        </div>
        {/* Email (Disabled) */}
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (cannot be changed)</label>
            <input type="email" id="email" value={user.email} disabled className="mt-1 block w-full input-style bg-gray-100"/>
        </div>

        {/* --- Traveller-Only Fields --- */}
        {user.role === 'user' && (
          <>
            <h2 className="text-xl font-semibold border-t pt-4 mt-4">Traveller Profile</h2>
            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="tel" id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="mt-1 block w-full input-style"/>
            </div>
            {/* Gender */}
            <div>
              <label htmlFor="travellerGender" className="block text-sm font-medium text-gray-700">Gender</label>
              <select id="travellerGender" value={travellerGender} onChange={(e) => setTravellerGender(e.target.value)} className="mt-1 block w-full input-style">
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input type="date" id="dateOfBirth" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mt-1 block w-full input-style"/>
            </div>
            {/* Address */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <input type="text" id="city" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="mt-1 block w-full input-style"/>
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                <input type="text" id="state" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="mt-1 block w-full input-style"/>
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                <input type="text" id="country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} className="mt-1 block w-full input-style"/>
              </div>
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
                <input type="text" id="pincode" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} className="mt-1 block w-full input-style"/>
              </div>
            </div>
            {/* Preferred Travel Style */}
            <div>
              <label htmlFor="preferredTravelStyle" className="block text-sm font-medium text-gray-700">Preferred Travel Style</label>
              <select multiple id="preferredTravelStyle" value={preferredTravelStyle} onChange={(e) => setPreferredTravelStyle(Array.from(e.target.selectedOptions, option => option.value))} className="mt-1 block w-full input-style">
                <option value="Adventure">Adventure</option>
                <option value="Relaxation">Relaxation</option>
                <option value="Cultural">Cultural</option>
                <option value="Nature">Nature</option>
                <option value="Luxury">Luxury</option>
                <option value="Budget">Budget</option>
                <option value="Solo">Solo</option>
                <option value="Family">Family</option>
              </select>
            </div>
            {/* Preferred Languages */}
            <div>
              <label htmlFor="preferredLanguages" className="block text-sm font-medium text-gray-700">Preferred Languages</label>
              <input type="text" id="preferredLanguages" value={preferredLanguages.join(', ')} onChange={(e) => setPreferredLanguages(e.target.value.split(',').map(s => s.trim()))} placeholder="e.g., English, Hindi, French" className="mt-1 block w-full input-style"/>
            </div>
            {/* Food Preference */}
            <div>
              <label htmlFor="foodPreference" className="block text-sm font-medium text-gray-700">Food Preference</label>
              <select id="foodPreference" value={foodPreference} onChange={(e) => setFoodPreference(e.target.value)} className="mt-1 block w-full input-style">
                <option value="">Select...</option>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Vegan">Vegan</option>
                <option value="Jain">Jain</option>
                <option value="Halal">Halal</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {/* Profile Bio */}
            <div>
              <label htmlFor="profileBio" className="block text-sm font-medium text-gray-700">Profile Bio</label>
              <textarea id="profileBio" rows={4} value={profileBio} onChange={(e) => setProfileBio(e.target.value)} placeholder="Tell us about yourself..." className="mt-1 block w-full input-style"></textarea>
            </div>
          </>
        )}

        {/* --- Guide-Only Fields --- */}
        {user.role === 'guide' && (
          <>
            <h2 className="text-xl font-semibold border-t pt-4 mt-4">Public Guide Information</h2>
            {/* DOB */}
            <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                <input type="date" id="dob" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1 block w-full input-style" required={!isProfileComplete}/>
            </div>
             {/* Gender */}
            <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender *</label>
                <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="mt-1 block w-full input-style" required={!isProfileComplete}>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            {/* Contact Number */}
            <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number *</label>
                <div className="flex space-x-2">
                  <input type="tel" id="contactNumber" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="mt-1 block w-full input-style" required={!isProfileComplete}/>
                  {!otpVerified && (
                    <Button onClick={handleSendOTP} size="sm" disabled={!contactNumber}>
                      {otpSent ? 'Resend OTP' : 'Send OTP'}
                    </Button>
                  )}
                  {otpVerified && <span className="text-green-600 mt-2">✓ Verified</span>}
                </div>
                {otpSent && !otpVerified && (
                  <div className="mt-2 flex space-x-2">
                    <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="flex-1 input-style"/>
                    <Button onClick={handleVerifyOTP} size="sm">Verify</Button>
                  </div>
                )}
            </div>
            {/* Base Location */}
            <div>
                <label htmlFor="baseLocation" className="block text-sm font-medium text-gray-700">Current City / Base Location *</label>
                <input type="text" id="baseLocation" value={baseLocation} onChange={(e) => setBaseLocation(e.target.value)} className="mt-1 block w-full input-style" required={!isProfileComplete}/>
            </div>

            <h2 className="text-xl font-semibold border-t pt-4 mt-4">Professional Details</h2>
            {/* Years Experience */}
            <div>
                <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700">Years of Experience *</label>
                <input type="number" id="yearsExperience" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className="mt-1 block w-full input-style" required={!isProfileComplete}/>
            </div>
            {/* Languages */}
            <div>
                <label htmlFor="languages" className="block text-sm font-medium text-gray-700">Languages Spoken (comma-separated) *</label>
                <input type="text" id="languages" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="e.g., English, Hindi, French" className="mt-1 block w-full input-style" required={!isProfileComplete}/>
            </div>
            {/* Expertise Regions */}
            <div>
                <label htmlFor="expertiseRegions" className="block text-sm font-medium text-gray-700">Local Areas of Expertise (comma-separated) *</label>
                <input type="text" id="expertiseRegions" value={expertiseRegions} onChange={(e) => setExpertiseRegions(e.target.value)} placeholder="e.g., Paris City Center, Normandy" className="mt-1 block w-full input-style" required={!isProfileComplete}/>
            </div>
            {/* Specialties */}
            <div>
                <label htmlFor="specialties" className="block text-sm font-medium text-gray-700">Specialties (comma-separated) *</label>
                <input type="text" id="specialties" value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="e.g., Food Tours, Art History" className="mt-1 block w-full input-style" required={!isProfileComplete}/>
            </div>
            {/* Availability */}
            <div>
                <label htmlFor="availabilitySchedule" className="block text-sm font-medium text-gray-700">Availability Schedule (Description) *</label>
                <textarea id="availabilitySchedule" rows={3} value={availabilitySchedule} onChange={(e) => setAvailabilitySchedule(e.target.value)} placeholder="e.g., Weekends only, Flexible hours" className="mt-1 block w-full input-style" required={!isProfileComplete}></textarea>
            </div>
            {/* Price Per Day */}
            <div>
                <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700">Price per Day (USD) *</label>
                <input type="number" id="pricePerDay" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} className="mt-1 block w-full input-style" required={!isProfileComplete}/>
            </div>
            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">About Me (Public Bio) *</label>
              <textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell travelers about yourself and your expertise..." className="mt-1 block w-full input-style" required={!isProfileComplete}></textarea>
            </div>

                <h2 className="text-xl font-semibold border-t pt-4 mt-4">Identity Verification</h2>
                {/* Aadhaar Card Upload */}
                <div>
                    <label htmlFor="aadhaarCard" className={`block text-sm font-medium cursor-pointer ${aadhaarCardUploaded ? 'text-green-600' : 'text-gray-700'}`}>{aadhaarCardUploaded ? 'Change Aadhaar Card' : 'Choose Aadhaar Card'}</label>
                    <input type="file" id="aadhaarCard" accept="image/*,application/pdf" onChange={(e) => handleIdentityUpload('aadhaarCard', e.target.files[0])} className="sr-only"/>
                    {aadhaarCardUrl && (
                        <div className="mt-2">
                            <a href={aadhaarCardUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">View Aadhaar Card</a>
                        </div>
                    )}
                </div>
                {/* PAN Card Upload */}
                <div>
                    <label htmlFor="panCard" className={`block text-sm font-medium cursor-pointer ${panCardUploaded ? 'text-green-600' : 'text-gray-700'}`}>{panCardUploaded ? 'Change PAN Card' : 'Choose PAN Card'}</label>
                    <input type="file" id="panCard" accept="image/*,application/pdf" onChange={(e) => handleIdentityUpload('panCard', e.target.files[0])} className="sr-only"/>
                    {panCardUrl && (
                        <div className="mt-2">
                            <a href={panCardUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">View PAN Card</a>
                        </div>
                    )}
                </div>
                {/* Tourism License Upload */}
                <div>
                    <label htmlFor="tourismLicense" className={`block text-sm font-medium cursor-pointer ${tourismLicenseUploaded ? 'text-green-600' : 'text-gray-700'}`}>{tourismLicenseUploaded ? 'Change Tourism License' : 'Choose Tourism License'}</label>
                    <input type="file" id="tourismLicense" accept="image/*,application/pdf" onChange={(e) => handleIdentityUpload('tourismLicense', e.target.files[0])} className="sr-only"/>
                    {tourismLicenseUrl && (
                        <div className="mt-2">
                            <a href={tourismLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">View Tourism License</a>
                        </div>
                    )}
                </div>
                {/* Police Verification Upload */}
                <div>
                    <label htmlFor="policeVerification" className={`block text-sm font-medium cursor-pointer ${policeVerificationUploaded ? 'text-green-600' : 'text-gray-700'}`}>{policeVerificationUploaded ? 'Change Police Verification' : 'Choose Police Verification'}</label>
                    <input type="file" id="policeVerification" accept="image/*,application/pdf" onChange={(e) => handleIdentityUpload('policeVerification', e.target.files[0])} className="sr-only"/>
                    {policeVerificationUrl && (
                        <div className="mt-2">
                            <a href={policeVerificationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">View Police Verification</a>
                        </div>
                    )}
                </div>

                <h2 className="text-xl font-semibold border-t pt-4 mt-4">Payment Details</h2>
                {/* Bank Account Name */}
                <div>
                    <label htmlFor="bankAccountName" className="block text-sm font-medium text-gray-700">Bank Account Name *</label>
                    <input type="text" id="bankAccountName" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} className="mt-1 block w-full input-style" required={!isProfileComplete}/>
                </div>
                {/* Bank Account Number */}
                <div>
                    <label htmlFor="bankAccountNumber" className="block text-sm font-medium text-gray-700">Bank Account Number *</label>
                    <input type="text" id="bankAccountNumber" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className="mt-1 block w-full input-style" required={!isProfileComplete}/>
                </div>
                {/* Bank IFSC */}
                <div>
                    <label htmlFor="bankIFSC" className="block text-sm font-medium text-gray-700">Bank IFSC Code *</label>
                    <input type="text" id="bankIFSC" value={bankIFSC} onChange={(e) => setBankIFSC(e.target.value)} className="mt-1 block w-full input-style" required={!isProfileComplete}/>
                </div>
                {/* UPI ID */}
                <div>
                    <label htmlFor="upiId" className="block text-sm font-medium text-gray-700">UPI ID (Optional)</label>
                    <input type="text" id="upiId" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="mt-1 block w-full input-style"/>
                </div>
          </>
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

// Add basic input styling (e.g., in your index.css)
// .input-style {
//   @apply px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500;
// }

export default UserProfile;