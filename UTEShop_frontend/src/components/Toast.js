import React, { useEffect, useState } from "react";

export default function Toast() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  useEffect(() => {
    function onShow(e) {
      const { message: msg, type: t } = e.detail || {};
      setMessage(msg || "");
      setType(t || "success");
      setOpen(true);
      setTimeout(() => setOpen(false), 1800);
    }
    window.addEventListener("toast:show", onShow);
    return () => window.removeEventListener("toast:show", onShow);
  }, []);

  if (!open) return null;
  return (
    <div className="fixed top-6 right-6 z-50">
      <div className={`shadow-lg rounded-lg px-4 py-3 text-white ${type === "success" ? "bg-green-600" : "bg-gray-800"}`}>
        {message}
      </div>
    </div>
  );
}


