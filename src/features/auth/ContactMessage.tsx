import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaEnvelopeOpenText } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Spinner from "../../components/common/Spinner";

interface Message {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject?: string;
  message: string;
  userId: string;
  createdAt: string;
  replay?: string;
}

export default function ContactMessage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // 🔹 Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);

  // 🔹 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        const id = parsed?.user?.id || parsed?.id;
        if (id) setUserId(String(id));
      }
    } catch (err) {
      console.warn("Failed to parse user", err);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchMessages = async () => {
      try {
        const res = await axios.get<Message[]>(
          "https://68f17bc0b36f9750dee96cbb.mockapi.io/contact"
        );
        const userMessages = res.data.filter((msg) => msg.userId === userId);
        setMessages(userMessages.reverse());
      } catch (err) {
        console.error("Error fetching messages", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [userId]);

  // 🔹 Handle modal open/close
  const handleShowModal = (msg: Message) => {
    setSelectedMsg(msg);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setSelectedMsg(null);
    setShowModal(false);
  };

  // 🔹 Pagination calculations
  const totalPages = Math.ceil(messages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMessages = messages.slice(startIndex, startIndex + itemsPerPage);

  if (!userId) {
    return (
      <div className="container py-5 text-center">
        <h5 className="text-danger">No logged-in user found. Please log in first.</h5>
      </div>
    );
  }

  return (
    <section className="py-3">
      <div className="container">
        <motion.h3
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-5 main-color"
        >
          My Messages
        </motion.h3>

        {loading ? (
          <div className="text-center my-5">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted mt-5">
            You haven’t sent any messages yet.
          </div>
        ) : (
          <>
            <div className="row">
              {currentMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className="col-12 col-md-6 mb-4"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="card shadow-sm border-0 rounded-3 review-card">
                    <div className="card-body">
                      <h5 className="card-title main-color mb-1">
                        {msg.subject || "No Subject"}
                      </h5>
                      <p className="text-black">{msg.message}</p>
                      <p className="text-muted small mb-2">
                        Sent on:{" "}
                        {new Date(msg.createdAt).toLocaleString("en-GB", {
                          timeZone: "Africa/Cairo",
                        })}
                      </p>

                      <div className="d-flex justify-content-between align-items-center mt-3">
                        {msg.replay === "unRead" ? (
                          <span className="badge bg-warning text-dark">Unread</span>
                        ) : (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleShowModal(msg)}
                          >
                            <FaEnvelopeOpenText className="me-2" />
                            View Reply
                          </Button>
                        )}

                        <span className="text-muted small">
                          From: {msg.firstName} {msg.lastName}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

        
            {messages.length > itemsPerPage && (
              <div className="pagination-bar d-flex justify-content-center align-items-center mt-5 gap-2 flex-wrap">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
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
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 🔹 Reply Modal */}
      <Modal show={showModal} onHide={handleCloseModal}  className="my-5">
        <Modal.Header closeButton style={{backgroundColor:"#fad7a5ff"}}>
          <Modal.Title className="main-color fw-semibold">Admin Replay</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{backgroundColor:"#F4EFE8"}}>
          {selectedMsg ? (
            <>
              <p>
                <strong>Your message:</strong> <br />
                {selectedMsg.message}
              </p>
              <hr />
              <p>
                <strong>Admin reply:</strong> <br />
                {selectedMsg.replay}
              </p>
              <small className="text-muted">
                Sent:{" "}
                {new Date(selectedMsg.createdAt).toLocaleString("en-GB", {
                  timeZone: "Africa/Cairo",
                })}
              </small>
            </>
          ) : (
            <p>Loading reply...</p>
          )}
        </Modal.Body>
        <Modal.Footer style={{backgroundColor:"#F4EFE8"}}>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}
