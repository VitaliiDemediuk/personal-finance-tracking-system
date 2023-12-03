<template>
  <v-app-bar>

      <template v-slot:prepend>
        <v-icon icon="mdi-finance"></v-icon>
      </template>

      <v-app-bar-title>Personal finance tracking system</v-app-bar-title>

      <template v-slot:append>
      <div v-if="isAuthenticated || isLoading">
          <v-btn @click="logout" icon="mdi-logout"></v-btn>
      </div>
      <div v-else>
          <v-btn @click="login" >Log in</v-btn>
          <v-btn>Sign up</v-btn>            
      </div>
      </template>
      
  </v-app-bar>
</template>

<script>
import { useAuth0 } from '@auth0/auth0-vue';

export default {
  name: "AppBar",
  setup() {
    const auth0 = useAuth0();
    
    return {
      isAuthenticated: auth0.isAuthenticated,
      isLoading: auth0.isLoading,
      login() {
        auth0.loginWithRedirect();
      },
      logout() {
        auth0.logout({
          logoutParams: {
            returnTo: window.location.origin
          }
        });
      }
    }
  }
};
</script>