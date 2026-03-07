import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// TODO: Read role from session/cookie once auth is implemented, then redirect accordingly.
// For now defaults to /freelancer as placeholder.
export default function DashboardPage() {
  redirect("/freelancer");
}
