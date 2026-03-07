// TODO: Add session guard here once backend auth is implemented.
// Should redirect to /signin if no valid session token found.
export const dynamic = "force-dynamic";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
