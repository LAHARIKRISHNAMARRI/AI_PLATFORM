import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/portal/PortalShell";
import { adminNav } from "@/lib/nav-items";

export const Route = createFileRoute("/_authenticated/admin/access")({
  head: () => ({ meta: [{ title: "Access — TeachLearn AI" }] }),
  component: () => (
    <PortalShell role="admin" nav={adminNav} title="Access & Roles" breadcrumbs={["Home", "Access"]}>
      <div className="rounded-2xl bg-card border p-8 text-center text-muted-foreground">
        Role management coming soon. Add teachers from the Teachers page; students self-register with a class code.
      </div>
    </PortalShell>
  ),
});