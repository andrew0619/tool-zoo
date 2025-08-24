/**
 * JSON-AI Salvage Kit - 分級修復策略系統
 * 提供智能的 JSON 修復策略，按優先級和複雜度分級
 */

export interface SalvageStrategy {
  id: string
  name: string
  description: string
  category: 'basic' | 'intermediate' | 'advanced' | 'ai_powered'
  priority: number
  confidence: number
  costLevel: 'free' | 'low' | 'medium' | 'high'
  pattern?: string
  replacement?: string
  customHandler?: (input: string) => Promise<{ result: string; confidence: number }>
}

export interface SalvageResult {
  original: string
  repaired: string
  appliedStrategies: string[]
  confidence: number
  processingTime: number
  cost: number
  success: boolean
  errorMessage?: string
}

/**
 * 基礎修復策略 - 免費，快速，高信心度
 */
const basicStrategies: SalvageStrategy[] = [
  {
    id: 'fix-unquoted-keys',
    name: '修復缺少引號的鍵',
    description: '為 JSON 對象中缺少引號的鍵名添加雙引號',
    category: 'basic',
    priority: 1,
    confidence: 0.95,
    costLevel: 'free',
    pattern: '([{,]\\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*:',
    replacement: '$1"$2":'
  },
  {
    id: 'remove-trailing-commas',
    name: '移除尾隨逗號',
    description: '移除 JSON 對象和數組中的尾隨逗號',
    category: 'basic',
    priority: 2,
    confidence: 0.98,
    costLevel: 'free',
    pattern: ',\\s*([}\\]])',
    replacement: '$1'
  },
  {
    id: 'fix-single-quotes',
    name: '修復單引號',
    description: '將字符串中的單引號替換為雙引號',
    category: 'basic',
    priority: 3,
    confidence: 0.90,
    costLevel: 'free',
    pattern: "'([^'\\\\]*(\\\\.[^'\\\\]*)*)'",
    replacement: '"$1"'
  },
  {
    id: 'fix-unescaped-quotes',
    name: '修復未轉義的引號',
    description: '轉義字符串內的雙引號',
    category: 'basic',
    priority: 4,
    confidence: 0.85,
    costLevel: 'free',
    pattern: '("([^"\\\\]*)(?<!\\\\)"([^"\\\\]*)"([^"\\\\]*)")',
    replacement: '"$2\\"$3\\"$4"'
  }
]

/**
 * 中級修復策略 - 低成本，中等複雜度
 */
const intermediateStrategies: SalvageStrategy[] = [
  {
    id: 'fix-missing-brackets',
    name: '修復缺少的括號',
    description: '檢測並修復缺少的大括號或方括號',
    category: 'intermediate',
    priority: 5,
    confidence: 0.80,
    costLevel: 'low',
    customHandler: async (input: string) => {
      const openBraces = (input.match(/\{/g) || []).length
      const closeBraces = (input.match(/\}/g) || []).length
      const openBrackets = (input.match(/\[/g) || []).length
      const closeBrackets = (input.match(/\]/g) || []).length
      
      let result = input
      const confidence = 0.8
      
      // 修復缺少的大括號
      if (openBraces > closeBraces) {
        result += '}'.repeat(openBraces - closeBraces)
      } else if (closeBraces > openBraces) {
        result = '{'.repeat(closeBraces - openBraces) + result
      }
      
      // 修復缺少的方括號
      if (openBrackets > closeBrackets) {
        result += ']'.repeat(openBrackets - closeBrackets)
      } else if (closeBrackets > openBrackets) {
        result = '['.repeat(closeBrackets - openBrackets) + result
      }
      
      return { result, confidence }
    }
  },
  {
    id: 'fix-number-formats',
    name: '修復數字格式',
    description: '修復無效的數字格式（如前導零、無效小數點）',
    category: 'intermediate',
    priority: 6,
    confidence: 0.85,
    costLevel: 'low',
    pattern: ':\\s*0+([1-9]\\d*)',
    replacement: ': $1'
  },
  {
    id: 'fix-boolean-values',
    name: '修復布爾值',
    description: '修復常見的布爾值錯誤（True/False -> true/false）',
    category: 'intermediate',
    priority: 7,
    confidence: 0.90,
    costLevel: 'low',
    pattern: ':\\s*(True|False|TRUE|FALSE|yes|no|Yes|No)',
    replacement: (match: string, value: string) => {
      const lowerValue = value.toLowerCase()
      if (['true', 'yes'].includes(lowerValue)) return ': true'
      if (['false', 'no'].includes(lowerValue)) return ': false'
      return match
    }
  }
]

/**
 * 高級修復策略 - 中等成本，高複雜度
 */
const advancedStrategies: SalvageStrategy[] = [
  {
    id: 'fix-nested-structure',
    name: '修復嵌套結構',
    description: '智能分析和修復複雜的嵌套 JSON 結構',
    category: 'advanced',
    priority: 8,
    confidence: 0.75,
    costLevel: 'medium',
    customHandler: async (input: string) => {
      // 使用狀態機來分析 JSON 結構
      let result = input
      const confidence = 0.75
      
      try {
        // 嘗試解析以找出結構問題
        JSON.parse(result)
        return { result, confidence: 1.0 }
      } catch (error) {
        // 實現智能結構修復邏輯
        result = await fixNestedStructure(input)
        return { result, confidence }
      }
    }
  },
  {
    id: 'fix-encoding-issues',
    name: '修復編碼問題',
    description: '處理 Unicode 編碼和特殊字符問題',
    category: 'advanced',
    priority: 9,
    confidence: 0.70,
    costLevel: 'medium',
    customHandler: async (input: string) => {
      let result = input
      const confidence = 0.70
      
      // 修復常見的編碼問題
      result = result
        .replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
          try {
            return String.fromCharCode(parseInt(code, 16))
          } catch {
            return match
          }
        })
        .replace(/\\x([0-9a-fA-F]{2})/g, (match, code) => {
          try {
            return String.fromCharCode(parseInt(code, 16))
          } catch {
            return match
          }
        })
      
      return { result, confidence }
    }
  }
]

/**
 * AI 驅動策略 - 高成本，最高智能度
 */
const aiPoweredStrategies: SalvageStrategy[] = [
  {
    id: 'ai-semantic-repair',
    name: 'AI 語義修復',
    description: '使用 AI 理解內容語義，進行智能修復',
    category: 'ai_powered',
    priority: 10,
    confidence: 0.85,
    costLevel: 'high',
    customHandler: async (input: string) => {
      // 這裡可以整合 OpenAI API 或其他 AI 服務
      // 暫時返回模擬結果
      return {
        result: input,
        confidence: 0.85
      }
    }
  },
  {
    id: 'ai-schema-inference',
    name: 'AI Schema 推斷',
    description: '基於內容推斷預期的 JSON Schema 並修復',
    category: 'ai_powered',
    priority: 11,
    confidence: 0.80,
    costLevel: 'high',
    customHandler: async (input: string) => {
      // AI Schema 推斷邏輯
      return {
        result: input,
        confidence: 0.80
      }
    }
  }
]

/**
 * 所有策略的集合
 */
export const allStrategies: SalvageStrategy[] = [
  ...basicStrategies,
  ...intermediateStrategies,
  ...advancedStrategies,
  ...aiPoweredStrategies
]

/**
 * 根據用戶訂閱等級獲取可用策略
 */
export function getAvailableStrategies(tier: 'free' | 'pro' | 'enterprise'): SalvageStrategy[] {
  switch (tier) {
    case 'free':
      return basicStrategies
    case 'pro':
      return [...basicStrategies, ...intermediateStrategies, ...advancedStrategies]
    case 'enterprise':
      return allStrategies
    default:
      return basicStrategies
  }
}

/**
 * 智能修復 JSON
 */
export async function smartSalvageJSON(
  input: string,
  tier: 'free' | 'pro' | 'enterprise' = 'free',
  maxCost: number = 0.01
): Promise<SalvageResult> {
  const startTime = Date.now()
  let result = input
  let totalCost = 0
  const appliedStrategies: string[] = []
  let overallConfidence = 1.0
  
  const availableStrategies = getAvailableStrategies(tier)
    .sort((a, b) => a.priority - b.priority)
  
  for (const strategy of availableStrategies) {
    // 檢查成本限制
    const strategyCost = getCostForStrategy(strategy)
    if (totalCost + strategyCost > maxCost) {
      continue
    }
    
    try {
      let strategyResult: { result: string; confidence: number }
      
      if (strategy.customHandler) {
        strategyResult = await strategy.customHandler(result)
      } else if (strategy.pattern && strategy.replacement) {
        const regex = new RegExp(strategy.pattern, 'g')
        const newResult = result.replace(regex, strategy.replacement as string)
        strategyResult = {
          result: newResult,
          confidence: strategy.confidence
        }
      } else {
        continue
      }
      
      // 如果策略有改進，應用它
      if (strategyResult.result !== result) {
        result = strategyResult.result
        appliedStrategies.push(strategy.name)
        overallConfidence *= strategyResult.confidence
        totalCost += strategyCost
        
        // 嘗試解析以檢查是否已經修復
        try {
          JSON.parse(result)
          break // 成功修復，停止應用更多策略
        } catch {
          // 繼續嘗試其他策略
        }
      }
    } catch (error) {
      console.error(`Strategy ${strategy.id} failed:`, error)
    }
  }
  
  const processingTime = Date.now() - startTime
  let success = false
  let errorMessage: string | undefined
  
  try {
    JSON.parse(result)
    success = true
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Unknown parsing error'
  }
  
  return {
    original: input,
    repaired: result,
    appliedStrategies,
    confidence: overallConfidence,
    processingTime,
    cost: totalCost,
    success,
    errorMessage
  }
}

/**
 * 獲取策略的成本
 */
function getCostForStrategy(strategy: SalvageStrategy): number {
  switch (strategy.costLevel) {
    case 'free': return 0
    case 'low': return 0.001
    case 'medium': return 0.005
    case 'high': return 0.02
    default: return 0
  }
}

/**
 * 修復嵌套結構的輔助函數
 */
async function fixNestedStructure(input: string): Promise<string> {
  // 實現智能嵌套結構修復
  // 這是一個簡化版本，實際實現會更複雜
  let result = input
  
  // 修復常見的嵌套問題
  result = result
    .replace(/,(\s*[}\]])/g, '$1') // 移除尾隨逗號
    .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // 添加鍵的引號
  
  return result
}

/**
 * 分析 JSON 錯誤熱點
 */
export function analyzeErrorHotspots(input: string): {
  line: number
  column: number
  error: string
  suggestion: string
}[] {
  const hotspots: {
    line: number
    column: number
    error: string
    suggestion: string
  }[] = []
  
  try {
    JSON.parse(input)
    return hotspots // 沒有錯誤
  } catch (error) {
    if (error instanceof SyntaxError) {
      const lines = input.split('\n')
      
      // 分析常見錯誤模式
      lines.forEach((line, lineIndex) => {
        // 檢查未引用的鍵
        const unquotedKeyMatch = line.match(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/)
        if (unquotedKeyMatch) {
          hotspots.push({
            line: lineIndex + 1,
            column: unquotedKeyMatch.index! + unquotedKeyMatch[1].length,
            error: '未引用的鍵',
            suggestion: `將 ${unquotedKeyMatch[2]} 改為 "${unquotedKeyMatch[2]}"`
          })
        }
        
        // 檢查尾隨逗號
        const trailingCommaMatch = line.match(/,(\s*[}\]])/)
        if (trailingCommaMatch) {
          hotspots.push({
            line: lineIndex + 1,
            column: trailingCommaMatch.index!,
            error: '尾隨逗號',
            suggestion: '移除多餘的逗號'
          })
        }
      })
    }
  }
  
  return hotspots
}

