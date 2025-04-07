<script setup></script>

<template>
  <div class="NavigationBar">
    <nav>
      <v-navigation-drawer class="bg-deep-purple" theme="dark" :width="280" permanent>
        <v-list color="transparent">
          <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard"></v-list-item>
          <v-list-item prepend-icon="mdi-account-box" title="Clients"></v-list-item>
          <v-list-item prepend-icon="mdi-account-box" title="Terminals"></v-list-item>
          <v-list-item prepend-icon="mdi-account-box" title="Subscriptions"></v-list-item>
          <v-list-item prepend-icon="mdi-account-box" title="Payments"></v-list-item>
          <v-list-item prepend-icon="mdi-gavel" title="Settings"></v-list-item>
        </v-list>

        <template v-slot:append>
          <div class="pa-2">
            <v-btn block> Logout </v-btn>
          </div>
        </template>
      </v-navigation-drawer>
      <v-app-bar :elevation="1">
        <template v-slot:prepend>
          <v-app-bar-nav-icon size="x-large"></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title>Terminal Control</v-app-bar-title>
      </v-app-bar>
    </nav>
    <router-view />
  </div>
</template>
