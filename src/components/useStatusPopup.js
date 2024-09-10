import { useState } from 'react';

// Custom hook for status popup
export const useStatusPopup = () => {
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState('success'); // 'success' or 'error'
    const [showStatusPopup, setShowStatusPopup] = useState(false);
  
    const showStatus = (message, type = 'success', duration = 3000) => {
      setStatusMessage(message);
      setStatusType(type);
      setShowStatusPopup(true);
  
      setTimeout(() => {
        setShowStatusPopup(false);
      }, duration);
    };
  
    return { statusMessage, statusType, showStatusPopup, showStatus };
};