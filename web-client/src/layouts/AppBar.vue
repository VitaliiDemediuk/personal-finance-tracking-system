<template>
    <v-app-bar>

        <template v-slot:prepend>
          <v-icon icon="mdi-finance"></v-icon>
        </template>

        <v-app-bar-title>Personal finance tracking system</v-app-bar-title>

        <template v-slot:append>
        <div v-if="isAuthenticated.value">
            <v-btn @click="logout" icon="mdi-logout"></v-btn>
        </div>
        <div v-else>
            <v-btn @click="login" >Log in</v-btn>
            <v-btn @click="sighup">Sign up</v-btn>            
        </div>
        </template>
        
    </v-app-bar>
</template>

<script>
  import { useAuth0 } from '@auth0/auth0-vue';

  export default {
    setup() {
      const { loginWithPopup, user, isAuthenticated, logout } = useAuth0();

      return {
        login: () => {
            loginWithPopup();
        },
        sighup: () => {
            loginWithPopup({ screen_hint: 'signup' });
        },
        logout: () => {
          logout({ logoutParams: { returnTo: window.location.origin } });
        },
        user,
        isAuthenticated
      };
    }
  };
</script>