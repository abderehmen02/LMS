"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { isTeacher } from "@/lib/teacher";

import { SearchInput } from "./search-input";
import { useEffect, useState } from "react";

export const NavbarRoutes = ({fullPageUrl  } : {fullPageUrl : string }  ) => {
  const { userId } = useAuth();
  const pathname = usePathname();
  const [isClient , setIsClient ] = useState(false)
  const isClientSideRendering = typeof window === "object"
  const isTeacherPage = isClientSideRendering ?  pathname?.startsWith("/teacher") : fullPageUrl.includes("/teacher") ; 
  const isCoursePage =  isClientSideRendering ? pathname?.includes("/courses") : fullPageUrl.includes("/courses") ;
  const isSearchPage =  isClientSideRendering ? pathname === "/search" : fullPageUrl.includes("/search") ;



  useEffect(()=>{
    setIsClient(true)
  } , [] )
  
    return     <div>
     {isSearchPage && (
      <div className="hidden md:block">
        <SearchInput />
      </div>
    )}
    <div className="flex gap-x-2 ml-auto">
      {isClient && <UserButton afterSignOutUrl="/" />}
      {isTeacherPage || isCoursePage ? (
        <Link href="/">
          <Button size="sm" variant="ghost">
            <LogOut className="h-4 w-4 mr-2" />
            Exit
          </Button>
        </Link>
      ) : isTeacher(userId) ? (
        <Link href="/teacher/courses">
          <Button size="sm" variant="ghost">
            Teacher mode
          </Button>
        </Link>
      ) : null}
    </div> 
  </div>
    
};
