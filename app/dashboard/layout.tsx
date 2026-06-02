export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#F2F3F3" }}
    >
      {children}
    </div>
  );
}
