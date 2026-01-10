'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Ошибка авторизации')
        setIsLoading(false)
        return
      }

      // Успешный вход - перенаправляем на главную
      router.push('/')
      router.refresh()
    } catch (err) {
      setError('Произошла ошибка при подключении к серверу')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md">
        {/* Карточка входа */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
              <LogIn size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Карта с метками
            </h1>
            <p className="text-gray-600">
              Войдите для доступа к своим меткам
            </p>
          </div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Логин */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Логин
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Введите логин"
                disabled={isLoading}
              />
            </div>

            {/* Пароль */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="Введите пароль"
                disabled={isLoading}
              />
            </div>

            {/* Ошибка */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Кнопка входа */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Вход...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Войти</span>
                </>
              )}
            </button>
          </form>

          {/* Подсказка */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Тестовый аккаунт:</strong>
              <br />
              Логин: <code className="bg-blue-100 px-1 rounded">admin</code>
              <br />
              Пароль: <code className="bg-blue-100 px-1 rounded">qwerty</code>
            </p>
          </div>
        </div>

        {/* Футер */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>© 2026 Карта с метками. Все права защищены.</p>
        </div>
      </div>
    </div>
  )
}

