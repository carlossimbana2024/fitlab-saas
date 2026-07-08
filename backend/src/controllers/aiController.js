let hfClient = null;

const getHfClient = async () => {
  if (!hfClient) {
    const { InferenceClient } = await import("@huggingface/inference");
    hfClient = new InferenceClient(process.env.HF_TOKEN);
  }

  return hfClient;
};

const chatWithFitlabAI = async (req, res, next) => {
  try {
    if (!process.env.HF_TOKEN) {
      return res.status(500).json({
        message: "Falta configurar HF_TOKEN en el backend",
      });
    }

    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        message: "Debes enviar un mensaje válido",
      });
    }

    const user = req.user;

    const systemPrompt = `
Eres FitLab Assistant, un asistente integrado en una app de gimnasio.

Tu función es ayudar al cliente con:
1. Consejos generales de entrenamiento.
2. Ideas generales de alimentación saludable.
3. Explicación de cómo usar la app FitLab.
4. Motivación y organización de hábitos.

Reglas importantes:
- No des diagnósticos médicos.
- No recomiendes dietas extremas, ayunos agresivos ni suplementos peligrosos.
- Si el usuario menciona dolor, enfermedad, lesión o condición médica, recomienda consultar con un profesional.
- Da respuestas prácticas, claras y breves.
- Personaliza según los datos disponibles del cliente.

Datos del cliente:
Nombre: ${user?.name || "Cliente"}
Rol: ${user?.role || "client"}
Gimnasio: ${req.gym?.name || "FitLab"}
Objetivo registrado: ${user?.goal || "No registrado"}
`;

    const safeHistory = history
      .filter((item) => item && typeof item.content === "string")
      .slice(-8)
      .map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: item.content.slice(0, 1200),
      }));

    const hf = await getHfClient();

    const response = await hf.chatCompletion({
      provider: process.env.HF_PROVIDER || "auto",
      model: process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...safeHistory,
        {
          role: "user",
          content: message.slice(0, 1500),
        },
      ],
      max_tokens: 350,
      temperature: 0.7,
    });

    const answer =
      response.choices?.[0]?.message?.content ||
      "No pude generar una respuesta en este momento.";

    return res.json({
      answer,
      model: process.env.HF_MODEL,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  chatWithFitlabAI,
};