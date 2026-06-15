const StatusMessage = ({ message }) => {
  if (!message?.text) return null;

  return (
    <div
      className={`status-message status-${message.type || "info"}`}
      role="status"
    >
      {message.text}
    </div>
  );
};

export default StatusMessage;
