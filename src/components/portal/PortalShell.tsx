import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, Calendar, GraduationCap, LogOut, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type NavItem = { label: string; to: string; icon: ReactNode };

export function PortalShell({
  role,
  nav,
  title,
  breadcrumbs,
  children,
}: {
  role: "teacher" | "student" | "admin";
  nav: NavItem[];
  title: string;
  breadcrumbs?: string[];
  children: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string; department: string | null; class_name: string | null } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("full_name,department,class_name")
        .eq("id", data.user.id)
        .maybeSingle();
      if (p) setProfile(p);
    });
  }, []);

  const initials = (profile?.full_name || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleLabel = role === "teacher" ? "Teacher Portal" : role === "student" ? "Student Portal" : "Admin Portal";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border/40">
          <div className="size-9 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="size-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display font-bold leading-none">TeachLearn AI</div>
            <div className="text-[11px] opacity-70 mt-1">{roleLabel}</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {nav.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <span className="size-4 flex items-center justify-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border/40 p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <Avatar className="size-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{profile?.full_name || "User"}</div>
              <div className="text-xs opacity-70 truncate">
                {role === "student" ? profile?.class_name || "Student" : profile?.department || roleLabel}
              </div>
            </div>
          </div>
          <button
            className="mt-2 flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
            onClick={async () => {
              await supabase.auth.signOut();
              toast.success("Signed out");
              navigate({ to: "/auth" });
            }}
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-border/60 bg-card/60 backdrop-blur px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((o) => !o)}>
              <Menu className="size-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="font-display text-xl font-bold truncate">{title}</h1>
              {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="text-xs text-muted-foreground truncate">{breadcrumbs.join(" › ")}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative size-9 rounded-full bg-secondary flex items-center justify-center hover:bg-accent">
              <Bell className="size-4" />
              <span className="absolute top-1 right-1 size-2 rounded-full bg-destructive" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs">
              <Calendar className="size-3.5 text-primary" />
              <div>
                <div className="text-[10px] uppercase text-muted-foreground leading-none">Academic Year</div>
                <div className="font-medium leading-none mt-0.5">2025 – 2026</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}