import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend, ResponsiveContainer, AreaChart, Area} from "recharts";
import { Row, Col, Card, Form, Button, Alert, Badge, ButtonGroup } from "react-bootstrap";
import "../../styles/dashboard.css";
import { fetchUsers, fetchProducts, fetchOrders } from "./api"; 
import { AdminUser, AdminProduct } from "./types";
import { IOrder } from "../order/OrdersPage";
import Spinner from "../../components/common/Spinner"; 
import { Users, Package, DollarSign, ShoppingCart } from 'lucide-react';
// import HelmetWrapper from "../../components/common/HelmetWrapper";




function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(target)) {
      setValue(0);
      return;
    }
    const start = performance.now();
    let rafId = 0;

    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); 
      setValue(Math.floor(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return value;
}

 
const COLORS = ["var(--rose-primary)", "var(--maroon-secondary)", "var(--rose-light)", "var(--maroon-light)"];


const Dashboard: React.FC = () => {

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [isFiltering, setIsFiltering] = useState<boolean>(false);


  const usersQuery = useQuery<AdminUser[]>({ queryKey: ["users"], queryFn: fetchUsers, staleTime: 1000 * 60 * 2 });
  const productsQuery = useQuery<AdminProduct[]>({ queryKey: ["products"], queryFn: fetchProducts, staleTime: 1000 * 60 * 2 });
  const ordersQuery = useQuery<IOrder[]>({ queryKey: ["orders"], queryFn: fetchOrders, staleTime: 1000 * 60 * 1 });

  const isLoading = usersQuery.isLoading || productsQuery.isLoading || ordersQuery.isLoading;
  const hasError = usersQuery.isError || productsQuery.isError || ordersQuery.isError;

  
  const users = usersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];


  const hasActiveFilters = useMemo(() => {
    return categoryFilter !== "all" || 
           statusFilter !== "all" || 
           dateFrom !== "" || 
           dateTo !== "";
  }, [categoryFilter, statusFilter, dateFrom, dateTo]);


  const filteredOrders = useMemo(() => {
    return orders.filter((o: IOrder) => {

      const created = o.createdAt ? new Date(o.createdAt) : new Date();
      
  
      if (statusFilter !== "all" && o.status.toLowerCase() !== statusFilter.toLowerCase()) return false;

      

      if (dateFrom) {
        const from = new Date(dateFrom + "T00:00:00");
        if (created < from) return false;
      }
      
    
      if (dateTo) {
        const to = new Date(dateTo + "T23:59:59");
        if (created > to) return false;
      }
      
  
      if (categoryFilter && categoryFilter.toLowerCase() !== "all") {
  const hasCategory = (o.items ?? []).some((it) => {
    const cat = (it.category ?? "").toLowerCase().trim();
    const selected = categoryFilter.toLowerCase().trim();

    return (
      cat.includes(selected) || 
      selected.includes(cat) || 
      cat.startsWith(selected) || 
      selected.startsWith(cat)
    );
  });
  if (!hasCategory) return false;
}



      
      return true;
    });
  }, [orders, products, statusFilter, dateFrom, dateTo, categoryFilter]);


  useEffect(() => {
    if (hasActiveFilters) {
      setIsFiltering(true);
      const timer = setTimeout(() => {
        setIsFiltering(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsFiltering(false);
    }
  }, [filteredOrders, hasActiveFilters]);

 
  const totalUsers = users.length;
  const totalProducts = products.length;
  const totalOrders = filteredOrders.length;


const totalRevenue = useMemo(() => {
  let total = 0;

  filteredOrders.forEach((o: IOrder) => {
    (o.items ?? []).forEach((it) => {
      const product = products.find(
        (p) =>
          p.title.toLowerCase().trim() ===
          (it.title ?? "").toLowerCase().trim()
      );

  
      if (
        categoryFilter !== "all" &&
        product &&
        product.category?.toLowerCase().trim() !==
          categoryFilter.toLowerCase().trim()
      ) {
        return;
      }


      const totalPrice = Number(it.discount ?? 0) * Number(it.quantity ?? 1);
      total += totalPrice;
    });
  });

  return total;
}, [filteredOrders, products, categoryFilter]);





  const usersCount = useCountUp(totalUsers, 900);
  const productsCount = useCountUp(totalProducts, 900);
  const ordersCount = useCountUp(totalOrders, 900);
  const revenueCount = useCountUp(Math.round(totalRevenue), 900);


  const ordersByDay = useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders.forEach((o: IOrder) => {
      const d = new Date(o.createdAt ?? "").toLocaleDateString();
      map.set(d, (map.get(d) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredOrders]);



const revenueByProduct = useMemo(() => {
  const map = new Map<string, number>();

  filteredOrders.forEach((o: IOrder) => {
    (o.items ?? []).forEach((it) => {
      const key = it.title ?? "Unknown";

      const product = products.find(
        (p) =>
          p.title.toLowerCase().trim() ===
          (it.title ?? "").toLowerCase().trim()
      );

  
      if (
        categoryFilter !== "all" &&
        product &&
        product.category?.toLowerCase().trim() !==
          categoryFilter.toLowerCase().trim()
      ) {
        return;
      }

      const basePrice = product ? Number(product.price) : 0;

      const priceAfterDiscount = it.discount
      
      const itemRevenue = priceAfterDiscount * Number(it.quantity ?? 1);

      map.set(key, (map.get(key) || 0) + itemRevenue);
    });
  });

  return Array.from(map.entries())
    .map(([productName, revenue]) => ({ productName, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}, [filteredOrders, products, categoryFilter]);



  const statusDistribution = useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders.forEach((o: IOrder) => {
      map.set(o.status, (map.get(o.status) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);



const COLORS = [
  "#5c1a1f", 
  "#722f37", 
  "#8b3a3a", 
  "#a03a3a", 
  "#9f4f4f", 

  "#b66a6a", 
  "#d9b5b5", 
  "#c48b8b", 
  "#e6caca", 
    
];


  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  
  const productTypes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);


  const clearAllFilters = useCallback(() => {
    setCategoryFilter("all");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  }, []);

  
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (categoryFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (dateFrom !== "") count++;
    if (dateTo !== "") count++;
    return count;
  }, [categoryFilter, statusFilter, dateFrom, dateTo]);


  if (hasError) {
    return (
      <div className="container py-4">
        <Alert variant="danger">Failed to load data — please try again. </Alert>
        <div className="mt-2">
          <Button onClick={() => { usersQuery.refetch(); productsQuery.refetch(); ordersQuery.refetch(); }}> Please try again! </Button>
        </div>
      </div>
    );
  }

  if (isLoading) return <Spinner />;

  return (
    <>
    {/* <HelmetWrapper title="Dashboard" /> */}
      <div className="py-4 dashboard-container">
        {/* Header */}
        <Row className="align-items-center mb-3">
          <Col xs={12} md={6}>
            <h3 className="mb-0 fw-bold">Admin Dashboard</h3>
            <small className="text-muted">Performance & Sales at a Glance</small>
          </Col>
          <Col xs={12} md={6} className="text-md-end mt-3 mt-md-0">
            <Button size="sm" variant="outline-light" onClick={() => { usersQuery.refetch(); productsQuery.refetch(); ordersQuery.refetch(); }}>
              Refresh
            </Button>
          </Col>
        </Row>
      
        {/* Summary Cards */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={3}>
            <Card className="dashboard-card text-center shadow-sm border-0">
              <Card.Body>
                <div className="small text-muted">
                <Users size={20} color="var(--rose-primary)" className="me-2" />
      
                  Users</div>
                <h4 className="mb-0 count-up">{usersCount}</h4>
                <small className="text-muted d-block">active users</small>
              </Card.Body>
            </Card>
          </Col>
      
          <Col xs={6} md={3}>
            <Card className="dashboard-card text-center shadow-sm border-0">
              <Card.Body>
                <div className="small text-muted">
                  <Package size={20} color="var(--rose-primary)" className="me-2" />
      
                  Products</div>
                <h4 className="mb-0 count-up">{productsCount}</h4>
                <small className="text-muted d-block">catalog size</small>
              </Card.Body>
            </Card>
          </Col>
      
          <Col xs={6} md={3}>
            <Card className="dashboard-card text-center shadow-sm border-0">
              <Card.Body>
                <div className="small text-muted">
                  < ShoppingCart size={20} color="var(--rose-primary)" className="me-2" />
      
                  Orders</div>
                <h4 className="mb-0 count-up">{ordersCount}</h4>
                <small className="text-muted d-block">in selected filters</small>
              </Card.Body>
            </Card>
          </Col>
      
          <Col xs={6} md={3}>
            <Card className="dashboard-card text-center shadow-sm border-0">
              <Card.Body>
                <div className="small text-muted">
                  < DollarSign  size={20} color="var(--rose-primary)" className="me-2" />
      
                  Revenue</div>
                <h4 className="mb-0 count-up">{revenueCount.toLocaleString()}</h4>
                <small className="text-muted d-block">filtered revenue (USD)</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      
        {/* Enhanced Filters */}
        <Card className="mb-4 p-3 filter-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 ">
              <i className="fas fa-filter me-2"></i>
              Filters
              {hasActiveFilters && (
                <Badge  className="ms-2 bg-secondary">
                  {activeFiltersCount}
                </Badge>
              )}
            </h6>
            {hasActiveFilters && (
              <Button 
                size="sm" 
                variant="outline-secondary" 
                onClick={clearAllFilters}
                className="d-flex align-items-center"
              >
                <i className="fas fa-times me-1"></i>
                Clear All
              </Button>
            )}
          </div>
      
          <Row className="gy-2 gx-3 align-items-end">
            <Col xs={12} sm={6} md={3}>
              <Form.Group>
                <Form.Label className="form-label">
                  <i className="fas fa-tags me-1"></i>
                  Category
                </Form.Label>
                <Form.Select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={categoryFilter !== "all" ? "border-primary" : ""}
                >
                  <option value="all">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
      
            <Col xs={12} sm={6} md={3}>
              <Form.Group>
                <Form.Label className="form-label">
                  <i className="fas fa-clipboard-list me-1"></i>
                  Status
                </Form.Label>
                <Form.Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={statusFilter !== "all" ? "border-primary" : ""}
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="proccessing">Proccessing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
      
            <Col xs={12} sm={6} md={3}>
              <Form.Group>
                <Form.Label className="form-label">
                  <i className="fas fa-calendar me-1"></i>
                  Date Range
                </Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="date" 
                    value={dateFrom} 
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="From"
                    className={dateFrom !== "" ? "border-primary" : ""}
                  />
                  <Form.Control 
                    type="date" 
                    value={dateTo} 
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="To"
                    className={dateTo !== "" ? "border-primary" : ""}
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
      
          {/* Quick Date Presets */}
          <Row className="mt-5">
            <Col xs={12}>
              <div className="d-flex flex-wrap gap-2">
                <small className="text-muted me-2">Quick presets:</small>
                <ButtonGroup size="sm">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => {
                      const today = new Date();
                      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                      setDateFrom(weekAgo.toISOString().split('T')[0]);
                      setDateTo(today.toISOString().split('T')[0]);
                    }}
                  >
                    Last 7 days
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => {
                      const today = new Date();
                      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                      setDateFrom(monthAgo.toISOString().split('T')[0]);
                      setDateTo(today.toISOString().split('T')[0]);
                    }}
                  >
                    Last 30 days
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => {
                      const today = new Date();
                      const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
                      setDateFrom(yearAgo.toISOString().split('T')[0]);
                      setDateTo(today.toISOString().split('T')[0]);
                    }}
                  >
                    Last year
                  </Button>
                </ButtonGroup>
              </div>
            </Col>
          </Row>
        </Card>
      
        {/* Enhanced Charts */}
        <Row className="g-4">
          <Col lg={6}>
            <Card className="chart-card shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="chart-title mb-0">
                  <i className="fas fa-chart-line me-2"></i>
                  Orders Trend
                </h6>
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">{ordersByDay.length} data points</small>
                  {isFiltering && <Spinner />}
                </div>
              </div>
              {ordersByDay.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="fas fa-chart-line fa-3x mb-3 opacity-50"></i>
                  <p className="mb-0">No orders found for selected filters</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={ordersByDay}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--rose-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--rose-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ReTooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="var(--rose-primary)" 
                      strokeWidth={2}
                      fill="url(#colorOrders)"
                      dot={{ r: 4, fill: 'var(--rose-primary)' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Col>
      
          <Col lg={6}>
            <Card className="chart-card shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="chart-title mb-0">
                  <i className="fas fa-chart-bar me-2"></i>
                  Revenue by Product
                </h6>
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">Top {Math.min(5, revenueByProduct.length)} products</small>
                  {isFiltering && <Spinner />}
                </div>
              </div>
              {revenueByProduct.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="fas fa-chart-bar fa-3x mb-3 opacity-50"></i>
                  <p className="mb-0">No revenue data for selected filters</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByProduct.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="productName" 
                      interval={0} 
                      angle={-30} 
                      textAnchor="end" 
                      height={60}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ReTooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                      {revenueByProduct.slice(0, 8).map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Col>
      
          <Col lg={6}>
            <Card className="chart-card shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="chart-title mb-0">
                  <i className="fas fa-chart-pie me-2"></i>
                  Order Status Distribution
                </h6>
                {isFiltering && <Spinner />}
              </div>
              {statusDistribution.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="fas fa-chart-pie fa-3x mb-3 opacity-50"></i>
                  <p className="mb-0">No status data for selected filters</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie 
                      data={statusDistribution} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={90}
                      innerRadius={30}
                      label={true}
                      labelLine={false}
                    >
                      {statusDistribution.map((_, i) => (
                        <Cell key={`cell-status-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: number, name: string) => [`${value} orders`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Col>
      
          <Col lg={6}>
            <Card className="chart-card shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="chart-title mb-0">
                  <i className="fas fa-trophy me-2"></i>
                  Top Sellers
                </h6>
                {isFiltering && <Spinner />}
              </div>
              <div className="p-2">
                {revenueByProduct.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <i className="fas fa-trophy fa-2x mb-3 opacity-50"></i>
                    <p className="mb-0">No sales data for selected filters</p>
                  </div>
                ) : (
                  <ul className="list-unstyled mb-0 top-products">
                    {revenueByProduct.slice(0, 6).map((p, idx) => (
                      <li key={p.productName} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <div className={`badge bg-${idx < 3 ? 'warning' : 'secondary'} rounded-circle d-flex align-items-center justify-content-center`} 
                                 style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                              {idx + 1}
                            </div>
                          </div>
                          <div>
                            <div className="fw-semibold text-truncate" style={{ maxWidth: '150px' }}>
                              {p.productName}
                            </div>
                            <small className="text-muted">
                              ${p.revenue.toLocaleString()} revenue
                            </small>
                          </div>
                        </div>
                        
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Dashboard;
