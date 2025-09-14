/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import bcrypt from "bcrypt";
import { log } from '../../../shared/utils/logger';
import { DatabaseError } from '../../../shared/utils/errors';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const startTime = Date.now();
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const duration = Date.now() - startTime;
    
    log.debug('Password hashed successfully', { duration });
    return hash;
  } catch (error) {
    const dbError = new DatabaseError('Failed to hash password');
    log.error('Password hashing failed', dbError);
    throw dbError;
  }
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const startTime = Date.now();
    const isValid = await bcrypt.compare(password, hash);
    const duration = Date.now() - startTime;
    
    log.debug('Password verification completed', { isValid, duration });
    return isValid;
  } catch (error) {
    const dbError = new DatabaseError('Failed to verify password');
    log.error('Password verification failed', dbError);
    throw dbError;
  }
}
