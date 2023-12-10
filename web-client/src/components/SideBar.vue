<template>
    <v-navigation-drawer
        expand-on-hover
        rail
      >
        <v-list>
          <v-list-item
            :prepend-avatar="user.picture"
            :title="user.name"
            :subtitle="user.email"
          ></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-home-circle-outline" title="Home" value="home" to="/home"></v-list-item>
          <v-list-item prepend-icon="mdi-shape" title="Categories" value="categories" to="/categories"></v-list-item>
          <v-list-item prepend-icon="mdi-list-box-outline" title="Transactions" value="transactions" to="/transactions"></v-list-item>
          <v-list-item prepend-icon="mdi-chart-box-outline" title="Reports" value="starred" to="/reports"></v-list-item>
        </v-list>
      </v-navigation-drawer>
</template>

<script>
import { useAuth0 } from '@auth0/auth0-vue';

export default {
  name: "SideBar",
  setup() {
    const auth0 = useAuth0()
    
    return {
      user: auth0.user,
    }
  }
};
</script>