import type { Metadata } from "next";
import UnsubscribeButton from "./UnsubscribeButton";

// A CAN-SPAM opt-out link. It must keep working indefinitely (no expiry, no
// revocation) and must never be indexed, followed, archived or snippeted —
// the token in the URL should never leak into search results or caches.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },
};

export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div>
      {/* Hero */}
      <section className="text-center mb-10 md:mb-14">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
          <span className="text-hsp-red">Unsubscribe</span>{" "}
          <span className="text-hsp-dark">from College Contacts</span>
        </h1>
      </section>

      {/* Card */}
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        {/* The page hands the button only the opaque token — no row data, no email. */}
        <UnsubscribeButton token={token} />
      </div>
    </div>
  );
}
