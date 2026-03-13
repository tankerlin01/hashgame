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

export const useGameStore = defineStore('game', () => {
  // State
  const games = ref<Game[]>([])
  const strategies = ref<Strategy[]>([])
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
    loading,
    totalGames,
    charStats,
    getCharStatsByRange,
    loadGames,
    saveGames,
    addGame,
    loadStrategies,
    addStrategy,
    updateStrategy
  }
})
