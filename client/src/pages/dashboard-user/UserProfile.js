import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loaders';
import { userService } from '../../services/user.service'; // <-- Used for fetching and saving

const UserProfile = () => {
  // Use a local state for the full user object to manage updates
  const { user: authUser, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState(authUser);

  // Form state
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [bio, setBio] = useState(currentUser?.guideProfile?.bio || '');
  const [location, setLocation] = useState(currentUser?.guideProfile?.location || '');
  const [price, setPrice] = useState(currentUser?.guideProfile?.pricePerDay || 0);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // --- 1. FETCH PROFILE ON LOAD ---
  useEffect(() => {
    // If we're already loading auth data or don't have a user, skip.
    if (!authUser || authLoading) return;
    
    const fetchProfile = async () => {
        setLoading(true);
        try {
            // Fetch the most recent data from the server
            const fetchedUser = await userService.getMyProfile();
            setCurrentUser(fetchedUser);
            
            // Re-initialize form state with fetched data
            setFullName(fetchedUser.fullName);
            setBio(fetchedUser.guideProfile?.bio || '');
            setLocation(fetchedUser.guideProfile?.location || '');
            setPrice(fetchedUser.guideProfile?.pricePerDay || 0);
        } catch (err) {
            setMessage('Error fetching profile data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchProfile();
  }, [authUser, authLoading]); // Reruns when the user object changes

  // --- 2. HANDLE SUBMIT AND SAVE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    const profileData = {
      fullName,
      // Only include guideProfile if the user is a guide
      ...(currentUser.role === 'guide' && { 
          bio, 
          location, 
          pricePerDay: price 
      })
    };

    try {
      // Call the API service to update the data
      const updatedUser = await userService.updateMyProfile(profileData);
      
      // Update local state and AuthContext (optional: force refresh for auth context)
      setCurrentUser(updatedUser);
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

  const user = currentUser; // Use the local state for rendering

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200 max-w-2xl space-y-6">
        {message && <p className={`p-3 rounded-md ${message.includes('successfully') ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>{message}</p>}
        
        {/* Full Name Input */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Email Input (Disabled) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (cannot be changed)</label>
          <input
            type="email"
            id="email"
            value={user.email}
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
          />
        </div>

        {/* --- Guide-Only Fields --- */}
        {user.role === 'guide' && (
          <>
            <h2 className="text-xl font-semibold border-t pt-4 mt-4">Public Guide Information</h2>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Your Primary Location</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Paris, France"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">About Me (Public Bio)</label>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell travelers about yourself and your expertise..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              ></textarea>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price per Day (USD)</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;