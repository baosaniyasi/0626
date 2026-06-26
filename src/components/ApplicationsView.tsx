import React, { useState } from "react";
import { Check, X, ShieldAlert, Clock, UserCheck, MessageSquare, Phone, Mail, Sparkles, Award } from "lucide-react";
import { AdoptionRequest } from "../types";

interface ApplicationsViewProps {
  requests: {
    sent: AdoptionRequest[];
    received: AdoptionRequest[];
  };
  onUpdateRequestStatus: (id: string, status: "approved" | "rejected") => Promise<{ success: boolean; error?: string }>;
}

export default function ApplicationsView({ requests, onUpdateRequestStatus }: ApplicationsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"sent" | "received">("sent");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    setActionLoading(id);
    setFeedbackMsg("");
    try {
      const res = await onUpdateRequestStatus(id, status);
      if (res.success) {
        setFeedbackMsg(`Application successfully ${status}!`);
      } else {
        alert(res.error || "Failed to update application status.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadges = {
    pending: {
      bg: "bg-amber-50 text-amber-700 border-amber-100",
      label: "Pending Review (審核中)",
      icon: <Clock size={12} className="text-amber-500" />
    },
    approved: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
      label: "Approved (已核准認養)",
      icon: <UserCheck size={12} className="text-emerald-500" />
    },
    rejected: {
      bg: "bg-rose-50 text-rose-600 border-rose-100",
      label: "Rejected (未通過)",
      icon: <X size={12} className="text-rose-500" />
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xs flex flex-col gap-6 animate-fade-in w-full">
      {/* Header and Sub-Tabs Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-display text-xl font-bold text-slate-800">Application Dashboard</h3>
          <p className="text-xs text-slate-400 mt-1">Manage and track adopt requests and lists.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab("sent")}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSubTab === "sent"
                ? "bg-white text-slate-800 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sent Applications ({requests.sent.length})
          </button>
          <button
            onClick={() => setActiveSubTab("received")}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSubTab === "received"
                ? "bg-white text-slate-800 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Received Requests ({requests.received.length})
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl font-semibold animate-pulse">
          {feedbackMsg}
        </div>
      )}

      {/* Content Rendering based on selected sub tab */}
      {activeSubTab === "sent" ? (
        requests.sent.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
              <Clock size={20} />
            </div>
            <h4 className="font-display font-semibold text-slate-700 text-sm">No Sent Applications (尚無認養申請)</h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              You haven't applied to adopt any pets yet. Browse our lovely pets and send your first request!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.sent.map((req) => (
              <div
                key={req._id}
                className="p-5 border border-slate-100 hover:border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col justify-between gap-4 transition-all"
              >
                <div className="flex gap-4">
                  <img
                    src={req.petImageUrl}
                    alt={req.petName}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-slate-800 text-sm truncate">{req.petName}</h4>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${statusBadges[req.status].bg}`}>
                        {statusBadges[req.status].icon}
                        <span>{statusBadges[req.status].label}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase text-[9px] mb-1">
                    <MessageSquare size={10} />
                    <span>Your Message (申請留言)</span>
                  </div>
                  {req.message}
                </div>

                <div className="text-[10px] text-slate-400 text-right">
                  Applied on: {new Date(req.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        requests.received.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
              <ShieldAlert size={20} />
            </div>
            <h4 className="font-display font-semibold text-slate-700 text-sm">No Received Requests (尚無收到申請)</h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              No adoption requests have been submitted for your listed pets yet. We'll notify you here as soon as someone applies!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.received.map((req) => (
              <div
                key={req._id}
                className="p-5 md:p-6 border border-slate-150 rounded-2xl bg-white shadow-xs flex flex-col gap-4 hover:shadow-xs transition-shadow"
              >
                {/* Header section with Pet name, Requester info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.petImageUrl}
                      alt={req.petName}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs text-slate-400">Request for</p>
                      <h4 className="font-display font-bold text-slate-800 text-sm">{req.petName}</h4>
                    </div>
                  </div>

                  <span className={`self-start sm:self-auto text-[10px] font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${statusBadges[req.status].bg}`}>
                    {statusBadges[req.status].icon}
                    <span>{statusBadges[req.status].label}</span>
                  </span>
                </div>

                {/* Requester Profile Contact Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center font-bold text-[10px]">A</span>
                    <span>Applicant (申請人): <strong className="text-slate-800">{req.requesterName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-slate-400" />
                    <span>Phone (電話): <strong className="text-slate-800">{req.requesterPhone}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <Mail size={12} className="text-slate-400" />
                    <span>Email (電子信箱): <strong className="text-slate-800">{req.requesterEmail}</strong></span>
                  </div>
                </div>

                {/* Personal Message Statement */}
                <div className="text-xs text-slate-600 leading-relaxed bg-slate-500/5 p-4 rounded-xl border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <MessageSquare size={11} />
                    <span>Personal Statement (認養評估說明)</span>
                  </span>
                  <p className="whitespace-pre-line">{req.message}</p>
                </div>

                {/* Actions Approve / Reject */}
                {req.status === "pending" && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                    <button
                      onClick={() => handleAction(req._id, "rejected")}
                      disabled={actionLoading === req._id}
                      className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reject (拒絕)
                    </button>
                    <button
                      onClick={() => handleAction(req._id, "approved")}
                      disabled={actionLoading === req._id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-100"
                    >
                      <Check size={14} />
                      <span>Approve adoption (核准認養)</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
