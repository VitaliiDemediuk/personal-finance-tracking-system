/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import { createAuth0 } from '@auth0/auth0-vue';

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

const app = createApp(App)

registerPlugins(app)

app.use(
  createAuth0({
    domain: "dev-sc26458w7gubcp3e.us.auth0.com",
    clientId: "lNkZC1gQOvrcS5JAqRP5jEWdwqjZ3wPU",
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  })
);

app.mount('#app')
