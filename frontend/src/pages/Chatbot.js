// Chatbot.js
import React, { useState } from "react";

export default function Chatbot({ transactions, budget }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: "Hi! Ask me about your finance or even cheap dinner ideas 😄" }]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
  if (!input.trim()) return;
  const newMessages = [...messages, { role: "user", text: input }];
  setMessages(newMessages);
  setInput("");

  try {
    const res = await fetch("http://localhost:5000/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });
    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      { role: "bot", text: data.result || "No response" },
    ]);
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: "⚠️ AI connection failed." },
    ]);
  }
};

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg"
      >
        💬
      </button>
      {open && (
        <div className="fixed bottom-20 right-6 w-80 h-96 bg-white border border-green-500/50 rounded-md shadow-lg flex flex-col">
          <div className="flex-1 p-2 overflow-y-auto text-sm space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <span className={`inline-block px-2 py-1 rounded ${m.role === "user" ? "bg-green-200" : "bg-green-50"}`}>
                  {m.text}
                </span>
              </div>
            ))}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your question..."
              className="flex-1 px-2 py-1 border rounded"
            />
            <button onClick={sendMessage} className="bg-green-500 text-white px-3 rounded">Send</button>
          </div>
        </div>
      )}
    </>
  );
}