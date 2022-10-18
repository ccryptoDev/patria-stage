<template>
  <div id="app">
    <!-- <admin-add-application /> -->
    <admin-add-loan :user="{ firstName: 'John', lastName: 'Doe', id: '603571cdebadb1ea001243d9' }" />
  </div>
</template>

<script>
// import AdminAddApplication from "./applications/AdminAddApplication/index.vue";
import AdminAddLoan from "./applications/AdminAddLoan/index.vue";
export default {
  name: "App",
  components: {
    // AdminAddApplication,
    AdminAddLoan
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
