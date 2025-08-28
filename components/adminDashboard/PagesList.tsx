const botPages = [
  {
    name: "TechStore Bot",
    pageId: "123456789",
    owner: "John Doe",
    token: "EAax••••••••••••xxxx",
    created: "1/15/2024",
    status: "active",
  },
  {
    name: "Restaurant Helper",
    pageId: "987654321",
    owner: "Jane Smith",
    token: "EAay••••••••••••yyyy",
    created: "1/10/2024",
    status: "active",
  },
  {
    name: "Support Bot",
    pageId: "456789123",
    owner: "Mike Johnson",
    token: "EAaz••••••••••••zzzz",
    created: "1/8/2024",
    status: "inactive",
  },
];
export default function PagesList() {
  return (
    <div>
      {/* Bot Pages Management */}
      <div className="card-bg p-5 rounded-lg shadow border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Bot Pages Management</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-2">Page Name</th>
              <th className="p-2">Page ID</th>
              <th className="p-2">Owner</th>
              <th className="p-2">Access Token</th>
              <th className="p-2">Created</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {botPages.map((page, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="p-2 font-semibold">{page.name}</td>
                <td className="p-2">{page.pageId}</td>
                <td className="p-2">{page.owner}</td>
                <td className="p-2">{page.token}</td>
                <td className="p-2">{page.created}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
                      page.status === "active" ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    {page.status}
                  </span>
                </td>
                <td className="p-2 cursor-pointer">⋮</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
