import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Product } from '../../../components/product/ProductCard';
import { IOrder } from 'src/features/order/OrdersPage';




interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  discount: string | number;
  image: string;
  category: string;
}


const PRODUCTS_URL = 'https://68e43ee28e116898997b5bf8.mockapi.io/product';
const ORDERS_URL = 'https://68e43ee28e116898997b5bf8.mockapi.io/orders';

const axiosInstance = axios.create();


const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axiosInstance.get<Product[]>(PRODUCTS_URL);
  return data;
};

const fetchOrders = async (): Promise<IOrder[]> => {
  const { data } = await axiosInstance.get<IOrder[]>(ORDERS_URL);
  return data;
};

const AdminReports: React.FC = () => {
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [currentOrderPage, setCurrentOrderPage] = useState<number>(1);
  const [currentProductPage, setCurrentProductPage] = useState<number>(1);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const ordersPerPage = 5;
  const productsPerPage = 5;

  useEffect(() => {
    
    const bootstrapLink = document.createElement('link');
    bootstrapLink.rel = 'stylesheet';
    bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
    document.head.appendChild(bootstrapLink);

 
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fontAwesome);

    fetchData();

    return () => {
      document.head.removeChild(bootstrapLink);
      document.head.removeChild(fontAwesome);
    };
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const [ordersData, productsData] = await Promise.all([
        fetchOrders(),
        fetchProducts()
      ]);
      
      setOrders(ordersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!dateFrom && !dateTo) return true;
    
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    
    if (from) from.setHours(0, 0, 0, 0);
    if (to) to.setHours(23, 59, 59, 999);
    
    if (from && to) return orderDate >= from && orderDate <= to;
    if (from) return orderDate >= from;
    if (to) return orderDate <= to;
    return true;
  });

  const calculateMonthlyIncome = () => {
    const monthlyData: { [key: string]: number } = {};
    
    filteredOrders.forEach(order => {
      if (order.status !== 'Cancelled') {
        const date = new Date(order.createdAt);
        const monthYear = `${date.toLocaleString('en', { month: 'short' })} ${date.getFullYear()}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = 0;
        }
        monthlyData[monthYear] += parseFloat(order.totalPrice) || 0;
      }
    });
    
    return Object.entries(monthlyData)
      .map(([month, income]) => ({ month, totalIncome: income }))
      .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
  };

  const calculateProductSales = () => {
    const productData: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    
    filteredOrders.forEach(order => {
      if (order.status !== 'Cancelled' && order.items) {
        order.items.forEach(item => {
          if (!productData[item.title]) {
            productData[item.title] = {
              name: item.title,
              quantity: 0,
              revenue: 0
            };
          }
          const qty = parseInt(String(item.quantity)) || 0;
          const price = parseFloat(String(item.discount)) || 0;
          
          productData[item.title].quantity += qty;
          productData[item.title].revenue += qty * price;
        });
      }
    });
    
    return Object.values(productData).sort((a, b) => b.revenue - a.revenue);
  };

  const calculateCategorySales = () => {
    const categoryData: { [key: string]: { category: string; quantity: number; revenue: number } } = {};
    
    filteredOrders.forEach(order => {
      if (order.status !== 'Cancelled' && order.items) {
        order.items.forEach(item => {
          const category = item.category || 'Unknown';
          if (!categoryData[category]) {
            categoryData[category] = {
              category: category,
              quantity: 0,
              revenue: 0
            };
          }
          const qty = parseInt(String(item.quantity)) || 0;
          const price = parseFloat(String(item.discount)) || 0;
          
          categoryData[category].quantity += qty;
          categoryData[category].revenue += qty * price;
        });
      }
    });
    
    return Object.values(categoryData).sort((a, b) => b.revenue - a.revenue);
  };

  const monthlyIncome = calculateMonthlyIncome();
  const productSales = calculateProductSales();
  const categorySales = calculateCategorySales();

  const totalRevenue = filteredOrders
    .filter(order => order.status !== 'Cancelled')
    .reduce((sum, order) => sum + (parseFloat(order.totalPrice) || 0), 0);

  const indexOfLastOrder = currentOrderPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const indexOfLastProduct = currentProductPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = productSales.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalProductPages = Math.ceil(productSales.length / productsPerPage);

  const getStatusClass = (status: IOrder['status']): string => {
    const classes: { [key: string]: string } = {
      'Delivered': 'success',
      'Pending': 'warning',
      'Cancelled': 'danger',
      'Shipped': 'info',
      'Proccessing': 'primary'
    };
    return classes[status] || 'secondary';
  };

  const handleApplyFilter = (): void => {
    setCurrentOrderPage(1);
    setCurrentProductPage(1);
  };

  const handleReset = (): void => {
    setDateFrom('');
    setDateTo('');
    setCurrentOrderPage(1);
    setCurrentProductPage(1);
  };

  const handleExport = (): void => {
    let csv = 'Admin Reports - Export\n\n';
    
    csv += 'Users Orders\n';
    csv += '#,Name,Date,Address,Total (E£),Status\n';
    filteredOrders.forEach((order, index) => {
      csv += `${index + 1},"${order.userName}","${new Date(order.createdAt).toLocaleDateString('en-GB')}","${order.address}",${parseFloat(order.totalPrice).toFixed(2)},${order.status}\n`;
    });
    
    csv += '\n\nMonthly Income Report\n';
    csv += 'Month/Year,Total Income (E£)\n';
    monthlyIncome.forEach(month => {
      csv += `"${month.month}",${month.totalIncome.toFixed(2)}\n`;
    });
    
    csv += '\n\nProduct Sales Report\n';
    csv += 'Product Name,Total Quantity Sold,Total Revenue (E£)\n';
    productSales.forEach(product => {
      csv += `"${product.name}",${product.quantity},${product.revenue.toFixed(2)}\n`;
    });
    
    csv += '\n\nProducts by Category Report\n';
    csv += 'Product Category,Total Quantity Sold,Total Revenue (E£)\n';
    categorySales.forEach(cat => {
      csv += `"${cat.category}",${cat.quantity},${cat.revenue.toFixed(2)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `admin_reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = (): void => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admin Reports</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 3px solid #0dcaf0; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; border-bottom: 2px solid #ddd; padding-bottom: 5px; }
          .stats { display: flex; gap: 20px; margin: 20px 0; }
          .stat-box { background: #f8f9fa; padding: 15px; border-radius: 5px; flex: 1; }
          .stat-label { font-size: 12px; color: #666; }
          .stat-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #343a40; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:hover { background: #f8f9fa; }
          .badge { padding: 5px 10px; border-radius: 15px; color: white; font-size: 12px; }
          .badge-success { background: #198754; }
          .badge-warning { background: #ffc107; }
          .badge-danger { background: #dc3545; }
          .badge-info { background: #0dcaf0; }
          .badge-primary { background: #0d6efd; }
          .text-success { color: #198754; font-weight: bold; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        <h1>📊 Admin Reports Overview</h1>
        <p>Generated on: ${new Date().toLocaleDateString('en-GB')} at ${new Date().toLocaleTimeString()}</p>
        
        <div class="stats">
          <div class="stat-box">
            <div class="stat-label">Total Orders</div>
            <div class="stat-value" style="color: #0dcaf0;">${filteredOrders.length}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Total Revenue</div>
            <div class="stat-value" style="color: #198754;">E£ ${totalRevenue.toFixed(2)}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Products Sold</div>
            <div class="stat-value" style="color: #0d6efd;">${productSales.reduce((sum, p) => sum + p.quantity, 0)}</div>
          </div>
        </div>

        <h2>Users Orders (${filteredOrders.length})</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Date</th>
              <th>Address</th>
              <th>Total (E£)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredOrders.map((order, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${order.userName}</strong></td>
                <td>${new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
                <td>${order.address}</td>
                <td class="text-success">${parseFloat(order.totalPrice).toFixed(2)}</td>
                <td><span class="badge badge-${getStatusClass(order.status)}">${order.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Monthly Income Report</h2>
        <table>
          <thead>
            <tr>
              <th>Month/Year</th>
              <th>Total Income (E£)</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyIncome.map(month => `
              <tr>
                <td><strong>${month.month}</strong></td>
                <td class="text-success" style="font-size: 18px;">${month.totalIncome.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Product Sales Report</h2>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th class="text-center">Total Quantity Sold</th>
              <th>Total Revenue (E£)</th>
            </tr>
          </thead>
          <tbody>
            ${productSales.map(product => `
              <tr>
                <td><strong>${product.name}</strong></td>
                <td class="text-center"><strong>${product.quantity}</strong></td>
                <td class="text-success">${product.revenue.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Products by Category Report</h2>
        <table>
          <thead>
            <tr>
              <th>Product Category</th>
              <th class="text-center">Total Quantity Sold</th>
              <th>Total Revenue (E£)</th>
            </tr>
          </thead>
          <tbody>
            ${categorySales.map(cat => `
              <tr>
                <td><strong>${cat.category}</strong></td>
                <td class="text-center"><strong>${cat.quantity}</strong></td>
                <td class="text-success">${cat.revenue.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }

  const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    
    return (
      <nav className="mt-4">
        <ul className="pagination justify-content-center">
          {pages.map((page) => (
            <li key={page} className={`bg-gray`}>
              <button
                onClick={() => onPageChange(page)}
                className="page-link"
                style={{cursor: 'pointer'}}
              >
                {page}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
       
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="text-center">
          <div className="spinner-border text-info" role="status" style={{width: '4rem', height: '4rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 h5 text-secondary">Loading reports...</p>
        </div>
      </div>
    );
  }

 

  return (
    <div >
      <div >
        
        <div className="mb-4">
          <h1 className="display-4 fw-bold text-dark mb-2">Overview</h1>
          <p className="text-secondary fs-5">Comprehensive business analytics and reports</p>
          
          <div className="row g-3 mt-3">
            <div className="col-md-4">
              <div className="card shadow-sm" style={{transition: 'transform 0.2s'}} 
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="card-body">
                  <p className="text-secondary small mb-2">Total Orders</p>
                  <h3 className="text-gray fw-bold">{filteredOrders.length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm" style={{transition: 'transform 0.2s'}}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="card-body">
                  <p className="text-secondary small mb-2">Total Revenue</p>
                  <h3 className="text-dark fw-bold">$ {totalRevenue.toFixed(2)}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm" style={{transition: 'transform 0.2s'}}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div className="card-body">
                  <p className="text-secondary small mb-2">Products Sold</p>
                  <h3 className="main-color fw-bold">{productSales.reduce((sum, p) => sum + p.quantity, 0)}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

     
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">
              <i className="fas fa-filter me-2 "></i>
              Filter Reports
            </h5>
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label fw-semibold">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="col-md-6">
                <button onClick={handleApplyFilter} className="btn text-white
                main-color bg-success me-2" >
                  <i className="fas fa-filter me-2"></i>
                  Apply Filter
                </button>
                <button onClick={handleReset} className="btn btn-secondary">
                  Reset
                </button>
              </div>
            </div>
            <div className="mt-3">
              <button onClick={handleExport} className="btn text-white bg-success me-2">
                <i className="fas fa-download me-2"></i>
                Download CSV
              </button>
              <button onClick={handlePrint} className="btn btn-secondary">
                <i className="fas  fa-print me-2"></i>
                Print Report
              </button>
            </div>
          </div>
        </div>

        
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="card-title mb-3">
              <i className="fas fa-users me-2 "></i>
              Users Orders ({filteredOrders.length})
            </h4>
            <div className="table-responsive mt-4 bg-white rounded-4 shadow-sm ">
              <table className="table align-middle table-hover">
                
                  <tr style={{ backgroundColor: "#79253D", color: "white" }}>
                    <th className="p-3">#</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Address</th>
                    <th className="p-3">Total ($)</th>
                    <th className="p-3">Status</th>
                  </tr>
                
                <tbody>
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order, index) => (
                      <tr key={order.id}>
                        <td>{indexOfFirstOrder + index + 1}</td>
                        <td className="fw-semibold">{order.userName}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
                        <td>{order.address}</td>
                        <td className="fw-bold ">{parseFloat(order.totalPrice).toFixed(2)}</td>
                        <td>
                          <span className={`badge bg-${getStatusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center  py-4">
                        No orders found for the selected date range
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination 
              currentPage={currentOrderPage} 
              totalPages={totalOrderPages} 
              onPageChange={setCurrentOrderPage} 
            />
          </div>
        </div>

        
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="card-title mb-3">
              <i className="fas fa-chart-line me-2 "></i>
              Monthly Income Report
            </h4>
            <div className="table-responsive mt-4 bg-white rounded-4 shadow-sm ">
              <table className="table align-middle table-hover" >
                
                  <tr style={{ backgroundColor: "#79253D", color: "white" }}>
                    <th className="p-3">Month/Year</th>
                    <th className="p-3">Total Income</th>
                  </tr>
                
                <tbody>
                  {monthlyIncome.length > 0 ? (
                    monthlyIncome.map((month, index) => (
                      <tr key={index}>
                        <td className="fw-semibold">{month.month}</td>
                        <td className="fw-bold  fs-5">{month.totalIncome.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="text-center  py-4">
                        No income data available for the selected period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="card-title mb-3">
              <i className="fas fa-box me-2 "></i>
              Product Sales Report
            </h4>
            <div className="table-responsive mt-4 bg-white rounded-4 shadow-sm ">
              <table className="table align-middle table-hover">
                
                  <tr style={{ backgroundColor: "#79253D", color: "white" }}>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 text-center" >Total Quantity Sold</th>
                    <th className="p-3">Total Revenue</th>
                  </tr>
              
                <tbody>
                  {currentProducts.length > 0 ? (
                    currentProducts.map((product, index) => (
                      <tr key={index}>
                        <td className="fw-semibold">{product.name}</td>
                        <td className="text-center fw-bold">{product.quantity}</td>
                        <td className="fw-bold ">{product.revenue.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center  py-4">
                        No product sales data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination 
              currentPage={currentProductPage} 
              totalPages={totalProductPages} 
              onPageChange={setCurrentProductPage} 
            />
          </div>
        </div>

        
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h4 className="card-title mb-3">
              <i className="fas fa-tags me-2 "></i>
              Products by Category Report
            </h4>
            <div className="table-responsive mt-4 bg-white rounded-4 shadow-sm ">
              <table className="table align-middle table-hover">
                
                  <tr style={{ backgroundColor: "#79253D", color: "white" }}>
                    <th className="p-3">Product Category</th>
                    <th className="text-center p-3">Total Quantity Sold</th>
                    <th className="p-3">Total Revenue </th>
                  </tr>
                
                <tbody>
                  {categorySales.length > 0 ? (
                    categorySales.map((cat, index) => (
                      <tr key={index}>
                        <td className="fw-semibold">{cat.category}</td>
                        <td className="text-center fw-bold">{cat.quantity}</td>
                        <td className="fw-bold ">{cat.revenue.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center text-secondary py-4">
                        No category sales data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;