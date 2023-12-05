<template>
    <v-container style="padding-top: 40px;">
      
      <v-row no-gutters>

        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>

        <v-col align-self="end">
          <CreateNewCategory />
        </v-col>
        
      </v-row>
      

      <v-row no-gutters>

        <v-data-table :items="items">
          <template v-slot:item="row">
            <tr>
              <td>{{row.item.name}}</td>
              <td>{{row.item.description}}</td>
              <td>
                <EditNewCategory :category=row.item />
              </td>
              <td>
                <v-btn variant="outlined" v-bind="props">
                  <v-icon dark>mdi-delete-circle-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>

      </v-row>
    </v-container>
</template>
  
<script setup>
import CreateNewCategory from '../components/CreateNewCategory.vue'
import EditNewCategory from '../components/EditCategory.vue'

const items = [
    {
      name: 'Розваги',
      description: 'Розваги Розваги Розваги Розваги Розваги Розваги',
    },
    {
      name: 'Розваги',
      description: 'Розваги Розваги Розваги Розваги Розваги Розваги',
    },
    {
      name: 'Розваги',
      description: 'Розваги Розваги Розваги Розваги Розваги Розваги',
    }
    // ... more items
  ]
</script>
  