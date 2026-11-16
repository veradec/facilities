import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminReviewClient from "@/components/admin/AdminReviewClient";
import AdminSignIn from "@/components/admin/AdminSignIn";

export const dynamic = "force-dynamic";

export default async function ApprovalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    return <AdminSignIn />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pending submissions</h1>
        <form action="/api/auth/signout" method="post"><input type="hidden" name="callbackUrl" value="/approval" /><button className="rounded border px-3 py-2 text-sm">Sign out</button></form>
      </div>
      <AdminReviewClient />
    </div>
  );
}
