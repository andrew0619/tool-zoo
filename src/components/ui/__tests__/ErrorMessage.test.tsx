import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ErrorMessage, SuccessMessage, WarningMessage } from '../ErrorMessage'
import { createAppError } from '@/lib/error-handler'

describe('ErrorMessage', () => {
  const mockOnDismiss = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('with string error', () => {
    it('should render error message', () => {
      render(<ErrorMessage error="Test error message" />)
      
      expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('should not render when error is null', () => {
      render(<ErrorMessage error={null} />)
      
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument()
    })

    it('should call onDismiss when close button is clicked', () => {
      render(<ErrorMessage error="Test error" onDismiss={mockOnDismiss} />)
      
      const closeButton = screen.getByRole('button', { name: /關閉/i })
      fireEvent.click(closeButton)
      
      expect(mockOnDismiss).toHaveBeenCalledTimes(1)
    })

    it('should auto-dismiss after specified delay', async () => {
      jest.useFakeTimers()
      
      render(
        <ErrorMessage 
          error="Test error" 
          onDismiss={mockOnDismiss}
          autoDismiss={true}
          dismissDelay={1000}
        />
      )
      
      expect(screen.getByText('Test error')).toBeInTheDocument()
      
      await act(async () => {
        jest.advanceTimersByTime(1000)
      })
      
      expect(mockOnDismiss).toHaveBeenCalledTimes(1)
      
      jest.useRealTimers()
    })
  })

  describe('with AppError object', () => {
    it('should render user-friendly error message', () => {
      const error = createAppError('AUTH_REQUIRED')
      render(<ErrorMessage error={error} />)
      
      expect(screen.getByText('請先登入您的帳號')).toBeInTheDocument()
    })

    it('should show different styles for different error types', () => {
      const authError = createAppError('AUTH_REQUIRED')
      const validationError = createAppError('VALIDATION_ERROR')
      
      const { rerender } = render(<ErrorMessage error={authError} />)
      
      // Auth error should have red styling
      const authContainer = screen.getByText('請先登入您的帳號').closest('div')?.parentElement?.parentElement
      expect(authContainer).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800')
      
      rerender(<ErrorMessage error={validationError} />)
      
      // Validation error should have yellow styling
      const validationContainer = screen.getByText('請檢查輸入的資料是否正確').closest('div')?.parentElement?.parentElement
      expect(validationContainer).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800')
    })

    it('should show details when error has details', () => {
      const error = createAppError('DATABASE_ERROR', 'Database error', { userId: '123' })
      render(<ErrorMessage error={error} />)
      
      const detailsButton = screen.getByText('查看詳細信息')
      fireEvent.click(detailsButton)
      
      expect(screen.getByText('"userId": "123"', { exact: false })).toBeInTheDocument()
    })
  })

  describe('error styling', () => {
    it('should apply correct styling for AUTH_REQUIRED', () => {
      const error = createAppError('AUTH_REQUIRED')
      render(<ErrorMessage error={error} />)
      
      const container = screen.getByText('請先登入您的帳號').closest('div')?.parentElement?.parentElement
      expect(container).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800')
    })

    it('should apply correct styling for PERMISSION_DENIED', () => {
      const error = createAppError('PERMISSION_DENIED')
      render(<ErrorMessage error={error} />)
      
      const container = screen.getByText('您沒有權限執行此操作，請聯繫管理員').closest('div')?.parentElement?.parentElement
      expect(container).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800')
    })

    it('should apply correct styling for VALIDATION_ERROR', () => {
      const error = createAppError('VALIDATION_ERROR')
      render(<ErrorMessage error={error} />)
      
      const container = screen.getByText('請檢查輸入的資料是否正確').closest('div')?.parentElement?.parentElement
      expect(container).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800')
    })

    it('should apply correct styling for FEATURE_NOT_AVAILABLE', () => {
      const error = createAppError('FEATURE_NOT_AVAILABLE')
      render(<ErrorMessage error={error} />)
      
      const container = screen.getByText('此功能需要升級您的訂閱計劃').closest('div')?.parentElement?.parentElement
      expect(container).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800')
    })

    it('should apply correct styling for NETWORK_ERROR', () => {
      const error = createAppError('NETWORK_ERROR')
      render(<ErrorMessage error={error} />)
      
      const container = screen.getByText('網絡連接失敗，請檢查您的網絡連接').closest('div')?.parentElement?.parentElement
      expect(container).toHaveClass('bg-orange-50', 'border-orange-200', 'text-orange-800')
    })
  })
})

describe('SuccessMessage', () => {
  const mockOnDismiss = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render success message', () => {
    render(<SuccessMessage message="Operation completed successfully" />)
    
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument()
  })

  it('should have green styling', () => {
    render(<SuccessMessage message="Success" />)
    
    const container = screen.getByText('Success').closest('div')?.parentElement?.parentElement
    expect(container).toHaveClass('bg-green-50', 'border-green-200')
  })

  it('should auto-dismiss by default', async () => {
    jest.useFakeTimers()
    
    render(
      <SuccessMessage 
        message="Success" 
        onDismiss={mockOnDismiss}
      />
    )
    
          await act(async () => {
        jest.advanceTimersByTime(3000)
      })
      
      expect(mockOnDismiss).toHaveBeenCalledTimes(1)
    
    jest.useRealTimers()
  })

  it('should call onDismiss when close button is clicked', () => {
    render(<SuccessMessage message="Success" onDismiss={mockOnDismiss} />)
    
    const closeButton = screen.getByRole('button', { name: /關閉/i })
    fireEvent.click(closeButton)
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1)
  })

  it('should not auto-dismiss when autoDismiss is false', async () => {
    jest.useFakeTimers()
    
    render(
      <SuccessMessage 
        message="Success" 
        onDismiss={mockOnDismiss}
        autoDismiss={false}
      />
    )
    
    jest.advanceTimersByTime(5000)
    
    expect(mockOnDismiss).not.toHaveBeenCalled()
    
    jest.useRealTimers()
  })
})

describe('WarningMessage', () => {
  const mockOnDismiss = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render warning message', () => {
    render(<WarningMessage message="This is a warning" />)
    
    expect(screen.getByText('This is a warning')).toBeInTheDocument()
  })

  it('should have yellow styling', () => {
    render(<WarningMessage message="Warning" />)
    
    const container = screen.getByText('Warning').closest('div')?.parentElement?.parentElement
    expect(container).toHaveClass('bg-yellow-50', 'border-yellow-200')
  })

  it('should not auto-dismiss by default', async () => {
    jest.useFakeTimers()
    
    render(
      <WarningMessage 
        message="Warning" 
        onDismiss={mockOnDismiss}
      />
    )
    
    jest.advanceTimersByTime(5000)
    
    expect(mockOnDismiss).not.toHaveBeenCalled()
    
    jest.useRealTimers()
  })

  it('should call onDismiss when close button is clicked', () => {
    render(<WarningMessage message="Warning" onDismiss={mockOnDismiss} />)
    
    const closeButton = screen.getByRole('button', { name: /關閉/i })
    fireEvent.click(closeButton)
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1)
  })

  it('should auto-dismiss when autoDismiss is true', async () => {
    jest.useFakeTimers()
    
    render(
      <WarningMessage 
        message="Warning" 
        onDismiss={mockOnDismiss}
        autoDismiss={true}
        dismissDelay={2000}
      />
    )
    
          await act(async () => {
        jest.advanceTimersByTime(2000)
      })
      
      expect(mockOnDismiss).toHaveBeenCalledTimes(1)
    
    jest.useRealTimers()
  })
})
