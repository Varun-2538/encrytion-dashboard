'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/TextArea';
import type { Secret } from '@/types';
import { Shield } from 'lucide-react';

/**
 * SecretModal component props
 */
interface SecretModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  secret?: Secret;
  onClose: () => void;
  onSave: (content: string, secretId?: string) => Promise<void>;
}

/**
 * Modal component for creating and editing secrets
 */
export const SecretModal: React.FC<SecretModalProps> = ({
  isOpen,
  mode,
  secret,
  onClose,
  onSave
}) => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && secret) {
        setContent(secret.content);
      } else {
        setContent('');
      }
      setError(null);
    }
  }, [isOpen, mode, secret]);

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!content.trim()) {
      setError('Secret content cannot be empty');
      return;
    }

    if (content.length > 10000) {
      setError('Secret content is too long (max 10,000 characters)');
      return;
    }

    setIsSaving(true);

    try {
      await onSave(content, secret?.id);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save secret');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handles modal close
   */
  const handleClose = () => {
    if (!isSaving) {
      setContent('');
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Add New Secret' : 'Edit Secret'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <Shield size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            Secrets are encrypted using AES-256-GCM before being stored in the database.
            Only you can decrypt and view your secrets.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Content Input */}
        <TextArea
          label="Secret Content"
          placeholder="Enter your secret (password, API key, note, etc.)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          disabled={isSaving}
          helperText={`${content.length} / 10,000 characters`}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
          >
            {mode === 'create' ? 'Create Secret' : 'Update Secret'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
