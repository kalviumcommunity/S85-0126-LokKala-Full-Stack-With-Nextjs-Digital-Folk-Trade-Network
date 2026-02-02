"use client";
import { useEffect, useRef } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      aria-modal="true"
      className="rounded p-6 backdrop:bg-black/40"
      onCancel={onClose}
    >
      <h2 id="modal-title" className="text-lg font-semibold mb-2">
        Delete Item?
      </h2>
      <p className="mb-4">This action cannot be undone.</p>

      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Confirm
        </button>
        <button
          onClick={onClose}
          className="bg-gray-200 px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </dialog>
  );
}
