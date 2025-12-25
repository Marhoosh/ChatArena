import { Outlet } from "@tanstack/react-router";
import SessionProvider from './SessionContext'


const Provider = () => {
  return (
    <SessionProvider>
      <Outlet />
    </SessionProvider>
  );
};

export default Provider;
