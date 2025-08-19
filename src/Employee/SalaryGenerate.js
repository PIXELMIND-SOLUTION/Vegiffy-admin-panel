import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCheckCircle, FaListAlt } from "react-icons/fa";

const PayrollPostingSheet = () => (
    <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Payroll posting sheet</h2>
        <h3 className="text-xl font-bold text-center text-green-600">(Approved)</h3>
        <table className="w-full mt-4 border border-collapse border-gray-300">
            <thead>
                <tr className="bg-gray-300">
                    <th className="p-2 border">Description</th>
                    <th className="p-2 border">Debit</th>
                    <th className="p-2 border">Credit</th>
                </tr>
            </thead>
            <tbody>
                <tr><td className="p-2 border font-bold">Gross salary</td><td className="p-2 border">79,038.00</td><td className="p-2 border"></td></tr>
                <tr><td className="p-2 border font-bold">Net salary</td><td className="p-2 border"></td><td className="p-2 border">7-19,554.00</td></tr>
                <tr><td className="p-2 border font-bold">Loans</td><td className="p-2 border"></td><td className="p-2 border">728,592.00</td></tr>
            </tbody>
        </table>
    </div>
);

const SalaryChart = () => (
    <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Employee salary chart</h2>
        <table className="w-full mt-4 border border-collapse border-gray-300">
            <thead>
                <tr className="bg-gray-300">
                    <th className="p-2 border">SI</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Gross Salary</th>
                    <th className="p-2 border">Net Salary</th>
                </tr>
            </thead>
            <tbody>
                <tr><td className="p-2 border">1</td><td className="p-2 border">Honorato Imogene</td><td className="p-2 border">1570</td><td className="p-2 border">-11105</td></tr>
                <tr><td className="p-2 border">2</td><td className="p-2 border">Maisha Lucy</td><td className="p-2 border">0</td><td className="p-2 border">-10000</td></tr>
            </tbody>
        </table>
    </div>
);

const SalaryGenerateList = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState(null);
    const [data, setData] = useState([
        { id: 1, salaryName: "2047-02", generateDate: "2025-03-05", generateBy: "Admin", status: "Approved", approvedDate: "2025-03-05", approvedBy: "Admin" },
        { id: 2, salaryName: "2035-01", generateDate: "2025-03-01", generateBy: "Admin", status: "Approved", approvedDate: "2025-03-03", approvedBy: "Admin" },
    ]);

    const handleGenerate = () => {
        const newEntry = {
            id: data.length + 1,
            salaryName: selectedDate.toISOString().slice(0, 7),
            generateDate: new Date().toISOString().slice(0, 10),
            generateBy: "Admin",
            status: "Approved",
            approvedDate: new Date().toISOString().slice(0, 10),
            approvedBy: "Admin"
        };
        setData([...data, newEntry]);
    };

    if (view === "payroll") return <PayrollPostingSheet />;
    if (view === "salaryChart") return <SalaryChart />;

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <div className="flex gap-4">
                <div className="w-1/3 p-4 bg-white rounded-lg shadow-md">
                    <h2 className="mb-2 text-xl font-bold">Select salary month</h2>
                    <label className="block font-semibold">Salary month *</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="MMMM, yyyy"
                        showMonthYearPicker
                        className="w-full p-2 mt-2 border rounded"
                    />
                    <button onClick={handleGenerate} className="px-4 py-2 mt-4 text-blue-700 bg-blue-100 border border-blue-600 rounded">Generate</button>
                </div>
                <div className="w-2/3 p-4 bg-white rounded-lg shadow-md">
                    <h2 className="mb-4 text-xl font-bold">Salary list</h2>
                    <table className="w-full border border-collapse border-gray-200">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="p-2 border">SI</th>
                                <th className="p-2 border">Salary name</th>
                                <th className="p-2 border">Generate date</th>
                                <th className="p-2 border">Generate by</th>
                                <th className="p-2 border">Status</th>
                                <th className="p-2 border">Approved date</th>
                                <th className="p-2 border">Approved by</th>
                                <th className="p-2 border">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={item.id} className="text-center bg-white border">
                                    <td className="p-2 border">{index + 1}</td>
                                    <td className="p-2 border">{item.salaryName}</td>
                                    <td className="p-2 border">{item.generateDate}</td>
                                    <td className="p-2 border">{item.generateBy}</td>
                                    <td className="p-2 text-green-600 border">{item.status}</td>
                                    <td className="p-2 border">{item.approvedDate}</td>
                                    <td className="p-2 border">{item.approvedBy}</td>
                                    <td className="flex justify-center gap-2 p-2 border">
                                        <button onClick={() => setView("payroll")} className="px-2 py-1 text-blue-700 bg-blue-100 border border-blue-600 rounded">
                                            <FaCheckCircle />
                                        </button>
                                        <button onClick={() => setView("salaryChart")} className="px-2 py-1 text-gray-700 bg-gray-100 border border-gray-600 rounded">
                                            <FaListAlt />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalaryGenerateList;
