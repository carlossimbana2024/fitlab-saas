import { useState } from "react";
import { askFitlabAI } from "../api/tenantApi";

const FitlabAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hola 👋 Soy tu asistente FitLab. Puedo ayudarte con entrenamiento, alimentación saludable y uso de la app.",
    },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();

    const cleanText = text.trim();
    if (!cleanText || loading) return;

    const newMessages = [...messages, { role: "user", content: cleanText }];

    setMessages(newMessages);
    setText("");
    setLoading(true);

    try {
      const response = await askFitlabAI({
        message: cleanText,
        history: newMessages,
      });

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.answer,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error.response?.data?.message ||
            "No pude responder en este momento.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fitlab-ai-widget">
      {open && (
        <section className="fitlab-ai-window">
          <header>
            <div>
              <strong>FitLab Assistant</strong>
              <span>Entrenamiento · Alimentación · Ayuda</span>
            </div>
            <button onClick={() => setOpen(false)}>×</button>
          </header>

          <div className="fitlab-ai-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`fitlab-ai-message ${message.role}`}
              >
                {message.content}
              </div>
            ))}

            {loading && (
              <div className="fitlab-ai-message assistant">
                Pensando...
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="fitlab-ai-form">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Pregúntame algo..."
            />
            <button disabled={loading}>Enviar</button>
          </form>
        </section>
      )}

      <button className="fitlab-ai-button" onClick={() => setOpen(!open)}>
        💬
      </button>
    </div>
  );
};

export default FitlabAssistant;