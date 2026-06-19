import { useState } from 'react'

const API_BASE = '/api'

function Login({ onAuth }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(mode) {
    setError('')
    const res = await fetch(`${API_BASE}/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
      return
    }
    onAuth(data)
  }

  return (
    <div className="app">
      <h1>
        <img src="/cat-logo.svg" className="logo" alt="고양이 로고" />
        고양이 물가게
      </h1>
      <p className="message">로그인하고 내 가게를 시작하세요!</p>

      <input
        className="auth-input"
        placeholder="아이디"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="auth-input"
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="auth-error">{error}</p>}

      <div className="buttons">
        <button onClick={() => submit('login')}>로그인</button>
        <button onClick={() => submit('signup')}>회원가입</button>
      </div>
    </div>
  )
}

export default Login