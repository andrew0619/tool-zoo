'use client'

import { useState, useCallback } from 'react'
import { z, ZodSchema, ZodError } from 'zod'
import { ValidationError } from '@/lib/error-handler'

interface UseFormValidationOptions<T> {
  schema: ZodSchema<T>
  initialValues: T
  onSubmit: (values: T) => Promise<void> | void
  onError?: (errors: ValidationError[]) => void
}

interface ValidationState<T> {
  values: T
  errors: Record<keyof T, string>
  touched: Record<keyof T, boolean>
  isValid: boolean
  isSubmitting: boolean
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  initialValues,
  onSubmit,
  onError
}: UseFormValidationOptions<T>) {
  const [state, setState] = useState<ValidationState<T>>({
    values: initialValues,
    errors: {} as Record<keyof T, string>,
    touched: {} as Record<keyof T, boolean>,
    isValid: true,
    isSubmitting: false
  })

  // 驗證單個字段
  const validateField = useCallback((field: keyof T, value: any): string => {
    try {
      // 創建部分 schema 來驗證單個字段
      const fieldSchema = z.object({ [field]: schema.shape[field] })
      fieldSchema.parse({ [field]: value })
      return ''
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldError = error.errors.find(e => e.path.includes(field as string))
        return fieldError?.message || ''
      }
      return ''
    }
  }, [schema])

  // 驗證整個表單
  const validateForm = useCallback((values: T): Record<keyof T, string> => {
    try {
      schema.parse(values)
      return {} as Record<keyof T, string>
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<keyof T, string> = {} as Record<keyof T, string>
        error.errors.forEach(err => {
          const field = err.path[0] as keyof T
          if (field) {
            errors[field] = err.message
          }
        })
        return errors
      }
      return {} as Record<keyof T, string>
    }
  }, [schema])

  // 更新字段值
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setState(prev => {
      const newValues = { ...prev.values, [field]: value }
      const newErrors = { ...prev.errors }
      
      // 如果字段已被觸摸，立即驗證
      if (prev.touched[field]) {
        newErrors[field] = validateField(field, value)
      }

      const allErrors = validateForm(newValues)
      const isValid = Object.keys(allErrors).length === 0

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        isValid
      }
    })
  }, [validateField, validateForm])

  // 設置字段為已觸摸狀態
  const setFieldTouched = useCallback((field: keyof T, touched: boolean = true) => {
    setState(prev => {
      const newTouched = { ...prev.touched, [field]: touched }
      const newErrors = { ...prev.errors }
      
      // 如果設置為已觸摸，立即驗證
      if (touched) {
        newErrors[field] = validateField(field, prev.values[field])
      }

      const allErrors = validateForm(prev.values)
      const isValid = Object.keys(allErrors).length === 0

      return {
        ...prev,
        touched: newTouched,
        errors: newErrors,
        isValid
      }
    })
  }, [validateField, validateForm])

  // 處理字段變更
  const handleChange = useCallback((field: keyof T) => (value: any) => {
    setFieldValue(field, value)
  }, [setFieldValue])

  // 處理字段失焦
  const handleBlur = useCallback((field: keyof T) => () => {
    setFieldTouched(field, true)
  }, [setFieldTouched])

  // 提交表單
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    // 標記所有字段為已觸摸
    const allTouched = Object.keys(state.values).reduce((acc, key) => {
      acc[key as keyof T] = true
      return acc
    }, {} as Record<keyof T, boolean>)

    // 驗證整個表單
    const errors = validateForm(state.values)
    const isValid = Object.keys(errors).length === 0

    setState(prev => ({
      ...prev,
      touched: allTouched,
      errors,
      isValid
    }))

    if (!isValid) {
      // 轉換錯誤格式並調用 onError
      const validationErrors: ValidationError[] = Object.entries(errors).map(([field, message]) => ({
        field,
        message,
        value: state.values[field as keyof T]
      }))
      
      onError?.(validationErrors)
      return
    }

    setState(prev => ({ ...prev, isSubmitting: true }))

    try {
      await onSubmit(state.values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }, [state.values, validateForm, isValid, onSubmit, onError])

  // 重置表單
  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {} as Record<keyof T, string>,
      touched: {} as Record<keyof T, boolean>,
      isValid: true,
      isSubmitting: false
    })
  }, [initialValues])

  // 設置整個表單的錯誤
  const setErrors = useCallback((errors: Record<keyof T, string>) => {
    setState(prev => ({
      ...prev,
      errors,
      isValid: Object.keys(errors).length === 0
    }))
  }, [])

  // 設置整個表單的值
  const setValues = useCallback((values: T) => {
    const errors = validateForm(values)
    setState(prev => ({
      ...prev,
      values,
      errors,
      isValid: Object.keys(errors).length === 0
    }))
  }, [validateForm])

  return {
    // 狀態
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isValid: state.isValid,
    isSubmitting: state.isSubmitting,
    
    // 方法
    setFieldValue,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setErrors,
    setValues,
    validateField,
    validateForm
  }
}

// 簡化的表單驗證 Hook
export function useSimpleFormValidation<T extends Record<string, any>>(
  schema: ZodSchema<T>,
  initialValues: T
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>)

  const validate = useCallback((data: T): boolean => {
    try {
      schema.parse(data)
      setErrors({} as Record<keyof T, string>)
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>
        error.errors.forEach(err => {
          const field = err.path[0] as keyof T
          if (field) {
            newErrors[field] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }, [schema])

  const setValue = useCallback((field: keyof T, value: any) => {
    const newValues = { ...values, [field]: value }
    setValues(newValues)
    validate(newValues)
  }, [values, validate])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({} as Record<keyof T, string>)
  }, [initialValues])

  return {
    values,
    errors,
    setValue,
    setValues,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  }
}
