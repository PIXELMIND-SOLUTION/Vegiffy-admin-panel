import jsPDF from "jspdf";
import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { FaEye, FaFileDownload, FaPrint } from "react-icons/fa";

const EmployeeSalaryList = () => {
    const [data, setData] = useState([
        { id: 1, employeeName: "Honorato Imogene Curry Terry", salaryMonth: "2024-04", totalSalary: "550.00" },
        { id: 2, employeeName: "Maisha Lucy Zamora Gonzales", salaryMonth: "2024-04", totalSalary: "-2,020.00" },
        { id: 3, employeeName: "Amy Aphrodite Zamora Peck", salaryMonth: "2024-04", totalSalary: "4,000.00" },
    ]);

    const handlePayslip = (employee) => {
        alert(`Payroll Posting Sheet for ${employee.employeeName}`);
    };

    const handleDownload = (employee) => {
        const doc = new jsPDF();
        doc.text(`Payslip for ${employee.employeeName}`, 10, 10);
        doc.text(`Salary Month: ${employee.salaryMonth}`, 10, 20);
        doc.text(`Total Salary: ${employee.totalSalary}`, 10, 30);
        doc.save(`${employee.employeeName}_Payslip.pdf`);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <div className="w-full p-4 bg-white rounded-lg shadow-md">
                <h2 className="mb-4 text-xl font-bold">Employee Salary</h2>
                <div className="flex justify-between mb-4">
                    <div>
                        <label className="mr-2">Show</label>
                        <select className="p-1 border rounded">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                            <option>100</option>
                        </select>
                        <label className="ml-2">entries</label>
                    </div>
                    <input type="text" placeholder="Search" className="p-1 border rounded" />
                </div>
                <table className="w-full border border-collapse border-gray-200">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">SI</th>
                            <th className="p-2 border">Employee Name</th>
                            <th className="p-2 border">Salary Month</th>
                            <th className="p-2 border">Total Salary</th>
                            <th className="p-2 border">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item.id} className="text-center bg-white border">
                                <td className="p-2 border">{index + 1}</td>
                                <td className="p-2 border">{item.employeeName}</td>
                                <td className="p-2 border">{item.salaryMonth}</td>
                                <td className="p-2 border">{item.totalSalary}</td>
                                <td className="flex justify-center gap-2 p-2 border">
                                    <button onClick={() => handlePayslip(item)} className="flex items-center gap-1 px-3 py-1 text-yellow-700 bg-yellow-100 border border-yellow-600 rounded">
                                        <FaEye /> Payslip
                                    </button>
                                    <button onClick={() => handleDownload(item)} className="flex items-center gap-1 px-3 py-1 text-green-700 bg-green-100 border border-green-600 rounded">
                                        <FaFileDownload /> Download
                                    </button>
                                    <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1 text-blue-700 bg-blue-100 border border-blue-600 rounded">
                                        <FaPrint /> Print
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-between mt-4">
                    <span>Showing 1 to {data.length} of {data.length} entries</span>
                    <div className="flex gap-1">
                        <button className="p-1 border rounded">Previous</button>
                        <button className="p-1 text-white bg-green-500 border rounded">1</button>
                        <button className="p-1 border rounded">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeSalaryList;
