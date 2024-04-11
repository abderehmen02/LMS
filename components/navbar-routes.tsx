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
  const isTeacherPage =   pathname?.startsWith("/teacher")  ; 
  const isCoursePage =   pathname?.includes("/courses") 
  const isSearchPage =   pathname === "/search" 



  useEffect(()=>{
    setIsClient(true)
  } , [] )
  
    return     <div className="flex justify-around px-12 w-full" >
     {isSearchPage && (
      <div className="hidden md:block">
        <SearchInput />
      </div>
    )}
    <div className="flex gap-x-2 ml-auto">
      {isClient && <UserButton afterSignOutUrl="/" />}
      { isClient &&  (isTeacherPage || isCoursePage ? (
        <Link href="/">
          <Button  size="sm" variant="ghost"  >
      {  isClient &&     <LogOut className="h-4 w-4 mr-2" />}
            Exit
          </Button>
        </Link>
      ) : isTeacher(userId)  ? (
        <Link href="/teacher/courses">
          <Button size="sm" variant="ghost">
            Teacher mode
          </Button>
        </Link>
      ) : null)}
    </div> 
  </div>
    
};
