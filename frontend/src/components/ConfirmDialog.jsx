import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </button>
        <button className="btn-danger" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Please wait...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
