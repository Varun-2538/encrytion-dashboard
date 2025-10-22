import { Response } from 'express';
import supabaseClient from '../services/supabaseClient';
import encryptionService from '../services/encryptionService';
import { logInfo, logError, logDebug, logWarn } from '../utils/logger';
import { AuthenticatedRequest, SecretRecord, SecretResponse } from '../types';

export const getAllSecrets = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;

    logDebug('SecretsController', `Fetching secrets for user: ${userId}`);

    const { data: secrets, error } = await supabaseClient
      .from('secrets')
      .select('id, name, encrypted_content, iv, auth_tag, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .returns<SecretRecord[]>();

    if (error) {
      logError('SecretsController', `Error fetching secrets: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch secrets'
      });
      return;
    }

    const decryptedSecrets: SecretResponse[] = (secrets || []).map(secret => {
      try {
        const decryptedContent = encryptionService.decrypt(
          secret.encrypted_content,
          secret.iv,
          secret.auth_tag
        );

        return {
          id: secret.id,
          name: secret.name || 'Untitled Secret',
          content: decryptedContent,
          createdAt: secret.created_at,
          updatedAt: secret.updated_at
        };
      } catch (decryptError) {
        const errorMessage = decryptError instanceof Error ? decryptError.message : 'Unknown error';
        logError('SecretsController', `Error decrypting secret ${secret.id}: ${errorMessage}`);
        return {
          id: secret.id,
          name: secret.name || 'Untitled Secret',
          content: '[Decryption Error]',
          createdAt: secret.created_at,
          updatedAt: secret.updated_at
        };
      }
    });

    logInfo('SecretsController', `Retrieved ${decryptedSecrets.length} secrets for user ${userId}`);

    res.status(200).json({
      success: true,
      data: decryptedSecrets
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('SecretsController', `Error in getAllSecrets: ${errorMessage}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getSecretById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const secretId = req.params.id;

    logDebug('SecretsController', `Fetching secret ${secretId} for user ${userId}`);

    const { data: secret, error } = await supabaseClient
      .from('secrets')
      .select('id, name, encrypted_content, iv, auth_tag, created_at, updated_at')
      .eq('id', secretId)
      .eq('user_id', userId)
      .single<SecretRecord>();

    if (error || !secret) {
      logWarn('SecretsController', `Secret ${secretId} not found for user ${userId}`);
      res.status(404).json({
        success: false,
        error: 'Secret not found'
      });
      return;
    }

    const decryptedContent = encryptionService.decrypt(
      secret.encrypted_content,
      secret.iv,
      secret.auth_tag
    );

    res.status(200).json({
      success: true,
      data: {
        id: secret.id,
        name: secret.name || 'Untitled Secret',
        content: decryptedContent,
        createdAt: secret.created_at,
        updatedAt: secret.updated_at
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('SecretsController', `Error in getSecretById: ${errorMessage}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const createSecret = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const { name, content } = req.body;

    logDebug('SecretsController', `Creating new secret for user ${userId}`);

    const { encryptedContent, iv, authTag } = encryptionService.encrypt(content);

    const { data: newSecret, error } = await supabaseClient
      .from('secrets')
      .insert([
        {
          user_id: userId,
          name: name || 'Untitled Secret',
          encrypted_content: encryptedContent,
          iv: iv,
          auth_tag: authTag
        }
      ])
      .select('id, name, created_at, updated_at')
      .single();

    if (error) {
      logError('SecretsController', `Error creating secret: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Failed to create secret'
      });
      return;
    }

    logInfo('SecretsController', `Secret created successfully: ${newSecret.id}`);

    res.status(201).json({
      success: true,
      data: {
        id: newSecret.id,
        name: newSecret.name,
        content: content,
        createdAt: newSecret.created_at,
        updatedAt: newSecret.updated_at
      },
      message: 'Secret created successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('SecretsController', `Error in createSecret: ${errorMessage}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateSecret = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const secretId = req.params.id;
    const { name, content } = req.body;

    logDebug('SecretsController', `Updating secret ${secretId} for user ${userId}`);

    const { data: existingSecret, error: fetchError } = await supabaseClient
      .from('secrets')
      .select('id')
      .eq('id', secretId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingSecret) {
      logWarn('SecretsController', `Secret ${secretId} not found for user ${userId}`);
      res.status(404).json({
        success: false,
        error: 'Secret not found'
      });
      return;
    }

    const { encryptedContent, iv, authTag } = encryptionService.encrypt(content);

    const updateData: any = {
      encrypted_content: encryptedContent,
      iv: iv,
      auth_tag: authTag,
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) {
      updateData.name = name || 'Untitled Secret';
    }

    const { data: updatedSecret, error: updateError } = await supabaseClient
      .from('secrets')
      .update(updateData)
      .eq('id', secretId)
      .eq('user_id', userId)
      .select('id, name, created_at, updated_at')
      .single();

    if (updateError) {
      logError('SecretsController', `Error updating secret: ${updateError.message}`);
      res.status(500).json({
        success: false,
        error: 'Failed to update secret'
      });
      return;
    }

    logInfo('SecretsController', `Secret updated successfully: ${secretId}`);

    res.status(200).json({
      success: true,
      data: {
        id: updatedSecret.id,
        name: updatedSecret.name,
        content: content,
        createdAt: updatedSecret.created_at,
        updatedAt: updatedSecret.updated_at
      },
      message: 'Secret updated successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('SecretsController', `Error in updateSecret: ${errorMessage}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const deleteSecret = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user.id;
    const secretId = req.params.id;

    logDebug('SecretsController', `Deleting secret ${secretId} for user ${userId}`);

    const { error } = await supabaseClient
      .from('secrets')
      .delete()
      .eq('id', secretId)
      .eq('user_id', userId);

    if (error) {
      logError('SecretsController', `Error deleting secret: ${error.message}`);
      res.status(500).json({
        success: false,
        error: 'Failed to delete secret'
      });
      return;
    }

    logInfo('SecretsController', `Secret deleted successfully: ${secretId}`);

    res.status(200).json({
      success: true,
      message: 'Secret deleted successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('SecretsController', `Error in deleteSecret: ${errorMessage}`);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
