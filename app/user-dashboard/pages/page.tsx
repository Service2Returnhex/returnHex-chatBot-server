import PagesList from "@/components/userDashboard/PageList";

export default function Page() {
  return (
    <div className=" overflow-hidden">
      <h1 className="text-xl md:text-2xl font-bold  p-6">User Dashboard</h1>
      <PagesList />
    </div>
  );
}