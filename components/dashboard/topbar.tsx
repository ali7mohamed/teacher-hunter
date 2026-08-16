"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DashboardTopbar({ email }: { email: string | null }) {
  const initials = email ? email.slice(0, 2).toUpperCase() : "TH";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 md:px-6">
      <span className="text-sm text-muted-foreground md:hidden">Teacher Hunter</span>
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <form action={logout}>
          <Button variant="ghost" size="icon" type="submit" aria-label="Sign out">
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
