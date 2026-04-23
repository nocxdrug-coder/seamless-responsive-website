import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowLeft, Ticket as TicketIcon, Send, Clock, PlusCircle, CheckCircle, ChevronDown, ChevronUp, Camera, HelpCircle, Activity } from "lucide-react";
import styles from "./support.module.css";

interface Ticket {
  id: string;
  subject: string;
  issue_type: string;
  message: string;
  screenshot_url?: string | null;
  status: "open" | "answered" | "closed";
  admin_reply?: string | null;
  created_at: number;
}

export default function SupportPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form State
  const [issueType, setIssueType] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/login", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { authenticated?: boolean }) => {
        setAuthenticated(Boolean(data.authenticated));
      })
      .catch(console.error)
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!authChecked || !authenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/support", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) {
          setTickets(data.tickets);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authChecked, authenticated]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setFormError("Screenshot must be less than 5MB.");
      setFile(null);
      return;
    }
    setFile(selected);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[support] Submit ticket clicked");
    setFormError("");
    setFormSuccess(false);

    if (!issueType) {
      setFormError("Please select an Issue Type");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("issueType", issueType);
      formData.append("subject", subject);
      formData.append("message", message);
      if (file) formData.append("screenshot", file);

      const res = await fetch("/api/support", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      console.log("[support] API response received");
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to create ticket.");
      
      setTickets([data.ticket, ...tickets]);
      
      // Reset form
      setIssueType("");
      setSubject("");
      setMessage("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFormSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.iconCircle}>
              <HelpCircle size={22} color="#f43f5e" />
            </div>
            <div>
              <h1 className={styles.title}>Support Center</h1>
              <p className={styles.subtitle}>Get Help</p>
            </div>
          </div>
          <Link to={authenticated ? "/dashboard" : "/"} className={styles.backBtn}>
            <ArrowLeft size={18} />
          </Link>
        </div>

        <div className={styles.cardContainer}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <TicketIcon size={20} color="#f43f5e" />
              <h2 className={styles.cardTitle}>New Ticket</h2>
            </div>
            <div className={styles.replyBadge}>
              Avg. reply: ~30min
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {!authChecked ? (
              <div className={styles.errorBanner}>Checking session…</div>
            ) : !authenticated ? (
              <div className={styles.errorBanner}>
                Please <Link to="/login">log in</Link> or <Link to="/register">register</Link> to submit a ticket and
                view your history.
              </div>
            ) : null}
            {formError && <div className={styles.errorBanner}>{formError}</div>}
            {formSuccess && (
              <div className={styles.successBanner}>
                <CheckCircle size={16} /> Ticket accurately submitted for review
              </div>
            )}
            
            <div className={styles.inputGroup}>
              <label>Issue Type <span className={styles.requiredStar}>*</span></label>
              <div className={styles.selectWrapper}>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  required
                  disabled={!authenticated}
                >
                  <option value="" disabled>-- Select Issue Type --</option>
                  <option value="Deposit Issue">Deposit Issue</option>
                  <option value="Card Purchase">Card Purchase Issue</option>
                  <option value="Account Access">Account Access</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Other">Other General Issue</option>
                </select>
                <ChevronDown className={styles.selectIcon} size={16} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Subject <span className={styles.requiredStar}>*</span></label>
              <input
                type="text"
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                maxLength={100}
                disabled={!authenticated}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Message <span className={styles.requiredStar}>*</span></label>
              <textarea
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                disabled={!authenticated}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Screenshot</label>
              <div className={styles.fileUploadWrapper}>
                <button
                  type="button"
                  className={styles.chooseFileBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!authenticated}
                >
                  <Camera size={16} /> Choose file
                </button>
                <span className={styles.fileNameText}>
                  {file ? file.name : "No file chosen"}
                </span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  style={{ display: "none" }}
                />
              </div>
              <span className={styles.uploadHint}>Optional: Attach payment screenshot or error image</span>
            </div>

            <button type="submit" disabled={submitting || !authenticated} className={styles.submitBtn}>
              {submitting ? "Submitting..." : <>🚀 Submit Ticket</>}
            </button>
          </form>

          <div className={styles.quickTipsBox}>
            <h4 className={styles.tipsTitle}>💡 Quick Tips:</h4>
            <ul className={styles.tipsList}>
              <li><strong>Transaction ID:</strong> Found in "Wallet History" page</li>
              <li>Copy the exact ID number from wallet (e.g., 972446)</li>
              <li className={styles.dangerTip}><strong>Do NOT add # symbol</strong></li>
              <li>Always attach payment screenshot</li>
              <li>Response time: 15-30 minutes</li>
            </ul>
          </div>
        </div>

        <div className={styles.ticketsWidgetContainer}>
          <div className={styles.ticketsWidgetHeader}>
            <div className={styles.cardHeaderLeft}>
              <Activity size={20} color="#f43f5e" />
              <h2 className={styles.cardTitle}>My Tickets</h2>
            </div>
            <div className={styles.ticketTotal}>
              Total: {tickets.length}
            </div>
          </div>
          
          <div className={styles.ticketList}>
            {loading ? (
              <div className={styles.skeletonContainer}>
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLine} />
              </div>
            ) : !authenticated ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>Log in to see your tickets.</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>You haven't opened any support tickets yet.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className={styles.ticketItem}>
                  <div 
                    className={styles.ticketSummary} 
                    onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                  >
                    <div className={styles.ticketLeft}>
                      <div className={styles.ticketSubjectContainer}>
                        <div className={styles.ticketSubject}>{ticket.subject}</div>
                        <div className={styles.ticketType}>{ticket.issue_type}</div>
                      </div>
                    </div>
                    <div className={styles.ticketRight}>
                      <span className={`${styles.statusBadge} ${styles[ticket.status]}`}>
                        <span style={{ textTransform: "capitalize" }}>{ticket.status}</span>
                      </span>
                      {expandedId === ticket.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {expandedId === ticket.id && (
                    <div className={styles.ticketDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Ticket ID:</span>
                        <span className={styles.detailValue}>{ticket.id}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Created:</span>
                        <span className={styles.detailValue}>{new Date(ticket.created_at).toLocaleString()}</span>
                      </div>

                      <div className={styles.messageBlock}>
                        <div className={styles.messageText}>{ticket.message}</div>
                        {ticket.screenshot_url && (
                          <div className={styles.screenshotPreview}>
                            <a href={ticket.screenshot_url} target="_blank" rel="noreferrer">
                              <Camera size={14} style={{ marginRight: 4 }} /> 
                              View Attached Screenshot
                            </a>
                          </div>
                        )}
                      </div>

                      {ticket.admin_reply && (
                        <div className={styles.replyBlock}>
                          <div className={styles.replyLabel}>Admin Reply:</div>
                          <div className={styles.replyText}>{ticket.admin_reply}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
