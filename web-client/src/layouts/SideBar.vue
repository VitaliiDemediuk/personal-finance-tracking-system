<template>
    <v-navigation-drawer
        expand-on-hover
        rail
      >
        <v-list>
          <v-list-item
            prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
            title="Sandra Adams"
            subtitle="sandra_a88@gmailcom"
          ></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-home-circle-outline" title="Home" value="home"></v-list-item>
          <v-list-item prepend-icon="mdi-shape" title="Categories" value="categories"></v-list-item>
          <v-list-item prepend-icon="mdi-list-box-outline" title="Transactions" value="transactions"></v-list-item>
          <v-list-item prepend-icon="mdi-chart-box-outline" title="Reports" value="starred"></v-list-item>
        </v-list>
      </v-navigation-drawer>
</template>