<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent width="512">
      <template v-slot:activator="{ props }">
        <v-btn variant="outlined" v-bind="props">
          {{ isEditMode ? 'Edit category' : 'New category' }}
        </v-btn>
      </template>

      <v-card>
        <v-card-title style="margin-top: 10px; margin-left: 10px;">
          <span class="text-h5">{{ isEditMode ? 'Edit category' : 'New category' }}</span>
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
                  label="Type*"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="addOrUpdateCategory"
          >
            {{ isEditMode ? 'Update' : 'Add' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { ref, watch } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { getUri } from '../utils/utils';

export default {
  props: {
    editingCategory: Object, // The category to edit
  },
  setup(props) {
    const dialog = ref(false);
    const categoryName = ref('');
    const categoryDescription = ref('');
    const categoryType = ref(null);
    const categoryTypes = ref(['expense', 'income']);
    const isEditMode = ref(false);
    const { getAccessTokenSilently } = useAuth0();

    watch(() => props.editingCategory, (newVal) => {
      if (newVal) {
        categoryName.value = newVal.name;
        categoryDescription.value = newVal.description;
        categoryType.value = newVal.type;
        isEditMode.value = true;
        // dialog.value = true;
      }
    }, { immediate: true });

    const addOrUpdateCategory = async () => {
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

        const categoryData = {
          name: categoryName.value,
          description: categoryDescription.value,
          type: categoryType.value,
        };

        const url = isEditMode.value ? getUri(`/category/${props.editingCategory.id}`) : getUri('/category');
        const method = isEditMode.value ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers,
          body: JSON.stringify(categoryData),
        });

        if (!response.ok) {
          throw new Error('Failed to add category');
        }

        console.log('Category added/updated successfully');
        location.reload();
        dialog.value = false;
        resetFields();
      } catch (error) {
        console.error('Error adding/updating category:', error);
      }
    };

    const resetFields = () => {
      categoryName.value = '';
      categoryDescription.value = '';
      categoryType.value = null;
      isEditMode.value = false;
    };

    return {
      dialog,
      categoryName,
      categoryDescription,
      categoryType,
      categoryTypes,
      addOrUpdateCategory,
      isEditMode
    };
  },
}
</script>
