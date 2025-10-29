import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loaders';
// import { userService } from '../../services/user.service'; // We'll use this later

const UserProfile = () => {
  const { user, loading: authLoading } = useAuth();
  
  // Use user data to pre-fill the form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Guide-specific fields
  const [bio, setBio] = useState(user?.guideProfile?.bio || '');
  const [location, setLocation] = useState(user?.guideProfile?.location || '');
  const [price, setPrice] = useState(user?.guideProfile?.pricePerDay || 0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // This is where you would call your user service
    // const profileData = {
    //   fullName,
    //   ...(user.role === 'guide' && { guideProfile: { bio, location, pricePerDay: price } })
    // };
    // try {
    //   const updatedUser = await userService.updateMyProfile(profileData);
    //   setMessage('Profile updated successfully!');
    //   // You would also need to update the user in AuthContext
    // } catch (err) {
    //   setMessage('Failed to update profile.');
    // }

    // Mock success
    setTimeout(() => {
      setLoading(false);
      setMessage('Profile updated successfully! (Mock)');
    }, 1000);
  };

  if (authLoading) {
    return <PageLoader text="Loading profile..." />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200 max-w-2xl space-y-6">
        {message && <p className="text-green-600 bg-green-100 p-3 rounded-md">{message}</p>}
        
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

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (cannot be changed)</label>
          <input
            type="email"
            id="email"
            value={email}
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
          />
        </div>

        {/* --- Guide-Only Fields --- */}
        {user.role === 'guide' && (
          <>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Your Location</label>
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
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">About Me (Bio)</label>
              <textarea
                id="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell travelers about yourself..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              ></textarea>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price per Day ($)</label>
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
          <Button type="submit" loading={loading} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;