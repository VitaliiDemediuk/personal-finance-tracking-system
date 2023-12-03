// Components
import App from './App.vue'

import { createAuth0 } from '@auth0/auth0-vue';
import { createRouter } from "./router";
import { createApp } from 'vue'
import vuetify from './plugins/vuetify'

import authConfig from "../auth_config.json";

const app = createApp(App)

app
  .use(createRouter(app))
  .use(vuetify)
  .use(
    createAuth0({
      domain: authConfig.domain,
      clientId: authConfig.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: "pfts_main_back_end"
      }      
    })
  )
  .mount("#app");