import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import usersData from "./assets/users.json";
import accountsData from "./assets/accounts.json";
import callsData from "./assets/calls.json";
import emailsData from "./assets/emails.json";
const users = usersData.map((user) => user.userName);

const mockAccountDetails = [
  {
    accountName: "Account111",
    totalCalls: 10,
    totalEmails: 12,
    latestCallDate: "16/07/2024",
    latestEmailDate: "25/07/2024",
  },
  {
    accountName: "Account114",
    totalCalls: 9,
    totalEmails: 11,
    latestCallDate: "05/07/2024",
    latestEmailDate: "25/07/2024",
  },
  {
    accountName: "Account123",
    totalCalls: 5,
    totalEmails: 2,
    latestCallDate: "07/07/2024",
    latestEmailDate: "15/06/2024",
  },
];

function PieChart({ data, onSegmentClick, selectedSegment }) {
  let total = Object.values(data).reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    return (
      <svg viewBox="0 0 200 200" className="w-full max-w-md mx-auto"></svg>
    );
  }

  let startAngle = 0;
  let segments = [];
  let labels = [];

  Object.entries(data).forEach(([key, value]) => {
    const percentage = (value / total) * 100;
    const endAngle = startAngle + (value / total) * 2 * Math.PI;

    const x1 = Math.cos(startAngle) * 100 + 100;
    const y1 = Math.sin(startAngle) * 100 + 100;
    const x2 = Math.cos(endAngle) * 100 + 100;
    const y2 = Math.sin(endAngle) * 100 + 100;

    const largeArcFlag = percentage > 50 ? 1 : 0;

    const pathData = [
      `M 100 100`,
      `L ${x1} ${y1}`,
      `A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    const color =
      key === "Face to Face"
        ? "#2563eb"
        : key === "Office"
        ? "#60a5fa"
        : key === "Phone"
        ? "#93c5fd"
        : key === "Email"
        ? "#bfdbfe"
        : "#dbeafe";

    const midAngle = startAngle + (endAngle - startAngle) / 2;
    const labelRadius = 75;
    const labelX = Math.cos(midAngle) * labelRadius + 100;
    const labelY = Math.sin(midAngle) * labelRadius + 100;

    segments.push(
      <path
        key={key}
        d={pathData}
        fill={color}
        stroke="white"
        strokeWidth="1"
        onClick={() => onSegmentClick(key)}
        className={`cursor-pointer transition-opacity duration-200 ${
          selectedSegment && selectedSegment !== key
            ? "opacity-50"
            : "opacity-100"
        }`}
      />
    );

    labels.push(
      <g key={`label-${key}`} className="select-none">
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#1e3a8a"
          fontSize="8"
          fontWeight="500"
          className={`${
            selectedSegment && selectedSegment !== key
              ? "opacity-50"
              : "opacity-100"
          }`}
        >
          {key}
          <tspan x={labelX} y={labelY + 10}>
            {percentage.toFixed(1)}%
          </tspan>
        </text>
      </g>
    );

    startAngle = endAngle;
  });

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-md mx-auto">
      {segments}
      {labels}
    </svg>
  );
}

function App() {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [pieChartData, setPieChartData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageAccounts, setCurrentPageAccounts] = useState(1);
  const itemsPerPage = 12;
  const itemsPerPageAccounts = 12;

  useEffect(() => {
    if (selectedUser) {
      const user = usersData.find((user) => user.userName === selectedUser);
      if (user) {
        const accounts = accountsData.filter(
          (account) => account.territory === user.territory
        );
        setFilteredAccounts(accounts);

        const accountIds = accounts.map((account) => account.id);
        const calls = callsData.filter((call) =>
          accountIds.includes(call.accountId)
        );

        const emails = emailsData.filter((email) =>
          accountIds.includes(email.accountId)
        );

        setFilteredCalls(calls);
        setFilteredEmails(emails);
        setPieChartData(
          calls.reduce((acc, call) => {
            acc[call.callType] = (acc[call.callType] || 0) + 1;
            return acc;
          }, {})
        );
      }
    } else {
      setFilteredAccounts([]);
      setFilteredCalls([]);
      setFilteredEmails([]);
      setPieChartData({});
    }
  }, [selectedUser]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSegment]);

  const indexOfLastCall = currentPage * itemsPerPage;
  const indexOfFirstCall = indexOfLastCall - itemsPerPage;
  const selectedSegmentCall = filteredCalls.filter(
    (call) => call.callType === selectedSegment
  );

  const totalPages = Math.ceil(selectedSegmentCall.length / itemsPerPage);
  const SelectedUserTerritory = usersData
    .filter((user) => user.userName == selectedUser)
    .map((user) => user.territory);
  const indexOfLastAccount = currentPageAccounts * itemsPerPageAccounts;
  const indexOfFirstAccount = indexOfLastAccount - itemsPerPageAccounts;
  const currentAccounts = filteredAccounts
    .filter((account) => account.territory == SelectedUserTerritory[0])
    .slice(indexOfFirstAccount, indexOfLastAccount);

  const totalPagesAccounts = Math.ceil(
    filteredAccounts.filter(
      (account) => account.territory == SelectedUserTerritory[0]
    ).length / itemsPerPageAccounts
  );

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // const SelectedUserTerritory = usersData
  //   .filter((user) => user.userName == selectedUser)
  //   .map((user) => user.territory);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="flex flex-col">
              <span className="text-left text-white text-sm">Select User</span>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-80 p-2 rounded"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {!selectedUser ? (
        <>
          <div className="max-w-8xl mx-auto p-8 text-center text-blue-800 bg-sky-100 font-bold mt-2">
            Please select a user to view Analytics.
          </div>
          <div className="max-w-8xl mx-auto p-8 text-center text-blue-800 bg-sky-100 font-bold mt-2">
            Please select a user to view account details.
          </div>
        </>
      ) : (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex flex-wrap gap-4 mb-4 justify-center">
                {Object.entries(pieChartData).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setSelectedSegment(key)}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${
                        key === "Face to Face"
                          ? "bg-blue-600"
                          : key === "Office"
                          ? "bg-blue-400"
                          : key === "Phone"
                          ? "bg-blue-300"
                          : key === "Email"
                          ? "bg-blue-200"
                          : "bg-blue-100"
                      }`}
                    />
                    <span className="text-sm">{key}</span>
                  </div>
                ))}
              </div>
              <PieChart
                data={pieChartData}
                onSegmentClick={setSelectedSegment}
                selectedSegment={selectedSegment}
              />
            </div>

            {selectedSegment && (
              <div className="bg-[#dbeafe] p-6 rounded-lg shadow">
                <h3 className="font-bold mb-4 text-center text-[#1e3a8a]">
                  {selectedSegment} Details
                </h3>
                <table className="w-full">
                  <thead className="bg-[#bfdbfe]">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm text-[#60a5fa]">
                        Call ID
                      </th>
                      <th className="px-4 py-2 text-left text-sm text-[#60a5fa]">
                        Account Name
                      </th>
                      <th className="px-4 py-2 text-left text-sm text-[#60a5fa]">
                        Call Date
                      </th>
                      <th className="px-4 py-2 text-left text-sm text-[#60a5fa]">
                        Call Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSegmentCall
                      .slice(indexOfFirstCall, indexOfLastCall)
                      .map((call) => (
                        <tr key={call.id} className="border-t">
                          <td className="px-4 py-2 text-sm">{call.id}</td>
                          <td className="px-4 py-2 text-sm">
                            {filteredAccounts.find(
                              (account) => account.id === call.accountId
                            )?.name || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {new Date(call.callDate).toLocaleDateString(
                              "en-IN"
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {call.callStatus}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                <div className="flex justify-between mt-4">
                  <button
                    className="flex items-center gap-1 text-sm text-blue-600"
                    onClick={previousPage}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    className="flex items-center gap-1 text-sm text-blue-600"
                    onClick={nextPage}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#dbeafe] p-6 rounded-lg shadow">
            <h3 className="font-bold mb-4 text-center text-[#1e3a8a]">
              {selectedUser}'s Territory Account Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#bfdbfe]">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm text-[#60a5fa]">
                      Account Name
                    </th>
                    <th className="px-4 py-2 text-left text-sm text-[#60a5fa]">
                      Total Calls
                    </th>
                    <th className="px-4 py-2 text-left text-sm text-[#60a5fa]">
                      Total Emails
                    </th>
                    <th className="px-4 py-2 text-left text-sm text-[#60a5fa]">
                      Latest Call Date
                    </th>
                    <th className="px-4 py-2 text-left text-sm text-[#60a5fa]">
                      Latest Email Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentAccounts.map((account) => (
                    <tr key={account.name} className="border-t">
                      <td className="px-4 py-2 text-sm">{account.name}</td>
                      <td className="px-4 py-2 text-sm">
                        {
                          filteredCalls.filter(
                            (call) => call.accountId === account.id
                          ).length
                        }
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {
                          filteredEmails.filter(
                            (call) => call.accountId === account.id
                          ).length
                        }
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {filteredCalls
                          .filter((call) => call.accountId === account.id)
                          .reduce((latest, call) => {
                            const callDate = new Date(call.callDate);
                            return latest > callDate ? latest : callDate;
                          }, new Date(0))
                          .toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {filteredEmails
                          .filter((call) => call.accountId === account.id)
                          .reduce((latest, call) => {
                            const emailDate = new Date(call.emailDate);
                            return latest > emailDate ? latest : emailDate;
                          }, new Date(0))
                          .toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-4">
              <button
                className="flex items-center gap-1 text-sm text-blue-600"
                onClick={() =>
                  setCurrentPageAccounts((prev) => Math.max(prev - 1, 1))
                }
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="text-sm text-gray-600">
                {currentPageAccounts} / {totalPagesAccounts}
              </span>
              <button
                className="flex items-center gap-1 text-sm text-blue-600"
                onClick={() =>
                  setCurrentPageAccounts((prev) =>
                    Math.min(prev + 1, totalPagesAccounts)
                  )
                }
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// export default App;
