import React, { createContext, useState } from 'react';

export const ResetChatContext = createContext();

export const ResetProvider = ({ children }) => {
  const [resetChat, setResetChat] = useState(false);

  return (
    <ResetChatContext.Provider value={{ resetChat, setResetChat }}>
      {children}
    </ResetChatContext.Provider>
  );
};