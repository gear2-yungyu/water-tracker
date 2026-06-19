import { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import danceCat from './dance-cat.json'
import Login from './Login.jsx'

const COINS_PER_CUP = 10

const SHOP_LEVELS = [
  { name: '길거리 좌판', upgradeCost: 50, awningColor: '#B0BEC5' },
  { name: '작은 가게', upgradeCost: 150, awningColor: '#81C784' },
  { name: '편의점', upgradeCost: 400, awningColor: '#64B5F6' },
  { name: '백화점', upgradeCost: null, awningColor: '#BA68C8' },
]

const API = '/api/state'

function getCatMood(percent) {
  if (percent >= 100) return '목표 달성! 최고예요! 😸'
  if (percent >= 50) return '잘하고 있어요! 😺'
  if (percent > 0) return '좋은 시작이에요! 🐱'
  return '물 마실 시간이에요~ 😿'
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [cups, setCups] = useState(0)
  const [coins, setCoins] = useState(0)
  const [shopLevel, setShopLevel] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const cupSize = 250
  const goal = 2000
  const totalMl = cups * cupSize
  const percent = Math.min((totalMl / goal) * 100, 100)
  const shop = SHOP_LEVELS[shopLevel]

  const isMaxLevel = shop.upgradeCost === null
  const canUpgrade = !isMaxLevel && coins >= shop.upgradeCost
  const awningWidth = 130 + shopLevel * 40

  const waterTop = 36
  const waterBottom = 170
  const waterY = waterBottom - (percent / 100) * (waterBottom - waterTop)
  const wave1 = `M0 ${waterY} q10 -8 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V200 H0 Z`
  const wave2 = `M0 ${waterY + 3} q10 -7 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V200 H0 Z`

  useEffect(() => {
    if (!user) return
    fetch(`${API}?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCups(data.cups)
        setCoins(data.coins)
        setShopLevel(data.shopLevel)
        setLoaded(true)
      })
  }, [user])

  useEffect(() => {
    if (!loaded || !user) return
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, cups, coins, shopLevel }),
    })
  }, [cups, coins, shopLevel, loaded, user])

  function handleAuth(loggedInUser) {
    setUser(loggedInUser)
    localStorage.setItem('user', JSON.stringify(loggedInUser))
  }

  function logout() {
    setUser(null)
    setLoaded(false)
    localStorage.removeItem('user')
  }

  function addCup() {
    setCups(cups + 1)
    setCoins(coins + COINS_PER_CUP)
  }

  function removeCup() {
    if (cups > 0) {
      setCups(cups - 1)
    }
  }

  function resetWater() {
    setCups(0)
  }

  function resetShop() {
    setShopLevel(0)
    setCoins(0)
  }

  function upgradeShop() {
    if (canUpgrade) {
      setCoins(coins - shop.upgradeCost)
      setShopLevel(shopLevel + 1)
    }
  }

  if (!user) {
    return <Login onAuth={handleAuth} />
  }

  return (
    <div className="app">
      <div className="topbar">
        <span>👤 {user.username} 님</span>
        <button className="logout" onClick={logout}>로그아웃</button>
      </div>

      <h1>
        <img src="/cat-logo.svg" className="logo" alt="고양이 로고" />
        고양이 물가게
      </h1>
      <div className="coin-badge">💰 {coins} 코인</div>

      <div className="awning" style={{ backgroundColor: shop.awningColor, width: awningWidth }}></div>

      <div className="scene-row">
        <Lottie animationData={danceCat} className="cat-anim" loop={true} />
        <svg className="glass" viewBox="0 0 120 200">
          <defs>
            <clipPath id="glassInside">
              <path d="M28 30 L92 30 L85 173 Q60 184 35 173 Z" />
            </clipPath>
          </defs>
          <path d="M24 24 L96 24 L88 178 Q60 192 32 178 Z" fill="#EAF4FB" />
          <g clipPath="url(#glassInside)">
            <g className="waterbob">
              <rect x="0" y={waterY} width="120" height={200 - waterY} fill="#4FB0E8" />
              <path className="wave2" d={wave2} fill="#6FC1EF" />
              <path className="wave1" d={wave1} fill="#4FB0E8" />
              <circle className="bubble" cx="55" cy="160" r="3" fill="#CDEBFB" />
              <circle className="bubble bubble-b2" cx="70" cy="155" r="2.5" fill="#CDEBFB" />
            </g>
          </g>
          <path d="M24 24 L96 24 L88 178 Q60 192 32 178 Z" fill="none" stroke="#9CC4E4" strokeWidth="4" strokeLinejoin="round" />
          <path d="M33 34 L38 165" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>

      <p className="shop-name">Lv.{shopLevel + 1} · {shop.name} {'⭐'.repeat(shopLevel + 1)}</p>
      <p className="message">{getCatMood(percent)}</p>
      <p>오늘 마신 물: {totalMl} / {goal} ml</p>
      <p className="cups-label">({cups}잔 · 한 잔 {cupSize}ml)</p>

      <div className="buttons">
        <button onClick={removeCup}>-1잔</button>
        <button onClick={addCup}>물 한 잔 +{cupSize}ml</button>
      </div>

      <button className="upgrade" onClick={upgradeShop} disabled={!canUpgrade}>
        {isMaxLevel ? '🏆 최고 레벨 달성!' : `🏪 매장 업그레이드 (💰 ${shop.upgradeCost})`}
      </button>

      <div className="reset-buttons">
        <button className="reset" onClick={resetWater}>💧 물 초기화</button>
        <button className="reset" onClick={resetShop}>🏪 매장 초기화</button>
      </div>
    </div>
  )
}

export default App