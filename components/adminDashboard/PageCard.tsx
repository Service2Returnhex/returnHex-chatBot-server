export default function PageCard() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="card-bg p-5 rounded-lg shadow border border-gray-700 hover:shadow-md hover:shadow-gray-700 cursor-pointer">
          <p className="text-gray-400">Total Pages</p>
          <h2 className="text-2xl font-bold">3</h2>
          <span className="text-xs text-gray-500">Configured bot pages</span>
        </div>
        <div className="card-bg p-5 rounded-lg shadow border border-gray-700 hover:shadow-md hover:shadow-gray-700 cursor-pointer">
          <p className="text-gray-400">Active Pages</p>
          <h2 className="text-2xl font-bold">2</h2>
          <span className="text-xs text-gray-500">Currently running</span>
        </div>
        <div className="card-bg p-5 rounded-lg shadow border border-gray-700 hover:shadow-md hover:shadow-gray-700 cursor-pointer">
          <p className="text-gray-400">Total Users</p>
          <h2 className="text-2xl font-bold">42</h2>
          <span className="text-xs text-gray-500">Registered users</span>
        </div>
      </div>
    </div>
  );
}
