/**
 * Copyright 2025 Kunal Suri — Licensed under the Apache License 2.0 (see LICENSE file)
 */

import { useState, useCallback, useMemo } from 'react';

// Enhanced types for form validation
type UserId = string & { readonly __brand: 'UserId' };
type MessageId = string & { readonly __brand: 'MessageId' };

interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean;
  validate?: (value: T) => boolean;
  message: string;
}

interface FormState<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  submitCount: number;
}

interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  validators: ValidationRule<T>[];
  onChange: (value: T) => void;
  onBlur: () => void;
}

interface UseFormValidationOptions<T extends Record<string, any>> {
  initialValues: T;
  validationRules: Partial<Record<keyof T, ValidationRule[]>>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validationRules,
  onSubmit
}: UseFormValidationOptions<T>) {
  const [formState, setFormState] = useState<FormState<T>>(() => {
    const initialState = {} as FormState<T>;
    
    Object.keys(initialValues).forEach((key) => {
      const fieldKey = key as keyof T;
      (initialState as any)[fieldKey] = {
        value: initialValues[fieldKey],
        error: undefined,
        touched: false,
        validators: validationRules[fieldKey] || []
      };
    });
    
    initialState.isValid = false;
    initialState.isSubmitting = false;
    initialState.submitCount = 0;
    
    return initialState;
  });

  const validateField = useCallback((field: keyof T, value: any) => {
    const validators = validationRules[field];
    if (!validators) return '';

    for (const validator of validators) {
      // Check required
      if (validator.required && (!value || value === '')) {
        return validator.message;
      }

      // Skip other validations if value is empty and not required
      if (!value || value === '') continue;

      // Check custom validation
      if (validator.validate && !validator.validate(value)) {
        return validator.message;
      }

      // Check string validations
      if (typeof value === 'string') {
        if (validator.minLength && value.length < validator.minLength) {
          return validator.message;
        }
        if (validator.maxLength && value.length > validator.maxLength) {
          return validator.message;
        }
        if (validator.pattern && !validator.pattern.test(value)) {
          return validator.message;
        }
      }

      // Check custom function
      if (validator.custom && !validator.custom(value)) {
        return validator.message;
      }
    }

    return '';
  }, [validationRules]);

  const updateField = useCallback((fieldName: keyof T, value: T[keyof T]) => {
    setFormState(prev => {
      const error = validateField(fieldName, value);
      const newField = {
        ...prev[fieldName],
        value,
        error,
        touched: true
      };
      
      const newState = {
        ...prev,
        [fieldName]: newField
      };
      
      // Recalculate form validity
      const isValid = Object.keys(newState).every(key => {
        if (key === 'isValid' || key === 'isSubmitting' || key === 'submitCount') return true;
        const field = newState[key as keyof T] as FormField<T[keyof T]>;
        return !field.error;
      });
      
      newState.isValid = isValid;
      
      return newState;
    });
  }, [validateField]);

  const validateAllFields = useCallback(() => {
    setFormState(prev => {
      const newState = { ...prev };
      let hasErrors = false;
      
      Object.keys(initialValues).forEach(key => {
        const fieldKey = key as keyof T;
        const field = newState[fieldKey] as FormField<T[keyof T]>;
        const error = validateField(fieldKey, field.value);
        
        (newState as any)[fieldKey] = {
          ...field,
          error,
          touched: true
        };
        
        if (error) hasErrors = true;
      });
      
      newState.isValid = !hasErrors;
      return newState;
    });
  }, [initialValues, validateField]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Touch all fields and validate
    const newTouched: Partial<Record<keyof T, boolean>> = {};
    const newErrors: Partial<Record<keyof T, string>> = {};
    
    for (const field in formState.values) {
      newTouched[field] = true;
      const error = validateField(field, (formState.values as any)[field]);
      if (error) newErrors[field] = error;
    }
    
    const isValid = Object.keys(newErrors).length === 0;
    
    setFormState(prev => ({
      ...prev,
      touched: newTouched,
      errors: newErrors,
      isValid,
      isSubmitting: true,
      submitCount: prev.submitCount + 1
    }));
    
    if (isValid) {
      try {
        await onSubmit(formState.values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setFormState(prev => ({ ...prev, isSubmitting: false }));
  }, [formState.values, validateField, onSubmit]);

  const reset = useCallback((newValues?: Partial<T>) => {
    const resetValues = newValues ? { ...initialValues, ...newValues } : initialValues;
    setFormState({
      values: resetValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
      submitCount: 0
    });
  }, [initialValues]);

  const getFieldProps = useCallback((field: keyof T) => {
    const validators = validationRules[field] || [];
    const value = (formState.values as any)[field];
    const error = formState.touched[field] ? formState.errors[field] : undefined;
    const touched = formState.touched[field] || false;

    return {
      value,
      error,
      touched,
      validators,
      onChange: (newValue: any) => updateField(field, newValue),
      onBlur: () => {
        if (!touched) {
          setFormState(prev => {
            const newState = { ...prev };
            (newState as any)[field] = { ...newState[field], touched: true };
            return newState;
          });
        }
      }
    };
  }, [formState, validationRules, updateField]);

  return {
    formState,
    updateField,
    handleSubmit,
    reset,
    getFieldProps,
    isValid: formState.isValid,
    isSubmitting: formState.isSubmitting
  };
}

// Helper functions for creating branded types
function createUserEmail(email: string): UserId {
  return email as UserId;
}

// Validation rule builders
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    required: true,
    message
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `Must be at least ${min} characters`
  }),
  
  email: (message = 'Please enter a valid email'): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message
  }),
  
  custom: (validate: (value: any) => boolean, message: string): ValidationRule => ({
    validate,
    message
  }),
  
  password: (message = 'Password must be at least 8 characters'): ValidationRule => ({
    minLength: 8,
    message
  }),
  
  confirmPassword: (password: string, message = 'Passwords do not match'): ValidationRule => ({
    validate: (value: string) => value === password,
    message
  })
};
