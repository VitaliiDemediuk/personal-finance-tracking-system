<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent width="512">
      <template v-slot:activator="{ props }">
        <v-btn variant="outlined" v-bind="props">
          Create new category
        </v-btn>
      </template>

      <v-card>
        <v-card-title style="margin-top: 10px; margin-left: 10px;">
          <span class="text-h5">New category</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="categoryName"
                  variant="outlined"
                  label="Name*"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="categoryDescription"
                  variant="outlined"
                  label="Description"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  v-model="categoryType"
                  :items="categoryTypes"
                  label="Type"
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="dialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="addCategory"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { ref } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { getUri } from '../utils/utils';

export default {
  setup() {
    const dialog = ref(false);
    const categoryName = ref('');
    const categoryDescription = ref('');
    const categoryType = ref(null);
    const categoryTypes = ref(['expense', 'income']); // Adjust as per your requirements
    const { getAccessTokenSilently } = useAuth0();

    const addCategory = async () => {
      if (!categoryName.value) {
        alert('Please enter a category name');
        return;
      }

      try {
        const token = await getAccessTokenSilently();
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        };

        const newCategory = {
          name: categoryName.value,
          description: categoryDescription.value,
          type: categoryType.value,
        };

        const response = await fetch(getUri('/category'), {
          method: 'POST',
          headers,
          body: JSON.stringify(newCategory),
        });

        if (!response.ok) {
          throw new Error('Failed to add category');
        }

        // Handle response here, e.g., refresh category list, show success message
        console.log('Category added successfully');
        location.reload();
        dialog.value = false;
        resetFields();
      } catch (error) {
        console.error('Error adding category:', error);
        // Handle error here, e.g., show error message to user
      }
    };

    const resetFields = () => {
      categoryName.value = '';
      categoryDescription.value = '';
      categoryType.value = null;
    };

    return {
      dialog,
      categoryName,
      categoryDescription,
      categoryType,
      categoryTypes,
      addCategory,
    };
  },
}
</script>