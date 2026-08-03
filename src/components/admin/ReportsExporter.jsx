import React, { useState } from 'react';
import { FileText, Download, Printer, Table, FileSpreadsheet, CheckCircle2, Filter } from 'lucide-react';

export default function ReportsExporter({ 
  bookings = [], 
  orders = [], 
  customers = [], 
  techs = [], 
  products = [] 
}) {
  const [reportType, setReportType] = useState('bookings'); // 'bookings' | 'revenue' | 'customers' | 'techs' | 'products'
  const [dateRange, setDateRange] = useState('all'); // 'all' | 'today' | 'week' | 'month'

  // Helper to trigger CSV file download
  const exportToCSV = (filename, rows) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map(row => {
          return keys
            .map(k => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
              cell = cell.replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportCSV = () => {
    if (reportType === 'bookings') {
      const rows = bookings.map(b => ({
        'Booking ID': b.bookingId || b.id,
        'Customer Name': b.customerName || 'Anonymous',
        'Phone': b.phone || '',
        'Service Type': b.serviceType || '',
        'Preferred Date': b.preferredDate || '',
        'Time Slot': b.preferredTimeSlot || '',
        'Status': b.status || '',
        'Technician': b.technician || 'Unassigned',
        'Address': b.address || ''
      }));
      exportToCSV('ElectroFix_Bookings_Report', rows);
    } else if (reportType === 'revenue') {
      const rows = orders.map(o => ({
        'Order ID': o.orderId,
        'Customer': o.shippingAddress?.fullname || o.email,
        'Date': o.date || '',
        'Total Price (INR)': o.costs?.total || o.total || 0,
        'Payment Method': o.paymentDetails?.method || 'COD',
        'Payment Status': o.paymentStatus || 'Pending',
        'Order Status': o.status
      }));
      exportToCSV('ElectroFix_Revenue_Orders_Report', rows);
    } else if (reportType === 'customers') {
      const rows = customers.map(c => ({
        'User ID': c.id || c._id,
        'Name': c.name || '',
        'Email': c.email || '',
        'Phone': c.phone || '',
        'Role': c.role || 'Customer',
        'Status': c.blocked ? 'Blocked' : 'Active',
        'Created Date': c.createdAt || ''
      }));
      exportToCSV('ElectroFix_Customers_Report', rows);
    } else if (reportType === 'techs') {
      const rows = techs.map(t => ({
        'Technician ID': t.id,
        'Name': t.name || '',
        'Areas Covered': t.areas || '',
        'Duty Status': t.status || '',
        'Rating': t.rating || 5.0,
        'Jobs Finished': t.jobs || 0
      }));
      exportToCSV('ElectroFix_Technician_Performance_Report', rows);
    } else if (reportType === 'products') {
      const rows = products.map(p => ({
        'Product ID': p.id,
        'Name': p.name || '',
        'Brand': p.brand || '',
        'Category': p.category || '',
        'Price (INR)': p.price || 0,
        'Stock Remaining': p.stock || 0,
        'Warranty': p.warranty || ''
      }));
      exportToCSV('ElectroFix_Product_Inventory_Report', rows);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            Executive Reports & Export Engine
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Generate, inspect, and export formatted CSV, Excel, or PDF reports.</p>
        </div>

        {/* Export Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { id: 'bookings', label: 'Booking Report', count: bookings.length },
          { id: 'revenue', label: 'Revenue Report', count: `₹${orders.reduce((a, b) => a + (b.costs?.total || b.total || 0), 0).toLocaleString()}` },
          { id: 'customers', label: 'Customer Report', count: customers.length },
          { id: 'techs', label: 'Technician Report', count: techs.length },
          { id: 'products', label: 'Product Sales', count: products.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id)}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              reportType === tab.id 
                ? 'bg-blue-50/80 border-blue-600 text-blue-950 font-bold shadow-sm' 
                : 'bg-slate-50 border-slate-150 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{tab.label}</span>
            <span className="text-sm font-black text-slate-900 mt-0.5 block">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Summary Preview Table */}
      <div className="border border-slate-150 rounded-2xl overflow-hidden">
        <div className="bg-slate-50 p-3 border-b border-slate-150 flex justify-between items-center text-xs font-bold text-slate-700">
          <span className="uppercase tracking-wider text-[10px] text-slate-400">Live Report Preview ({reportType})</span>
          <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Ready for Export</span>
        </div>

        <div className="overflow-x-auto max-h-[300px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-500 font-bold uppercase text-[9px] tracking-wider border-b border-slate-200">
                {reportType === 'bookings' && (
                  <>
                    <th className="p-3">Booking ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                  </>
                )}
                {reportType === 'revenue' && (
                  <>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Status</th>
                  </>
                )}
                {reportType === 'customers' && (
                  <>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                  </>
                )}
                {reportType === 'techs' && (
                  <>
                    <th className="p-3">Engineer Name</th>
                    <th className="p-3">Territories</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Completed Jobs</th>
                  </>
                )}
                {reportType === 'products' && (
                  <>
                    <th className="p-3">Product ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {reportType === 'bookings' && bookings.slice(0, 10).map(b => (
                <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold">{b.bookingId || b.id.substring(0,8)}</td>
                  <td className="p-3 font-semibold">{b.customerName || 'Anonymous'}</td>
                  <td className="p-3 text-slate-600">{b.serviceType}</td>
                  <td className="p-3 text-slate-500">{b.preferredDate}</td>
                  <td className="p-3 font-bold">{b.status}</td>
                </tr>
              ))}

              {reportType === 'revenue' && orders.slice(0, 10).map(o => (
                <tr key={o._id || o.orderId} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold">{o.orderId}</td>
                  <td className="p-3 font-semibold">{o.shippingAddress?.fullname || o.email}</td>
                  <td className="p-3 font-bold text-slate-900">₹{o.costs?.total || o.total || 0}</td>
                  <td className="p-3 text-slate-600">{o.paymentDetails?.method || 'COD'} ({o.paymentStatus || 'Pending'})</td>
                  <td className="p-3 font-bold">{o.status}</td>
                </tr>
              ))}

              {reportType === 'customers' && customers.slice(0, 10).map(c => (
                <tr key={c.id || c._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold">{c.id || c._id}</td>
                  <td className="p-3 font-semibold">{c.name}</td>
                  <td className="p-3 text-slate-600">{c.email}</td>
                  <td className="p-3 font-bold uppercase text-[10px] text-slate-500">{c.role || 'Customer'}</td>
                  <td className="p-3 font-bold">{c.blocked ? 'Blocked' : 'Active'}</td>
                </tr>
              ))}

              {reportType === 'techs' && techs.slice(0, 10).map(t => (
                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{t.name}</td>
                  <td className="p-3 text-slate-600">{t.areas}</td>
                  <td className="p-3 font-bold text-slate-800">{t.status}</td>
                  <td className="p-3 font-bold text-amber-600">★ {t.rating}</td>
                  <td className="p-3 font-semibold text-slate-700">{t.jobs || 0} Finished</td>
                </tr>
              ))}

              {reportType === 'products' && products.slice(0, 10).map(p => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold">{p.id}</td>
                  <td className="p-3 font-semibold">{p.name}</td>
                  <td className="p-3 text-slate-600">{p.category}</td>
                  <td className="p-3 font-bold text-slate-900">₹{p.price}</td>
                  <td className="p-3 font-bold text-slate-700">{p.stock} Units</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
