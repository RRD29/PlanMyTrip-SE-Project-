import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import useApi from '../../hooks/useApi';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Loaders';



const MOCK_AVAILABILITY = [
  '2025-11-20',
  '2025-11-21',
  '2025-11-25',
];


const MyAvailability = () => {
  
  
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  
  
  const [selectedDates, setSelectedDates] = useState(new Set(MOCK_AVAILABILITY));

  
  useEffect(() => {
    
    
    
    
    
    
    setLoading(false); 
  }, []);

  
  const handleDateClick = (date) => {
    const dateString = date.toISOString().split('T')[0]; 
    
    
    setSelectedDates(prevDates => {
      const newDates = new Set(prevDates);
      if (newDates.has(dateString)) {
        newDates.delete(dateString); 
      } else {
        newDates.add(dateString); 
      }
      return newDates;
    });
  };

  
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setError(null);
    
    
    
    
    
    
    
    
    
    
    
    
    
    setTimeout(() => {
      console.log('Saving:', Array.from(selectedDates));
      setIsSaving(false);
      alert('Availability saved!');
    }, 1000);
  };

  
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      if (selectedDates.has(dateString)) {
        return 'react-calendar__tile--available'; 
      }
    }
    return null;
  };

  if (loading) {
    return <PageLoader text="Loading your calendar..." />;
  }
  
  if (error && !isSaving) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Manage Your Availability</h1>
      
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <p className="text-gray-600 mb-4">
          Click on dates to toggle your availability. Green dates are when
          you are marked as available for new bookings.
        </p>
        
        {}
        <style>
          {`
            .react-calendar__tile--available {
              background-color: #d1fae5; /* Tailwind green-100 */
              color: #065f46; /* Tailwind green-800 */
              border-radius: 8px;
            }
            .react-calendar__tile--available:hover {
              background-color: #a7f3d0; /* Tailwind green-200 */
            }
            .react-calendar__tile:disabled {
              background-color: #f3f4f6; /* Tailwind gray-100 */
            }
          `}
        </style>
        
        <div className="flex justify-center">
          <Calendar
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
            minDate={new Date()} 
            className="border-none p-4"
          />
        </div>

        <div className="mt-6 flex justify-end items-center">
          {error && <p className="text-red-500 mr-4">Failed to save.</p>}
          <Button
            size="lg"
            onClick={handleSaveChanges}
            loading={isSaving}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyAvailability;