import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateSystemReport = (stats: any) => {
    const doc = new jsPDF() as any;
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const fileNameDate = format(new Date(), 'yyyy-MM-dd');

    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); // Blue 900
    doc.text('Apex Care - System Report', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${timestamp}`, 14, 30);
    doc.line(14, 35, 196, 35);

    // Section 1: Key Metrics
    doc.setFontSize(16);
    doc.setTextColor(50);
    doc.text('Key Performance Metrics', 14, 45);

    const metricsData = [
        ['Metric', 'Value'],
        ['Total Customers', stats?.counts?.users || 0],
        ['Active Sellers', stats?.counts?.sellers || 0],
        ['Total Orders', stats?.counts?.orders || 0],
        ['Total Donors', stats?.counts?.donors || 0],
        ['Total Revenue', `INR ${stats?.counts?.revenue?.toLocaleString() || 0}`],
        ['Total Admin Profit', `INR ${stats?.counts?.profit?.toLocaleString() || 0}`],
    ];

    autoTable(doc, {
        startY: 50,
        head: [metricsData[0]],
        body: metricsData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255] },
        styles: { fontSize: 10, cellPadding: 3 },
    });

    // Section 2: Pending Seller Requests
    const pendingSellers = stats?.recentUsers?.filter((u: any) => u.role === 'seller' && u.status === 'pending') || [];

    doc.setFontSize(16);
    doc.text('Pending Seller Requests', 14, (doc as any).lastAutoTable.finalY + 15);

    if (pendingSellers.length > 0) {
        const sellerData = pendingSellers.map((s: any) => [
            s.name,
            s.email,
            new Date(s.createdAt).toLocaleDateString()
        ]);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Seller Name', 'Email', 'Joined Date']],
            body: sellerData,
            theme: 'grid',
            headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] }, // Amber 500
            styles: { fontSize: 9 },
        });
    } else {
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('No pending seller requests at this time.', 14, (doc as any).lastAutoTable.finalY + 22);
        doc.setTextColor(50);
        // Add a "dummy" lastAutoTable to keep spacing consistent
        (doc as any).lastAutoTable.finalY += 10;
    }

    // Section 3: Recent Customer Signups
    const recentCustomers = stats?.recentUsers?.filter((u: any) => u.role === 'customer') || [];

    doc.setFontSize(16);
    doc.text('Recent Customer Signups', 14, (doc as any).lastAutoTable.finalY + 15);

    if (recentCustomers.length > 0) {
        const customerData = recentCustomers.map((c: any) => [
            c.name,
            c.email,
            new Date(c.createdAt).toLocaleDateString()
        ]);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Customer Name', 'Email', 'Signup Date']],
            body: customerData,
            theme: 'grid',
            headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] }, // Emerald 600
            styles: { fontSize: 9 },
        });
    } else {
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('No recent customer signups found.', 14, (doc as any).lastAutoTable.finalY + 22);
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount} - Apex Care Confidential`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    doc.save(`Apex_Care_System_Report_${fileNameDate}.pdf`);
};
