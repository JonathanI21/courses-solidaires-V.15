import React, { useState } from 'react';
import ProfileSelector from './components/ProfileSelector';
import PastillesInterface from './components/PastillesInterface';

type ProfileType = 'household' | 'social_worker' | 'association' | 'beneficiary' | null;

function App() {
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>(null);

  const handleSelectProfile = (profile: ProfileType) => {
    setSelectedProfile(profile);
  };

  const handleBackToSelector = () => {
    setSelectedProfile(null);
  };

  return (
    <div className="min-h-screen">
      {selectedProfile ? (
        <PastillesInterface 
          profileType={selectedProfile} 
          onBack={handleBackToSelector} 
        />
      ) : (
        <ProfileSelector onSelectProfile={handleSelectProfile} />
      )}
    </div>
  );
}

export default App;