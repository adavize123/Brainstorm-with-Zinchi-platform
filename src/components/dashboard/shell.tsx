"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { GraduationCap, Menu, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { initials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { studentNav, prospectorNav, adminNav } from "@/lib/nav";

const navByKey = {
  student: studentNav,
  prospector: prospectorNav,
  admin: adminNav,
};

export function DashboardShell({
  navKey,
  role,
  userName,
  userEmail,
  profileHref,
  children,
}: {
  navKey: "student" | "prospector" | "admin";
  role: string;
  userName: string;
  userEmail: string;
  profileHref?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const navItems = navByKey[navKey];

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2 px-2 py-4 font-bold text-primary">
        <GraduationCap className="h-6 w-6" />
        <span className="text-sm leading-tight">
          Brainstorm with
          <br />
          <span className="text-secondary">Zinchi</span>
        </span>
      </Link>
      <div className="flex-1 overflow-y-auto px-2">
        <SidebarNav items={navItems} onNavigate={() => setOpen(false)} />
      </div>
      <div className="border-t p-3">
        <Badge variant="outline" className="w-full justify-center">
          {role}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20 md:grid md:grid-cols-[260px_1fr]">
      <aside className="hidden md:block border-r bg-background">{SidebarContent}</aside>

      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              {SidebarContent}
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials(userName)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs font-normal text-muted-foreground">{userEmail}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {profileHref && (
                <DropdownMenuItem asChild>
                  <Link href={profileHref}>
                    <UserIcon className="h-4 w-4 mr-2" /> Profile
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
