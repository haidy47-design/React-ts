import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaReply } from "react-icons/fa";
import { Button, Form } from "react-bootstrap";
import "../../../styles/auth.css";
import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../components/common/CustomSwal";
import { fetchContacts, sendReply } from "../api";

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  replay: string;
}

const AdminContacts: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [replyText, setReplyText] = useState("");
  const itemsPerPage = 5;

  // 🟢 استخدام React Query
  const {
    data: contacts = [],
    isLoading,
    isError,
  } = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: fetchContacts,
  });

  // 🟣 Mutation باستخدام sendReply
  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      await sendReply(id, reply);
    },
    onSuccess: () => {
      showSuccessAlert("Reply sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["contacts"] }); // يحدث الجدول تلقائيًا
      setSelectedContact(null);
      setReplyText("");
    },
    onError: () => {
      showErrorAlert("Failed to send reply");
    },
  });

  if (isLoading) return <div className="loading">Loading...</div>;
  if (isError) return <div className="loading">Failed to load contacts.</div>;

  // 🧮 فلترة و بحث
  const filteredContacts = contacts.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.id.toLowerCase().includes(term) ||
      c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === "All"
        ? true
        : statusFilter === "Unread"
        ? c.replay === "unRead"
        : c.replay !== "unRead";
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContacts = filteredContacts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  const handleSendReply = () => {
    if (!selectedContact) return;
    if (!replyText.trim()) {
      showErrorAlert("Please write your reply first!");
      return;
    }
    replyMutation.mutate({ id: selectedContact.id, reply: replyText.trim() });
  };

  return (
    <div>
      {/* Filters */}
      <div className="p-4 bg-white rounded-4 shadow-sm mb-4">
        <div className="d-md-flex justify-content-between align-items-center flex-wrap mb-3">
          <h4 className="fw-bold" style={{ color: "#79253D" }}>
            Contact Management
          </h4>
          <div className="text-muted">
            Total Messages: <b>{filteredContacts.length}</b>
          </div>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-3">
          <input
            type="text"
            placeholder="Search by name or ID"
            style={{ width: "250px", height: "2.3rem" }}
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Form.Select
            style={{
              width: "200px",
              backgroundColor: "#FDFBF8",
              border: "1px solid #79253D",
              color: "#79253D",
            }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Messages</option>
            <option value="Unread">Unread Only</option>
            <option value="Replied">Replied Only</option>
          </Form.Select>

          <Button
            variant="outline-secondary"
            className="ms-auto col-12 col-md-2 col-lg-1 px-0"
            onClick={handleReset}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive mt-4 bg-white rounded-4 shadow-sm d-none d-lg-block">
        <table className="table align-middle table-hover">
         
            <tr style={{ backgroundColor: "#79253D", color: "white" }}>
              <th className="p-3">ID</th>
              <th className="p-3">Full Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Message</th>
              <th className="p-3">Created At</th>
              <th className="p-3">Reply</th>
            </tr>
       
          
            {currentContacts.map((contact) => (
              <tr key={contact.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td className="ps-3">{contact.id}</td>
                <td>{`${contact.firstName} ${contact.lastName}`}</td>
                <td>{contact.email}</td>
                <td className="ps-3">{contact.subject}</td>
                <td>{contact.message}</td>
                <td>{new Date(contact.createdAt).toLocaleString()}</td>
                <td className="reply-cell">
                  {contact.replay === "unRead" ? (
                    <FaReply
                      size={35}
                      color="#79253D"
                      className="btn btn-emojiShow btn-sm"
                      title="Reply"
                      onClick={() => setSelectedContact(contact)}
                    />
                  ) : (
                    <div>
                      <span className="sent-label">
                        <i
                          className="fa-solid fa-check"
                          style={{ backgroundColor: "white", color: "#79253D" }}
                        ></i>
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
         
        </table>
      </div>

      {/* Pagination */}
      {filteredContacts.length > itemsPerPage && (
        <div className="pagination-bar d-flex justify-content-center align-items-center mt-4 gap-2 flex-wrap">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            ‹ Prev
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                className={`btn btn-sm ${
                  currentPage === pageNum
                    ? "btn-success"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            Next ›
          </button>
        </div>
      )}

      {/* Reply Modal */}
      {selectedContact && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Reply to {selectedContact.firstName}</h2>
            <p>
              <b>Subject:</b> {selectedContact.subject}
            </p>
            <p className="message-box">{selectedContact.message}</p>
            <textarea
              placeholder="Type your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setSelectedContact(null)}
              >
                Cancel
              </button>
              <button
                className="send-btn"
                onClick={handleSendReply}
                disabled={replyMutation.isPending}
              >
                {replyMutation.isPending ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
