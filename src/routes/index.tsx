import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const roleSet = new Set((roles ?? []).map((r) => r.role as string));
    if (roleSet.has("admin")) throw redirect({ to: "/admin" });
    if (roleSet.has("teacher")) throw redirect({ to: "/teacher" });
    throw redirect({ to: "/student" });
  },
  component: () => null,
});