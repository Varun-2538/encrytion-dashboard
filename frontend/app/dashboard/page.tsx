'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { fetchSecrets, createSecret, updateSecret, deleteSecret } from '@/lib/api';
import { Header } from '@/components/dashboard/Header';
import { SecretsList } from '@/components/dashboard/SecretsList';
import { SecretModal } from '@/components/dashboard/SecretModal';
import { Button } from '@/components/ui/Button';
import type { Secret, SecretModalState } from '@/types';
import { Plus, AlertCircle } from 'lucide-react';

/**
 * Dashboard page - Main secrets management interface
 * Protected route - requires authentication
 */
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<SecretModalState>({
    isOpen: false,
    mode: 'create'
  });

  /**
   * Loads all secrets from the API
   */
  const loadSecrets = React.useCallback(async () => {
    try {
      setError(null);
      const data = await fetchSecrets();
      setSecrets(data);
    } catch (error) {
      console.error('Error loading secrets:', error);
      setError(error instanceof Error ? error.message : 'Failed to load secrets');
    }
  }, []);

  /**
   * Initializes dashboard by checking auth and loading secrets
   */
  const initializeDashboard = React.useCallback(async () => {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/');
        return;
      }

      setUser({ email: session.user.email || '' });

      // Load secrets
      await loadSecrets();
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      setError('Failed to initialize dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [router, loadSecrets]);

  useEffect(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * Opens modal for creating a new secret
   */
  const handleAddSecret = () => {
    setModalState({
      isOpen: true,
      mode: 'create'
    });
  };

  /**
   * Opens modal for editing an existing secret
   */
  const handleEditSecret = (secret: Secret) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      secret
    });
  };

  /**
   * Closes the modal
   */
  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      mode: 'create'
    });
  };

  /**
   * Saves a secret (create or update)
   */
  const handleSaveSecret = async (content: string, secretId?: string) => {
    try {
      if (modalState.mode === 'edit' && secretId) {
        await updateSecret(secretId, { content });
      } else {
        await createSecret({ content });
      }

      // Reload secrets
      await loadSecrets();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to save secret');
    }
  };

  /**
   * Deletes a secret with confirmation
   */
  const handleDeleteSecret = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this secret? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setError(null);
      await deleteSecret(id);
      await loadSecrets();
    } catch (error) {
      console.error('Error deleting secret:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete secret');
    }
  };

  // Loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        userEmail={user.email}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Secrets</h2>
            <p className="mt-1 text-sm text-gray-600">
              All secrets are encrypted and only visible to you
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleAddSecret}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Add Secret
          </Button>
        </div>

        {/* Secrets List */}
        <SecretsList
          secrets={secrets}
          onEdit={handleEditSecret}
          onDelete={handleDeleteSecret}
          isLoading={false}
        />
      </main>

      {/* Add/Edit Modal */}
      <SecretModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        secret={modalState.secret}
        onClose={handleCloseModal}
        onSave={handleSaveSecret}
      />
    </div>
  );
}
