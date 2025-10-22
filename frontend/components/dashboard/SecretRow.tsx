'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Secret } from '@/types';

interface SecretRowProps {
  secret: Secret;
  index: number;
  onEdit: (secret: Secret) => void;
  onDelete: (id: string) => void;
}

export const SecretRow: React.FC<SecretRowProps> = ({
  secret,
  index,
  onEdit,
  onDelete
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  
  const getMaskedContent = (): string => {
    return '•'.repeat(Math.min(secret.content.length, 40));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
              #{index}
            </span>
            <h3 className="text-base font-medium text-gray-900 flex-1">
              {secret.name}
            </h3>
            <button
              onClick={() => setIsRevealed(!isRevealed)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={isRevealed ? 'Hide secret' : 'Show secret'}
            >
              {isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="ml-0">
            {isRevealed ? (
              <p className="text-sm text-gray-900 break-words whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">
                {secret.content}
              </p>
            ) : (
              <p className="text-sm text-gray-500 font-mono tracking-wider">
                {getMaskedContent()}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
            <span>Created: {formatDate(secret.createdAt)}</span>
            {secret.updatedAt !== secret.createdAt && (
              <span>Updated: {formatDate(secret.updatedAt)}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(secret)}
            className="flex items-center gap-1"
          >
            <Edit2 size={14} />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(secret.id)}
            className="flex items-center gap-1"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
