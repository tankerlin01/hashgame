import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Game {
  game_id: string
  block_height: number
  result: string
  game_type: 'classic' | 'tournament'
  created_at: string
}

export interface Strategy {
  id: string
  created_at: string
  rounds: number
  bets: string[]
  results: string[]
  status: 'pending' | 'settled'
  win_rate?: number
}

export interface UpdateRecord {
  id: string
  updated_at: string
  gameIds: string[]
  displayText: string
}

// 真实历史数据
const realGameData: { id: string; result: string }[] = [
  { id: '940600', result: 'a' },
  { id: '940599', result: 'c' },
  { id: '940598', result: '4' },
  { id: '940597', result: '8' },
  { id: '940596', result: 'd' },
  { id: '940595', result: 'f' },
  { id: '940594', result: 'c' },
  { id: '940593', result: '8' },
  { id: '940592', result: '3' },
  { id: '940591', result: 'd' },
  { id: '940590', result: 'b' },
  { id: '940589', result: 'f' },
  { id: '940588', result: '1' },
  { id: '940587', result: '7' },
  { id: '940586', result: 'f' },
  { id: '940585', result: '0' },
  { id: '940584', result: 'c' },
  { id: '940583', result: '7' },
  { id: '940582', result: '8' },
  { id: '940581', result: '4' },
  { id: '940580', result: '4' },
  { id: '940579', result: '2' },
  { id: '940578', result: 'e' },
  { id: '940577', result: 'e' },
  { id: '940576', result: 'c' },
  { id: '940575', result: 'f' },
  { id: '940574', result: '7' },
  { id: '940573', result: '4' },
  { id: '940572', result: '8' },
  { id: '940571', result: '0' },
  { id: '940570', result: 'd' },
  { id: '940569', result: '0' },
  { id: '940568', result: 'b' },
  { id: '940567', result: '6' },
  { id: '940566', result: 'a' },
  { id: '940565', result: 'a' },
  { id: '940564', result: '7' },
  { id: '940563', result: 'b' },
  { id: '940562', result: '3' },
  { id: '940561', result: '7' },
  { id: '940560', result: 'c' },
  { id: '940559', result: '8' },
  { id: '940558', result: 'a' },
  { id: '940557', result: 'd' },
  { id: '940556', result: 'e' },
  { id: '940555', result: 'f' },
  { id: '940554', result: '3' },
  { id: '940553', result: 'b' },
  { id: '940552', result: 'b' },
  { id: '940551', result: '4' },
  { id: '940550', result: '9' },
  { id: '940549', result: '0' },
  { id: '940548', result: 'a' },
  { id: '940547', result: 'b' },
  { id: '940546', result: 'c' },
  { id: '940545', result: '4' },
  { id: '940544', result: '1' },
]

const loadRealGames = (): Game[] => {
  return realGameData.map((item, index) => ({
    game_id: item.id,
    block_height: 385729100 + index,
    result: item.result,
    game_type: index % 3 === 0 ? 'tournament' : 'classic',
    created_at: new Date(Date.now() - index * 60000).toISOString()
  }))
}

export const useGameStore = defineStore('game', () => {
  // State
  const games = ref<Game[]>([])
  const strategies = ref<Strategy[]>([])
  const updateRecords = ref<UpdateRecord[]>([])
  const loading = ref(false)

  // Getters
  const totalGames = computed(() => games.value.length)
  
  const charStats = computed(() => {
    const stats: Record<string, number> = {}
    const chars = '0123456789abcdef'.split('')
    chars.forEach(c => stats[c] = 0)
    
    games.value.forEach(game => {
      if (game.result) {
        stats[game.result] = (stats[game.result] || 0) + 1
      }
    })
    
    return stats
  })

  const getCharStatsByRange = (range: number) => {
    const stats: Record<string, number> = {}
    const chars = '0123456789abcdef'.split('')
    chars.forEach(c => stats[c] = 0)
    
    const recentGames = games.value.slice(0, range)
    recentGames.forEach(game => {
      if (game.result) {
        stats[game.result] = (stats[game.result] || 0) + 1
      }
    })
    
    return stats
  }

  // Actions
  const loadGames = () => {
    const saved = localStorage.getItem('hashgame_games')
    if (saved) {
      games.value = JSON.parse(saved)
    } else {
      // 首次加载使用真实数据
      games.value = loadRealGames()
      saveGames()
    }
  }

  const saveGames = () => {
    localStorage.setItem('hashgame_games', JSON.stringify(games.value))
  }

  const addGame = (game: Game) => {
    games.value.unshift(game)
    saveGames()
  }

  const loadStrategies = () => {
    const saved = localStorage.getItem('hashgame_strategies')
    if (saved) {
      strategies.value = JSON.parse(saved)
    }
  }

  const saveStrategies = () => {
    localStorage.setItem('hashgame_strategies', JSON.stringify(strategies.value))
  }

  const loadUpdateRecords = () => {
    const saved = localStorage.getItem('hashgame_update_records')
    if (saved) {
      updateRecords.value = JSON.parse(saved)
    }
  }

  const saveUpdateRecords = () => {
    localStorage.setItem('hashgame_update_records', JSON.stringify(updateRecords.value))
  }

  const addUpdateRecord = (record: UpdateRecord) => {
    updateRecords.value.unshift(record)
    saveUpdateRecords()
  }

  const addStrategy = (strategy: Strategy) => {
    strategies.value.unshift(strategy)
    saveStrategies()
  }

  const updateStrategy = (id: string, updates: Partial<Strategy>) => {
    const index = strategies.value.findIndex(s => s.id === id)
    if (index > -1) {
      strategies.value[index] = { ...strategies.value[index], ...updates }
      saveStrategies()
    }
  }

  return {
    games,
    strategies,
    updateRecords,
    loading,
    totalGames,
    charStats,
    getCharStatsByRange,
    loadGames,
    saveGames,
    addGame,
    loadStrategies,
    addStrategy,
    updateStrategy,
    loadUpdateRecords,
    addUpdateRecord
  }
})
