<template>
  <v-app>
    
    <AppBar />
    
    <SideBar />

    <v-main class="d-flex align-center justify-center">
      <router-view />
    </v-main> 
  </v-app>
</template>

<script setup>
  import SideBar from './layouts/SideBar.vue'
  import AppBar from './layouts/AppBar.vue'
</script>
