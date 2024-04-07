import { NavbarRoutes } from "@/components/navbar-routes";

import { MobileSidebar } from "./mobile-sidebar";

export const Navbar = ({fullPageUrl} : {fullPageUrl : string }) => {
  return (
    <div className="p-4 border-b h-full flex bg-white items-center shadow-sm">
      <MobileSidebar />
      <NavbarRoutes  fullPageUrl={fullPageUrl}/>
    </div>
  );
};
