/**
 * Entitlements Sandbox 增強功能
 * 提供批量操作和權限模板系統
 */

export interface PermissionTemplate {
  id: string
  name: string
  description: string
  category: 'basic' | 'advanced' | 'custom'
  permissions: Array<{
    resource: string
    actions: string[]
    conditions?: Record<string, any>
  }>
  isDefault: boolean
  created_at: string
  updated_at: string
}

export interface BulkOperation {
  id: string
  type: 'create' | 'update' | 'delete' | 'assign' | 'revoke'
  targetType: 'tenant' | 'user' | 'permission' | 'role'
  items: Array<{
    id: string
    data: Record<string, any>
  }>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  totalItems: number
  completedItems: number
  failedItems: number
  errors: Array<{
    itemId: string
    error: string
  }>
  created_at: string
  updated_at: string
}

export interface EnhancedPermission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  tenant_id: string
  
  // 增強屬性
  type: 'read' | 'write' | 'delete' | 'admin' | 'custom'
  scope: 'global' | 'tenant' | 'user' | 'resource'
  conditions?: {
    timeRestriction?: {
      startTime?: string
      endTime?: string
      daysOfWeek?: number[]
    }
    ipRestriction?: {
      allowedIPs?: string[]
      blockedIPs?: string[]
    }
    rateLimit?: {
      requestsPerMinute?: number
      requestsPerHour?: number
    }
    customConditions?: Record<string, any>
  }
  
  // 元數據
  priority: number
  tags: string[]
  isActive: boolean
  created_at: string
  updated_at: string
}

/**
 * 增強版 Entitlements 服務
 */
export class EnhancedEntitlementsService {
  private permissionTemplates: PermissionTemplate[] = []
  private bulkOperations: BulkOperation[] = []
  private enhancedPermissions: EnhancedPermission[] = []

  constructor() {
    this.initializeDefaultTemplates()
  }

  /**
   * 初始化默認權限模板
   */
  private initializeDefaultTemplates(): void {
    this.permissionTemplates = [
      {
        id: 'basic-user',
        name: '基礎用戶權限',
        description: '適用於一般用戶的基本權限',
        category: 'basic',
        isDefault: true,
        permissions: [
          { resource: 'users', actions: ['read'] },
          { resource: 'orders', actions: ['read', 'create'] },
          { resource: 'products', actions: ['read'] }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'admin-user',
        name: '管理員權限',
        description: '適用於管理員的完整權限',
        category: 'advanced',
        isDefault: true,
        permissions: [
          { resource: 'users', actions: ['read', 'write', 'delete'] },
          { resource: 'orders', actions: ['read', 'write', 'delete'] },
          { resource: 'products', actions: ['read', 'write', 'delete'] },
          { resource: 'system', actions: ['admin'] }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'api-user',
        name: 'API 用戶權限',
        description: '適用於 API 調用的權限',
        category: 'custom',
        isDefault: false,
        permissions: [
          { resource: 'api', actions: ['read', 'write'] },
          { resource: 'data', actions: ['read'] }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  /**
   * 權限模板管理
   */
  async createPermissionTemplate(template: Omit<PermissionTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<PermissionTemplate> {
    const newTemplate: PermissionTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    this.permissionTemplates.push(newTemplate)
    return newTemplate
  }

  async getPermissionTemplates(): Promise<PermissionTemplate[]> {
    return this.permissionTemplates
  }

  async getPermissionTemplate(id: string): Promise<PermissionTemplate | null> {
    return this.permissionTemplates.find(t => t.id === id) || null
  }

  async updatePermissionTemplate(id: string, updates: Partial<PermissionTemplate>): Promise<PermissionTemplate | null> {
    const template = this.permissionTemplates.find(t => t.id === id)
    if (!template) return null

    Object.assign(template, { ...updates, updated_at: new Date().toISOString() })
    return template
  }

  async deletePermissionTemplate(id: string): Promise<boolean> {
    const index = this.permissionTemplates.findIndex(t => t.id === id)
    if (index === -1) return false

    this.permissionTemplates.splice(index, 1)
    return true
  }

  /**
   * 批量操作管理
   */
  async createBulkOperation(operation: Omit<BulkOperation, 'id' | 'status' | 'progress' | 'completedItems' | 'failedItems' | 'errors' | 'created_at' | 'updated_at'>): Promise<BulkOperation> {
    const newOperation: BulkOperation = {
      ...operation,
      id: `bulk-${Date.now()}`,
      status: 'pending',
      progress: 0,
      totalItems: operation.items.length,
      completedItems: 0,
      failedItems: 0,
      errors: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    this.bulkOperations.push(newOperation)
    
    // 異步執行批量操作
    this.executeBulkOperation(newOperation.id)
    
    return newOperation
  }

  async getBulkOperations(): Promise<BulkOperation[]> {
    return this.bulkOperations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  async getBulkOperation(id: string): Promise<BulkOperation | null> {
    return this.bulkOperations.find(o => o.id === id) || null
  }

  /**
   * 執行批量操作
   */
  private async executeBulkOperation(operationId: string): Promise<void> {
    const operation = this.bulkOperations.find(o => o.id === operationId)
    if (!operation) return

    operation.status = 'processing'
    operation.updated_at = new Date().toISOString()

    try {
      for (let i = 0; i < operation.items.length; i++) {
        const item = operation.items[i]
        
        try {
          await this.processBulkItem(operation, item)
          operation.completedItems++
        } catch (error) {
          operation.failedItems++
          operation.errors.push({
            itemId: item.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
        
        operation.progress = ((i + 1) / operation.totalItems) * 100
        operation.updated_at = new Date().toISOString()
        
        // 模擬處理時間
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      operation.status = 'completed'
    } catch (error) {
      operation.status = 'failed'
      operation.errors.push({
        itemId: 'operation',
        error: error instanceof Error ? error.message : 'Operation failed'
      })
    }
    
    operation.updated_at = new Date().toISOString()
  }

  /**
   * 處理批量操作中的單個項目
   */
  private async processBulkItem(operation: BulkOperation, item: { id: string; data: Record<string, any> }): Promise<void> {
    switch (operation.type) {
      case 'create':
        await this.createEnhancedPermission(item.data as EnhancedPermission)
        break
      case 'update':
        await this.updateEnhancedPermission(item.id, item.data)
        break
      case 'delete':
        await this.deleteEnhancedPermission(item.id)
        break
      case 'assign':
        await this.assignPermissionToUser(item.id, item.data)
        break
      case 'revoke':
        await this.revokePermissionFromUser(item.id, item.data)
        break
      default:
        throw new Error(`Unsupported operation type: ${operation.type}`)
    }
  }

  /**
   * 增強權限管理
   */
  async createEnhancedPermission(permission: Omit<EnhancedPermission, 'id' | 'created_at' | 'updated_at'>): Promise<EnhancedPermission> {
    const newPermission: EnhancedPermission = {
      ...permission,
      id: `perm-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    this.enhancedPermissions.push(newPermission)
    return newPermission
  }

  async getEnhancedPermissions(tenantId?: string): Promise<EnhancedPermission[]> {
    if (tenantId) {
      return this.enhancedPermissions.filter(p => p.tenant_id === tenantId)
    }
    return this.enhancedPermissions
  }

  async updateEnhancedPermission(id: string, updates: Partial<EnhancedPermission>): Promise<EnhancedPermission | null> {
    const permission = this.enhancedPermissions.find(p => p.id === id)
    if (!permission) return null

    Object.assign(permission, { ...updates, updated_at: new Date().toISOString() })
    return permission
  }

  async deleteEnhancedPermission(id: string): Promise<boolean> {
    const index = this.enhancedPermissions.findIndex(p => p.id === id)
    if (index === -1) return false

    this.enhancedPermissions.splice(index, 1)
    return true
  }

  /**
   * 權限分配和撤銷
   */
  async assignPermissionToUser(permissionId: string, userData: { userId: string; tenantId: string }): Promise<void> {
    // 這裡可以實現權限分配邏輯
    console.log(`Assigning permission ${permissionId} to user ${userData.userId}`)
  }

  async revokePermissionFromUser(permissionId: string, userData: { userId: string; tenantId: string }): Promise<void> {
    // 這裡可以實現權限撤銷邏輯
    console.log(`Revoking permission ${permissionId} from user ${userData.userId}`)
  }

  /**
   * 權限檢查
   */
  async checkPermission(userId: string, resource: string, action: string, tenantId?: string): Promise<boolean> {
    const userPermissions = this.enhancedPermissions.filter(p => 
      p.resource === resource && 
      p.action === action &&
      (!tenantId || p.tenant_id === tenantId) &&
      p.isActive
    )
    
    return userPermissions.length > 0
  }

  /**
   * 批量權限檢查
   */
  async checkMultiplePermissions(userId: string, permissions: Array<{ resource: string; action: string; tenantId?: string }>): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}
    
    for (const permission of permissions) {
      const key = `${permission.resource}:${permission.action}`
      results[key] = await this.checkPermission(userId, permission.resource, permission.action, permission.tenantId)
    }
    
    return results
  }

  /**
   * 權限模板應用
   */
  async applyTemplateToUser(templateId: string, userId: string, tenantId: string): Promise<void> {
    const template = await this.getPermissionTemplate(templateId)
    if (!template) throw new Error(`Template ${templateId} not found`)

    const bulkItems = template.permissions.map(perm => ({
      id: `perm-${Date.now()}-${Math.random()}`,
      data: {
        userId,
        tenantId,
        resource: perm.resource,
        action: perm.actions.join(','),
        conditions: perm.conditions
      }
    }))

    await this.createBulkOperation({
      type: 'assign',
      targetType: 'user',
      items: bulkItems
    })
  }

  /**
   * 權限統計
   */
  async getPermissionStats(tenantId?: string): Promise<{
    totalPermissions: number
    activePermissions: number
    permissionsByType: Record<string, number>
    permissionsByResource: Record<string, number>
  }> {
    const permissions = tenantId ? 
      this.enhancedPermissions.filter(p => p.tenant_id === tenantId) :
      this.enhancedPermissions

    const stats = {
      totalPermissions: permissions.length,
      activePermissions: permissions.filter(p => p.isActive).length,
      permissionsByType: {} as Record<string, number>,
      permissionsByResource: {} as Record<string, number>
    }

    permissions.forEach(p => {
      stats.permissionsByType[p.type] = (stats.permissionsByType[p.type] || 0) + 1
      stats.permissionsByResource[p.resource] = (stats.permissionsByResource[p.resource] || 0) + 1
    })

    return stats
  }
}

/**
 * 全局增強版 Entitlements 服務實例
 */
export const enhancedEntitlementsService = new EnhancedEntitlementsService()

