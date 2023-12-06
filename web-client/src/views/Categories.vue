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
              <td>{{row.item.id}}</td>
              <td>{{row.item.name}}</td>
              <td>{{row.item.description}}</td>
              <td>{{row.item.type}}</td>
              <td>
                <EditNewCategory :category=row.item />
              </td>
              <td>
                <v-btn variant="outlined" @click="deleteCategory(row.item.id)">
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
  import { onMounted, ref } from 'vue';
  import { getUri } from '../utils/utils'; // Adjust the path as necessary
  import CreateNewCategory from '../components/CreateNewCategory.vue';
  import EditNewCategory from '../components/EditCategory.vue';
  import { useAuth0 } from '@auth0/auth0-vue';

  const { getAccessTokenSilently } = useAuth0();

  const items = ref([]);

  const fetchCategories = async () => {
    try {
      const token = await getAccessTokenSilently();
      const headers = {Authorization: `Bearer ${token}`};
      const response = await fetch(getUri('/category/all'), { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      items.value = await response.json();
    } catch (error) {
      console.error('There was an error fetching the categories:', error);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      const token = await getAccessTokenSilently();
      const headers = {Authorization: `Bearer ${token}`};
      const response = await fetch(getUri(`/category/${categoryId}`), {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      // Optionally refresh the list of categories
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  onMounted(() => {
    fetchCategories();
  });
</script>  