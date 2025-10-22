'use client';

import React from 'react';
import { SecretRow } from './SecretRow';
import type { Secret } from '@/types';
import { Lock } from 'lucide-react';

interface SecretsListProps {
  secrets: Secret[];
  onEdit: (secret: Secret) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const SecretsList: React.FC<SecretsListProps> = ({
  secrets,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading secrets...</p>
        </div>
      </div>
    );
  }

  if (secrets.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Lock size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No secrets yet
          </h3>
          <p className="text-gray-600">
            Create your first secret to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {secrets.map((secret) => (
        <SecretRow
          key={secret.id}
          secret={secret}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
