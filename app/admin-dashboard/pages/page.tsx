import PagesList from "@/components/adminDashboard/PagesList";

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <PagesList />
    </div>
  );
}