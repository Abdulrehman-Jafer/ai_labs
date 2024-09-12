import { createContext, ReactNode, useContext, useState } from "react";

const Auth_State_Context = createContext({
  user: null,
  set_user: null,
});

export const Auth_State_Provider = ({ children }: { children: ReactNode }) => {
  const [user, set_user] = useState(null);
  return (
    <Auth_State_Context.Provider value={{ user, set_user }}>
      {children}
    </Auth_State_Context.Provider>
  );
};

export const use_Auth_State = () => {
  const { user, set_user } = useContext(Auth_State_Context);

  return { user, set_user };
};
