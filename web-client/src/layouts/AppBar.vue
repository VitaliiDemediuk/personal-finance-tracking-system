<template>
    <v-app-bar>

        <template v-slot:prepend>
          <v-icon icon="mdi-finance"></v-icon>
        </template>

        <v-app-bar-title>Personal finance tracking system</v-app-bar-title>

        <template v-slot:append>
            <v-btn icon="mdi-logout"></v-btn>
        </template>
        
    </v-app-bar>
</template>