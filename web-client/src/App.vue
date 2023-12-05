<template>
    <v-app>
      
    <AppBar />
    <div v-if="isAuthenticated || isLoading">
      <SideBar />

      <v-main class="d-flex align-center justify-center">
        <div>{{ recData }}</div>
        <router-view />
      </v-main>
      </div>
    <div v-else>
      <v-main class="d-flex align-center justify-center">
        <div class="text-center">
          <h1 class="display-1">Welcome to the Personal Finance Tracking System</h1>
          <p class="subheading">Please log in to continue</p>
        </div>
      </v-main>
    </div>
  </v-app>
</template>

<script setup>
  import SideBar from './components/SideBar.vue'
  import AppBar from './components/AppBar.vue'
  import { useFetch } from '@vueuse/core'
  import { ref } from 'vue'

  import { useAuth0 } from '@auth0/auth0-vue';
  const auth0 = useAuth0();

  const isAuthenticated = auth0.isAuthenticated
  const isLoading = auth0.isLoading
</script>