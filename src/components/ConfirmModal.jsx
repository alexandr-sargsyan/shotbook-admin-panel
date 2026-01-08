import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h3>{title || 'Confirm Action'}</h3>
        </div>
        <div className="confirm-modal-body">
          <p>{message || 'Are you sure you want to proceed?'}</p>
        </div>
        <div className="confirm-modal-actions">
          <button onClick={onClose} className="btn btn-cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-delete">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

