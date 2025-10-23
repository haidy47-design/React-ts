import React, { useEffect, useState } from "react";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

const AdminContacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("https://68f17bc0b36f9750dee96cbb.mockapi.io/contact");
        const data = await res.json();
        setContacts(data);
        setFilteredContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  // Filter by ID or Name
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = contacts.filter(
      (c) =>
        c.id.toLowerCase().includes(term) ||
        c.firstName.toLowerCase().includes(term) ||
        c.lastName.toLowerCase().includes(term)
    );
    setFilteredContacts(filtered);
    setCurrentPage(1);
  }, [searchTerm, contacts]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  if (loading) return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "Poppins, sans-serif", backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>📬 Contact Messages</h1>

      
      
     
      <div style={{ overflowX: "auto" }}>
        <div style={{  padding: "20px" ,marginLeft:"180px"}}>
        <input
          type="text"
          placeholder="Search by ID or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px 15px",
            width: "20%",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
      </div>

        <table className="m-auto" style={{
          width: "80%",
          borderCollapse: "collapse",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
          marginTop: "10px"
        }}>
          
            <tr style={{ backgroundColor: "#79253D", color: "white" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>First Name</th>
              <th style={thStyle}>Last Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Subject</th>
              <th style={thStyle}>Message</th>
              <th style={thStyle}>Created At</th>
            </tr>
          
          <tbody>
            {currentContacts.map((contact) => (
              <tr key={contact.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{contact.id}</td>
                <td style={tdStyle}>{contact.firstName}</td>
                <td style={tdStyle}>{contact.lastName}</td>
                <td style={tdStyle}>{contact.email}</td>
                <td style={tdStyle}>{contact.subject}</td>
                <td style={tdStyle}>{contact.message}</td>
                <td style={tdStyle}>{new Date(contact.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

     
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          style={btnStyle}
        >
          ⬅ Prev
        </button>
        <span style={{ margin: "0 15px" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          style={btnStyle}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 15px",
  fontWeight: "600",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 15px",
  color: "#333",
};

const btnStyle: React.CSSProperties = {
  padding: "8px 15px",
  backgroundColor: "#79253D",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default AdminContacts;
