import { renderHook, act } from '@testing-library/react'
import { z } from 'zod'
import { useFormValidation, useSimpleFormValidation } from '../useFormValidation'

// Test schema
const TestSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件地址'),
  password: z.string().min(8, '密碼至少需要8個字符'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "密碼不匹配",
  path: ["confirmPassword"]
})

const SimpleSchema = z.object({
  name: z.string().min(1, '姓名不能為空'),
  age: z.number().min(18, '年齡必須大於18歲'),
})

describe('useFormValidation', () => {
  const initialValues = {
    email: '',
    password: '',
    confirmPassword: '',
  }

  const mockOnSubmit = jest.fn()
  const mockOnError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with provided values', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          schema: TestSchema,
          initialValues,
          onSubmit: mockOnSubmit,
        })
      )

      expect(result.current.values).toEqual(initialValues)
      expect(result.current.errors).toEqual({})
      expect(result.current.touched).toEqual({})
      expect(result.current.isValid).toBe(true)
      expect(result.current.isSubmitting).toBe(false)
    })
  })

  describe('setFieldValue', () => {
    it('should update field value', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          schema: TestSchema,
          initialValues,
          onSubmit: mockOnSubmit,
        })
      )

      act(() => {
        result.current.setFieldValue('email', 'test@example.com')
      })

      expect(result.current.values.email).toBe('test@example.com')
    })

    it('should validate field if touched', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          schema: TestSchema,
          initialValues,
          onSubmit: mockOnSubmit,
        })
      )

      // Mark field as touched
      act(() => {
        result.current.setFieldTouched('email', true)
      })

      // Set invalid value
      act(() => {
        result.current.setFieldValue('email', 'invalid-email')
      })

      expect(result.current.errors.email).toBe('請輸入有效的電子郵件地址')
      expect(result.current.isValid).toBe(false)
    })
  })

  describe('setFieldTouched', () => {
    it('should mark field as touched', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          schema: TestSchema,
          initialValues,
          onSubmit: mockOnSubmit,
        })
      )

      act(() => {
        result.current.setFieldTouched('email', true)
      })

      expect(result.current.touched.email).toBe(true)
    })

    it('should validate field when marked as touched', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          schema: TestSchema,
          initialValues,
          onSubmit: mockOnSubmit,
        })
      )

      // Set invalid value first
      act(() => {
        result.current.setFieldValue('email', 'invalid-email')
      })

      // Mark as touched
      act(() => {
        result.current.setFieldTouched('email', true)
      })

      expect(result.current.errors.email).toBe('請輸入有效的電子郵件地址')
    })
  })

  describe('handleSubmit', () => {
    it('should call onSubmit when form is valid', async () => {
      const { result } = renderHook(() =>
        useFormValidation({
          schema: TestSchema,
          initialValues: {
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          },
          onSubmit: mockOnSubmit,
        })
      )

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
    })

    it('should not call onSubmit when form is invalid', async () => {
      const { result } = renderHook(() =>
        useFormValidation({
          schema: TestSchema,
          initialValues,
          onSubmit: mockOnSubmit,
          onError: mockOnError,
        })
      )

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
      expect(mockOnError).toHaveBeenCalled()
    })

    it('should mark all fields as touched on submit', async () => {
      const { result } = renderHook(() =>
        useFormValidation({
          schema: TestSchema,
          initialValues,
          onSubmit: mockOnSubmit,
          onError: mockOnError,
        })
      )

      await act(async () => {
        await result.current.handleSubmit()
      })

      expect(result.current.touched.email).toBe(true)
      expect(result.current.touched.password).toBe(true)
      expect(result.current.touched.confirmPassword).toBe(true)
    })
  })

  describe('resetForm', () => {
    it('should reset form to initial values', () => {
      const { result } = renderHook(() =>
        useFormValidation({
          schema: TestSchema,
          initialValues,
          onSubmit: mockOnSubmit,
        })
      )

      // Change values
      act(() => {
        result.current.setFieldValue('email', 'test@example.com')
        result.current.setFieldTouched('email', true)
      })

      // Reset form
      act(() => {
        result.current.resetForm()
      })

      expect(result.current.values).toEqual(initialValues)
      expect(result.current.errors).toEqual({})
      expect(result.current.touched).toEqual({})
      expect(result.current.isValid).toBe(true)
      expect(result.current.isSubmitting).toBe(false)
    })
  })
})

describe('useSimpleFormValidation', () => {
  const initialValues = {
    name: '',
    age: 0,
  }

  describe('initialization', () => {
    it('should initialize with provided values', () => {
      const { result } = renderHook(() =>
        useSimpleFormValidation(SimpleSchema, initialValues)
      )

      expect(result.current.values).toEqual(initialValues)
      expect(result.current.errors).toEqual({})
      expect(result.current.isValid).toBe(true)
    })
  })

  describe('setValue', () => {
    it('should update field value and validate', () => {
      const { result } = renderHook(() =>
        useSimpleFormValidation(SimpleSchema, initialValues)
      )

      act(() => {
        result.current.setValue('name', 'John')
      })

      expect(result.current.values.name).toBe('John')
      expect(result.current.isValid).toBe(false) // age is still 0
    })
  })

  describe('validate', () => {
    it('should return true for valid data', () => {
      const { result } = renderHook(() =>
        useSimpleFormValidation(SimpleSchema, initialValues)
      )

      act(() => {
        const isValid = result.current.validate({
          name: 'John',
          age: 25,
        })

        expect(isValid).toBe(true)
      })

      expect(result.current.errors).toEqual({})
    })

    it('should return false for invalid data', () => {
      const { result } = renderHook(() =>
        useSimpleFormValidation(SimpleSchema, initialValues)
      )

      act(() => {
        const isValid = result.current.validate({
          name: '',
          age: 15,
        })

        expect(isValid).toBe(false)
      })

      expect(result.current.errors.name).toBe('姓名不能為空')
      expect(result.current.errors.age).toBe('年齡必須大於18歲')
    })
  })

  describe('reset', () => {
    it('should reset form to initial values', () => {
      const { result } = renderHook(() =>
        useSimpleFormValidation(SimpleSchema, initialValues)
      )

      // Change values
      act(() => {
        result.current.setValue('name', 'John')
      })

      // Reset form
      act(() => {
        result.current.reset()
      })

      expect(result.current.values).toEqual(initialValues)
      expect(result.current.errors).toEqual({})
      expect(result.current.isValid).toBe(true)
    })
  })
})
