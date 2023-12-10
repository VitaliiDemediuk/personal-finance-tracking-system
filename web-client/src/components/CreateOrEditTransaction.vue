<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" persistent width="600">
      <template v-slot:activator="{ props }">
        <v-btn variant="outlined" v-bind="props">
          {{ isEditMode ? 'Edit Transaction' : 'Create Transaction' }}
        </v-btn>
      </template>

      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEditMode ? 'Edit Transaction' : 'New Transaction' }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="transactionAmount"
                  label="Amount"
                  type="number"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  v-model="transactionType"
                  :items="transactionTypes"
                  label="Type"
                  required
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  v-model="transactionCategory"
                  :items="categoriesList"
                  label="Category">
                </v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="transactionDescription"
                  label="Description"
                  type="text"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
          <v-btn color="blue darken-1" text @click="submitTransaction">{{ isEditMode ? 'Update' : 'Create' }}</v-btn>
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
    editingTransaction: Object,
  },
  setup(props) {
    const dialog = ref(false);
    const transactionAmount = ref(0);
    const transactionType = ref('');
    const transactionCategory = ref(null);
    const transactionDescription = ref('');
    const transactionTypes = ref(['expense', 'income']);
    const isEditMode = ref(false);
    let categories = [];
    const categoriesList = ref([]);
    const { getAccessTokenSilently } = useAuth0();

    const fetchCategories = async () => {
      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };
        const response = await fetch(getUri('/category/all'), { headers });

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const categories = await response.json();
        return categories;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories().then(res => {
      categories = res;
      categoriesList.value = categories.map(category => category.name);
    });

    watch(() => props.editingTransaction, (newVal) => {
      if (newVal) {
        transactionAmount.value = newVal.amount;
        transactionType.value = newVal.type;
        transactionCategory.value = newVal["Category name"] === 'Unknown' ? '' : newVal["Category name"];
        transactionDescription.value = newVal.description;
        isEditMode.value = true;
        // dialog.value = true;
      }
    }, { immediate: true });

    const submitTransaction = async () => {
      // Validation logic here
      const token = await getAccessTokenSilently();
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

      const category = categories.find(category => category.name === transactionCategory.value);
      const categoryId = category ? category.id : null;

      const transactionData = {
        amount: transactionAmount.value,
        type: transactionType.value,
        categoryId: categoryId,
        description: transactionDescription.value,
      };

      const url = isEditMode.value ? getUri(`/transaction/${props.editingTransaction.id}`) : getUri('/transaction');
      const method = isEditMode.value ? 'PUT' : 'POST';

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: JSON.stringify(transactionData),
        });

        if (!response.ok) {
          throw new Error('Failed to submit transaction');
        }

        location.reload();
        dialog.value = false;
      } catch (error) {
        console.error('Error submitting transaction:', error);
      }
    };

    return {
      dialog,
      transactionAmount,
      transactionType,
      transactionCategory,
      transactionDescription,
      transactionTypes,
      submitTransaction,
      isEditMode,
      categoriesList,
    };
  },
}
</script>
