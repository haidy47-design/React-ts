"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Spinner } from "react-bootstrap";








export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, usersRes] = await Promise.all([
          fetch("https://68e43ee28e116898997b5bf8.mockapi.io/orders"),
          fetch("https://68e83849f2707e6128ca32fb.mockapi.io/users"),
        ]);

        const ordersData = await ordersRes.json();
        const usersData = await usersRes.json();

        setOrders(ordersData);
        setUsers(usersData);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  
const totalSales = useMemo(() => {
  const completedOrders = orders.filter(
    (o: any) =>
      o.status === "Delivered" 
  );

  const total = completedOrders.reduce(
    (sum: number, o: any) => sum + (parseFloat(o.totalPrice) || 0),
    0
  );

  return Math.floor(total); 
}, [orders]);




  const totalOrders = orders.length;

const completedOrders = orders.filter(
  (o: any) => o.status === "Delivered"
).length;

const cancelledOrders = orders.filter(
  (o: any) => o.status?.toLowerCase() === "cancelled"
).length;

const averageOrderValue = useMemo(() => {
  if (!totalOrders) return 0;

  const avg = Number(totalSales) / totalOrders;


  return Math.floor(avg);
}, [totalSales, totalOrders]);


 const avgItemsPerOrder = useMemo(() => {
  if (!totalOrders) return 0;

  const totalItems = orders.reduce(
    (sum: number, o: any) => sum + (Array.isArray(o.items) ? o.items.length : 0),
    0
  );

  return Math.floor(totalItems / totalOrders);
}, [orders, totalOrders]);




 const topUser = useMemo(() => {
  const userCount: Record<string, number> = {};

  (orders as any[]).forEach((o) => {
    userCount[o.userName] = (userCount[o.userName] || 0) + 1;
  });

  const sorted = Object.entries(userCount).sort((a, b) => b[1] - a[1]);
  return sorted[0] ? { name: sorted[0][0], orders: sorted[0][1] } : null;
}, [orders]);


  
 const topProduct = useMemo(() => {
  if (!orders || orders.length === 0) return null;

 
  const productCount: Record<string, number> = {};

  orders.forEach((order: any) => {
    if (!Array.isArray(order.items)) return;

    order.items.forEach((item: any) => {
      if (!item?.title) return;

      productCount[item.title] =
        (productCount[item.title] || 0) + (item.quantity || 1);
    });
  });

  const sorted = Object.entries(productCount).sort(
    (a, b) => b[1] - a[1]
  );

  return sorted.length > 0
    ? { name: sorted[0][0], sold: sorted[0][1] }
    : null;
}, [orders]);




  
  const newUsersThisWeek = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return users.filter((u:any) => new Date(u.createdAt) > weekAgo).length;
  }, [users]);

  const handlePrint = () => window.print();
 const handleDownload = () => {
  const element = document.body; 
  const opt:{} = {
    margin: 0.5,
    filename: "report.pdf",
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  // import("html2pdf.js").then((html2pdf) =>
  //   html2pdf.default().from(element).set(opt).save()
  // );
};



  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="danger" />
      </div>
    );

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5 text-danger fw-bold">
        📊 Advanced Admin Reports
      </h1>

      <div className="row text-center mb-5">
        {[
          { title: "Total Orders", value: totalOrders },
          { title: "Completed Orders", value: completedOrders },
          { title: "Cancelled Orders", value: cancelledOrders },
          { title: "Total Revenue", value: `$${totalSales}` },
          { title: "Avg Order Value", value: `$${averageOrderValue}` },
          { title: "Avg Items/Order", value: avgItemsPerOrder },
          {
            title: "Top User",
            value: topUser ? `${topUser.name} (${topUser.orders})` : "—",
          },
          {
            title: "Top Product",
            value: topProduct ? `${topProduct.name} (${topProduct.sold})` : "—",
          },
          { title: "New Users (7d)", value: newUsersThisWeek },
        ].map((stat, i) => (
          <div key={i} className="col-md-4 mb-4">
            <div className="p-4 bg-light rounded shadow-sm h-100">
              <h4 className="text-danger">{stat.value}</h4>
              <p className="text-muted mb-0">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

  
      <div className="table-responsive shadow-sm">
        <Table hover bordered className="align-middle">
          
            <tr style={{ backgroundColor: "#79253D", color: "white" }}>
              <th className="p-3">ID</th>
              <th className="p-3">User</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Items</th>
              <th className="p-3">Date</th>
            </tr>
         
          <tbody>
            {orders.map((o : any) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.userName}</td>
                <td
                  style={{
                    color:
                      o.status?.toLowerCase() === "completed"
                        ? "green"
                        : o.status?.toLowerCase() === "cancelled"
                        ? "red"
                        : "gray",
                  }}
                >
                  {o.status || "Pending"}
                </td>
                <td>${parseInt(o.totalPrice)}</td>
                <td>{o.items?.length}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

    
      <div className="text-center mt-4">
        <Button
          variant="danger"
          size="lg"
          className="px-5 rounded-pill shadow"
          onClick={handlePrint}
        >
          🖨️ Print Report
        </Button>
        <Button
          variant="danger"
          size="lg"
          className="px-5 rounded-pill shadow ml-3"
          onClick={handleDownload}
        >
          Download
        </Button>
      </div>
    </div>
  );
}
