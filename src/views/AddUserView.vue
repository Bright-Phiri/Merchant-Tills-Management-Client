<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { showToast } from '@/utils/utils'
import { useErrorHandler } from '@/composables/useErrorHandler'

const router = useRouter()
const { handleError } = useErrorHandler()
const loading = ref(false)
const user = ref(emptyUser())
const roles = [
  { value: 'Officer', title: 'Officer', description: 'Day-to-day access based on assigned permissions.' },
  { value: 'Admin', title: 'Administrator', description: 'Full management access. Assign this role carefully.' },
]
const selectedRole = computed(() => roles.find((role) => role.value === user.value.role))
function emptyUser() {
  return { first_name: '', last_name: '', user_name: '', role: 'Officer', email_address: '', phone_number: '' }
}
async function addUser() {
  if (Object.values(user.value).some((value) => !String(value).trim())) {
    showToast('Please complete every required field.', 'warning')
    return
  }
  loading.value = true
  try {
    const response = await api.post('users', user.value)
    showToast(response.data.message || 'Staff account created.', 'success')
    await router.push('/users')
  } catch (error) {
    handleError(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="staff-create-page">
    <header>
      <button class="back-link" type="button" @click="router.push('/users')"><v-icon icon="mdi-arrow-left" size="18" /> Staff accounts</button>
      <div class="header-copy">
        <div><p>TEAM ACCESS</p><h1>Create staff account</h1><span>Add a team member and choose the right level of access.</span></div>
        <div class="secure-badge"><v-icon icon="mdi-shield-check-outline" size="18" /> Secure onboarding</div>
      </div>
    </header>
    <form class="staff-create-layout" @submit.prevent="addUser">
      <section class="staff-form-card">
        <div class="section-heading">
          <span class="section-icon"><v-icon icon="mdi-account-plus-outline" size="21" /></span>
          <div><h2>Account details</h2><p>All fields are required.</p></div>
        </div>
        <div class="field-grid">
          <div class="field-group"><label for="first-name">First name</label><input id="first-name" v-model.trim="user.first_name" autocomplete="given-name" placeholder="e.g. Grace" required /></div>
          <div class="field-group"><label for="last-name">Last name</label><input id="last-name" v-model.trim="user.last_name" autocomplete="family-name" placeholder="e.g. Banda" required /></div>
          <div class="field-group"><label for="username">Username</label><input id="username" v-model.trim="user.user_name" autocomplete="off" placeholder="e.g. grace.banda" required /><small>Used to sign in to the management portal.</small></div>
          <div class="field-group"><label for="role">Role</label><select id="role" v-model="user.role" required><option v-for="role in roles" :key="role.value" :value="role.value">{{ role.title }}</option></select><small>{{ selectedRole?.description }}</small></div>
          <div class="field-group"><label for="email">Email address</label><input id="email" v-model.trim="user.email_address" type="email" autocomplete="email" placeholder="name@company.com" required /></div>
          <div class="field-group"><label for="phone">Phone number</label><input id="phone" v-model.trim="user.phone_number" type="tel" autocomplete="tel" placeholder="e.g. +265 999 000 000" required /></div>
        </div>
        <div class="form-actions">
          <button class="secondary-action" type="button" @click="router.push('/users')">Cancel</button>
          <button class="primary-action" type="submit" :disabled="loading" :aria-busy="loading"><v-icon :icon="loading ? 'mdi-loading' : 'mdi-account-check-outline'" :class="{ spinning: loading }" size="18" />{{ loading ? 'Creating account…' : 'Create staff account' }}</button>
        </div>
      </section>
    </form>
  </div>
</template>

<style scoped>
.staff-create-page{width:100%;margin:0 auto;padding:6px 4px 40px;color:#172d35;font-family:'Segoe UI',Arial,sans-serif}.back-link{display:flex;align-items:center;gap:7px;margin-bottom:21px;border:0;background:transparent;color:#52666a;cursor:pointer;font:inherit;font-size:12px;font-weight:650}.header-copy{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:30px}.header-copy p{margin:0 0 8px;color:#087e70;font-size:10px;font-weight:800;letter-spacing:1.7px}.header-copy h1{margin:0;font-size:clamp(30px,4vw,42px);font-weight:650;letter-spacing:-1.5px}.header-copy span{display:block;margin-top:6px;color:#66777b;font-size:13px}.secure-badge{display:flex;align-items:center;gap:7px;padding:9px 12px;border:1px solid #cde1d9;border-radius:999px;background:#f0f8f4;color:#087e70;font-size:11px;font-weight:700;white-space:nowrap}.staff-create-layout{display:block;width:100%}.staff-form-card{width:100%;box-sizing:border-box;border:1px solid #dce4e1;border-radius:16px;background:#fff}.staff-form-card{padding:28px}.section-heading{display:flex;align-items:center;gap:12px;padding-bottom:23px;border-bottom:1px solid #edf1ef}.section-icon{display:grid;width:42px;height:42px;place-items:center;border-radius:11px;background:#dceee8;color:#087e70}.section-heading h2{margin:0;font-size:18px;letter-spacing:-.3px}.section-heading p{margin:3px 0 0;color:#7a898b;font-size:11px}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:21px 18px;margin-top:25px}.field-group label{display:block;margin-bottom:7px;color:#40565b;font-size:11px;font-weight:700}.field-group input,.field-group select{width:100%;height:47px;padding:0 13px;border:1px solid #ccd7d3;border-radius:9px;outline:0;background:#fff;color:#172d35;font:inherit;font-size:13px;transition:.18s}.field-group input:focus,.field-group select:focus{border-color:#087e70;box-shadow:0 0 0 3px #dceee8}.field-group input::placeholder{color:#a0abaa}.field-group small{display:block;min-height:15px;margin-top:6px;color:#859294;font-size:9.5px;line-height:1.45}.form-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:29px;padding-top:22px;border-top:1px solid #edf1ef}.form-actions button{height:43px;padding:0 18px;border-radius:9px;cursor:pointer;font:inherit;font-size:12px;font-weight:700}.secondary-action{border:1px solid #ccd7d3;background:#fff;color:#52666a}.primary-action{display:flex;align-items:center;gap:8px;border:0;background:#087e70;color:#fff}.primary-action:hover:not(:disabled){background:#056859}.primary-action:disabled{cursor:wait;opacity:.65}.spinning{animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:620px){.header-copy{align-items:start;flex-direction:column}.field-grid{grid-template-columns:1fr}.staff-form-card{padding:21px 17px}.form-actions{flex-direction:column-reverse}.form-actions button{justify-content:center;width:100%}}
</style>
