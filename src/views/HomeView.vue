<script>
const gradients = [
  ['#222'],
  ['#42b3f4'],
  ['red', 'orange', 'yellow'],
  ['purple', 'violet'],
  ['#00c6ff', '#F0F', '#FF0'],
  ['#f72047', '#ffd200', '#1feaea'],
]

export default {
  data: () => ({
    width: 2,
    radius: 10,
    padding: 8,
    lineCap: 'round',
    gradient: gradients[5],
    value: [0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 2, 9, 0],
    gradientDirection: 'top',
    gradients,
    fill: false,
    type: 'trend',
    autoLineWidth: false,
  }),
}
</script>

<template>
  <div class="Home">
    <v-row>
      <v-col cols="8">
        <v-card rounded="xl" height="400">
          <v-card-title><span>Client Subscription Growth (Monthly)</span></v-card-title>
          <v-card-text>
            <v-sparkline
              :auto-line-width="autoLineWidth"
              :fill="fill"
              :gradient="gradient"
              :gradient-direction="gradientDirection"
              :line-width="width"
              :model-value="value"
              :padding="padding"
              :smooth="radius || false"
              :stroke-linecap="lineCap"
              :type="type"
              auto-draw
            ></v-sparkline>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card rounded="xl" height="400" color="#00A1FF" variant="tonal"> </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-card color="#FFE4EC" rounded="xl" height="220">
          <v-card-title class="d-flex justify-space-between py-8">
            <div>
              <v-avatar color="#ff6692" size="50" rounded="xl" icon="mdi-account-multiple">
              </v-avatar>
              <span class="ml-3">All Clients</span>
            </div>
            <v-icon class="mt-2" icon="mdi-dots-vertical"></v-icon>
          </v-card-title>
          <v-card-text class="d-flex justify-space-between">
            <div>
              <span class="text-h6 text-md-h5 text-lg-h4">4,000</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card color="#E7E2F3" rounded="xl" height="220"> </v-card>
      </v-col>
      <v-col cols="4">
        <v-card color="#D2F9F4" rounded="xl" height="220"> </v-card>
      </v-col>
    </v-row>
  </div>
</template>
