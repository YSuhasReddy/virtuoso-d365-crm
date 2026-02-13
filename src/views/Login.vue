<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-branding">
        <div class="login-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="4" fill="#0078D4"/>
            <path d="M7 7h6v6H7V7zm8 0h6v6h-6V7zm-8 8h6v6H7v-6zm8 0h6v6h-6v-6z" fill="white" opacity="0.9"/>
          </svg>
          <span class="login-logo-text">Virtuoso D365 CRM</span>
        </div>
        <h1 class="login-title">Sign in</h1>
        <p class="login-subtitle">Use your organizational account</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input
            id="email"
            type="email"
            class="form-input"
            v-model="email"
            placeholder="name@organization.com"
            required
            autocomplete="username"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input
            id="password"
            type="password"
            class="form-input"
            v-model="password"
            placeholder="Enter your password"
            required
            autocomplete="current-password"
            :disabled="loading"
          />
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading" class="login-spinner"></span>
          <span v-else>Sign in</span>
        </button>
      </form>

      <div class="login-footer">
        <span class="login-footer-text">Dynamics 365 Sales</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true

      // Brief delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300))

      const res = await this.$store.dispatch('auth/login', {
        email: this.email,
        password: this.password
      })

      this.loading = false
      if (res.success) {
        this.$store.dispatch('ui/showSuccess', {
          title: 'Welcome back!',
          message: 'Signed in as ' + res.user.name
        })
        this.$router.push('/dashboard').catch(function() {})
      } else {
        this.$store.dispatch('ui/showError', {
          title: 'Sign in failed',
          message: res.error
        })
      }
    }
  },
  created() {
    // Router guard already handles redirect if authenticated, no duplicate navigation needed
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #001B3D 0%, #002050 30%, #003380 100%);
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

.login-card {
  width: 400px;
  max-width: 90vw;
  background: white;
  border-radius: 4px;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.login-branding {
  padding: 32px 32px 0;
}

.login-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.login-logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #323130;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #323130;
  margin: 0 0 4px;
}

.login-subtitle {
  font-size: 13px;
  color: #605E5C;
  margin: 0;
}

.login-form {
  padding: 24px 32px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #323130;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  font-family: inherit;
  color: #323130;
  background: white;
  border: 1px solid #8A8886;
  border-radius: 2px;
  outline: none;
  transition: border-color 0.1s;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: #0078D4;
  box-shadow: 0 0 0 1px #0078D4;
}
.form-input:disabled {
  background: #F3F2F1;
  color: #A19F9D;
}

.login-btn {
  width: 100%;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  color: white;
  background: #0078D4;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}
.login-btn:hover:not(:disabled) {
  background: #006CBE;
}
.login-btn:active:not(:disabled) {
  background: #005A9E;
}
.login-btn:disabled {
  background: #C8C6C4;
  cursor: not-allowed;
}

.login-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  padding: 16px 32px;
  background: #F3F2F1;
  border-top: 1px solid #EDEBE9;
  text-align: center;
}

.login-footer-text {
  font-size: 12px;
  color: #605E5C;
}
</style>
