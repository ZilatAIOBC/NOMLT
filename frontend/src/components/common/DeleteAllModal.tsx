import React from 'react';
import ConfirmationModal from './ConfirmationModal';

type DeleteAllModalProps = {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

const DeleteAllModal: React.FC<DeleteAllModalProps> = ({
  isOpen,
  isLoading = false,
  onConfirm,
  onClose,
  title = 'Delete ALL generations?',
  message = 'Are you sure you want to permanently delete all generations from the server? This cannot be undone.',
  confirmText = 'Delete All',
  cancelText = 'Cancel',
}) => {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
      isLoading={isLoading}
      type="danger"
    />
  );
};

export default DeleteAllModal;


