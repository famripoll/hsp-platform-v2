// Deliberately minimal chrome. A coach reaching this route has asked to stop
// receiving messages, so the public Header's conversion links (Sign Up, Login,
// nav) and the Footer are omitted. Only the wordmark stays — not linked
// anywhere — so the coach can still see who they are unsubscribing from.
export default function UnsubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-16 flex items-center justify-center">
          <span className="flex items-baseline gap-1 font-black text-2xl md:text-3xl leading-none">
            <span className="text-hsp-red">High</span>
            <span className="text-hsp-dark">School</span>
            <span className="text-hsp-dark">Prospect</span>
          </span>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto pt-4 px-4 md:pt-8 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
