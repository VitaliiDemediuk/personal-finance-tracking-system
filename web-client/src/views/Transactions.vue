<template>
    <v-container style="padding-top: 40px;">
      <v-row no-gutters>
        
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>

        <v-col align-self="end">
          <CreateOrEditTransaction @transaction-changed="fetchTransactions" />
        </v-col>
      </v-row>
  
      <v-row no-gutters>
        <v-data-table :items="items">
          <template v-slot:item="row">
            <tr>
              <td>{{ row.item.id }}</td>
              <td>{{ row.item.date }}</td>
              <td>{{ row.item.description }}</td>
              <td>{{ row.item.type }}</td>
              <td>{{ row.item.amount }}</td>
              <td>{{ row.item["Category name"] }}</td>
              <td>
                <CreateOrEditTransaction :editingTransaction="row.item" @transaction-changed="fetchTransactions" />
              </td>
              <td>
                <v-btn variant="outlined" @click="deleteTransaction(row.item.id)">
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
  import { getUri } from '../utils/utils';
  import CreateOrEditTransaction from '../components/CreateOrEditTransaction.vue';
  import { useAuth0 } from '@auth0/auth0-vue';
  
  const { getAccessTokenSilently } = useAuth0();
  const items = ref([]);
  
  const fetchTransactions = async () => {
    try {
      const fetchCategories = async () => {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };
        const response = await fetch(getUri('/category/all'), { headers });

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        return await response.json();
      };

      const categories = await fetchCategories();

      const token = await getAccessTokenSilently();
      const headers = { Authorization: `Bearer ${token}` };
      const response = await fetch(getUri('/transaction/all'), { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      let transactions = await response.json();

      items.value = transactions.map(transaction => {
        const category = categories.find(category => category.id === transaction.categoryId);
        const categoryName = category ? category.name : 'Unknown';
        const { categoryId, ...transactionWithoutCategoryId } = transaction;
        return { ...transactionWithoutCategoryId, "Category name": categoryName };
      });
    } catch (error) {
      console.error('There was an error fetching the transactions:', error);
    }
  };
  
  const deleteTransaction = async (transactionId) => {
    try {
      const token = await getAccessTokenSilently();
      const headers = { Authorization: `Bearer ${token}` };
      const response = await fetch(getUri(`/transaction/${transactionId}`), {
        method: 'DELETE',
        headers,
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
  
      fetchTransactions(); // Optionally refresh the list of transactions
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };
  
  onMounted(() => {
    fetchTransactions();
  });
  </script>
  