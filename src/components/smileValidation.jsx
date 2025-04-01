import { useState } from 'react';
import { toast } from 'sonner';


export const useSmileValidation = () => {
  const [isPredictDisabled, setIsPredictDisabled] = useState(false);
  const [showPredictButton, setShowPredictButton] = useState(false);

  const validateSmileString = async (smileString, activeTab, setActiveTab) => {
    setIsPredictDisabled(true);

    try {
      const response = await fetch('https://caitapimus.azure-api.net/retro-python/smile_validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence: smileString }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData === "Not valid") {
        toast.error('Please enter a valid SMILES string.', { className: 'mt-14' });
        setShowPredictButton(false);
      } else {
        toast.success('Your SMILES string has been successfully validated.', { className: 'mt-14' });
        if (activeTab === 'smile') setActiveTab('visual');
        setShowPredictButton(true);
      }
    } catch (error) {
      console.error('Error validating SMILES string:', error);
      toast.error(`Error validating SMILES string: ${error.message}`);
    } finally {
      setIsPredictDisabled(false);
    }
  };

  return { validateSmileString, isPredictDisabled, showPredictButton };
};
