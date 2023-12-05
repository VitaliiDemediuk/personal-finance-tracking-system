  <template>
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent width="512" >
        <template v-slot:activator="{ props }">

          <v-btn variant="outlined" v-bind="props">
            <v-icon dark>mdi-text-box-edit-outline</v-icon>
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
                    label="Name*"
                    variant="outlined"
                    required
                  >{{ category.name }}</v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    label="Description"
                    variant="outlined"
                  >{{ category.description}}</v-text-field>
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
              @click="dialog = false"
            >
              Edit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </template>

<script>
export default {
  props: ['category'],
  data: () => ({
    dialog: false,
  }),
}
</script>