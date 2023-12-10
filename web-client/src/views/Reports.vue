<template>
    <v-container>
      <v-row>
        <v-col v-for="report in reports" :key="report.id" cols="12" md="6">
          <v-card>
            <v-card-title>{{ report.name }}</v-card-title>
            <v-card-text>
              <Responsive v-if="Array.isArray(report.data)">
                <template #main="{ width }">
                  <Chart
                    direction="circular"
                    :size="{ width, height: 400 }"
                    :data="report.data"
                    :config="{ controlHover: false }"
                  >
                    <template #layers>
                      <Pie :dataKeys="['name', 'value']" :pie-style="{ innerRadius: 100, padAngle: 0.05 }" />
                    </template>
                    <template #widgets>
                        <Tooltip
                            :config="{
                            name: { },
                            value: { },
                            }"
                            hideLine
                        />
                    </template>
                  </Chart>
                </template>
              </Responsive>
              <div v-else>{{report.data}}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { Chart, Responsive, Pie } from 'vue3-charts';
  import { useAuth0 } from '@auth0/auth0-vue';
  import { getUri } from '../utils/utils';
  
  const { getAccessTokenSilently } = useAuth0();
  const reports = ref([]);
  
  const fetchReports = async () => {
    try {
      const token = await getAccessTokenSilently();
      const headers = { Authorization: `Bearer ${token}` };
      const response = await fetch(getUri('/report/all'), { headers });
  
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
  
      const fetchedReports = await response.json();

      fetchedReports.data = [];
      await Promise.all(fetchedReports.map(async (report) => {
        const reportDataResponse = await fetch(getUri(`/report/build/${report.id}`), { headers })
        const reportDataJson = await reportDataResponse.json()
        report.data = Object.entries(reportDataJson).map(([name, data]) => ({
          name,
          value: data.totalAmount / 100  // Dividing totalAmount by 100
        }));
      }));
  
      reports.value = fetchedReports;
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };
  
  onMounted(fetchReports);
  </script>
  