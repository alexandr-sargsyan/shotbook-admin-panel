import './ErrorModal.css';

const ErrorModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content error-modal" onClick={(e) => e.stopPropagation()}>
        <div className="error-modal-header">
          <h3>{title || 'Error'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="error-modal-body">
          <p>{message || 'An error occurred'}</p>
        </div>
        <div className="error-modal-actions">
          <button onClick={onClose} className="btn btn-ok">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
