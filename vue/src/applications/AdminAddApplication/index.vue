<template>
  <div>
    <div v-if="showSpinner" class="spinner-modal">
      <div class="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <!-- <button v-on:click="() => validFormData({})">Transition</button> -->
    <!-- <button v-on:click="testSpinner()">Test Spinner</button> -->
    <button class="btn btn-primary" @click="showModal = !showModal">
      Add Application
    </button>
    <modal :showModal="showModal">
      <application-form
        v-if="page === 1"
        :maximumRequestedLoanAmount="maximumrequestedloanamount"
        :minimumRequestedLoanAmount="minimumrequestedloanamount"
        v-on:loading="setSpinner"
        v-on:success="
          data => {
            applicationId = data.applicationId;
            page = 2;
          }
        "
        v-on:error="failureMessage"
        v-on:cancel="showModal = false"
      />
      <offers
        v-if="page === 2"
        :applicationId="applicationId"
        v-on:loading="setSpinner"
        v-on:success="successMessage"
        v-on:error="failureMessage"
      />
    </modal>
  </div>
</template>

<script>
import Vue from "vue";
import VueFormulate from "@braid/vue-formulate";
import swal from "sweetalert";
import axios from "axios";

import ApplicationForm from "./Form.vue";
import Offers from "../../components/Offers.vue";
import Modal from "../../components/Modal.vue";

import { toNormalWords, $format } from "../../utils";

Vue.use(VueFormulate, {
  classes: {
    input: "form-control form-application",
    error: "error",
    errors: "error"
  },
  locales: {
    en: {
      required: ({ name }) => `Please fill out the ${toNormalWords(name)} field.`,
      confirm: ({ name }) => `${toNormalWords(name)} field doesn't match.`
      // min: ({ name, args }) => `${toNormalWords(name)} has to be at least ${args[0]} characters long.`,
    }
  }
});

Vue.prototype.$axios = axios.create({ withCredentials: true }); // send cookies along for the ride.
Vue.prototype.$swal = swal;
Vue.filter("$format", $format);

export default {
  name: "AdminAddApplication",
  components: { ApplicationForm, Modal, Offers },
  props: {
    maximumrequestedloanamount: {
      type: Number,
      required: false
    },
    minimumrequestedloanamount: {
      type: Number,
      required: false
    }
  },
  data() {
    return {
      applicationId: null,
      showSpinner: false,
      showModal: false,
      page: 1,
      finishedMessage:
        "Loan successfully added. If you selected to run underwriting, an email to sign their agreement will been sent."
    };
  },
  methods: {
    testSpinner() {
      this.showSpinner = true;
      setTimeout(() => this.handleError("Oh nooooo!"), 2000);
    },
    successMessage(text) {
      this.$swal({
        icon: "success",
        title: "Success!",
        text: text || this.finishedMessage
      }).then(() => {
        this.showSpinner = false;
        this.showModal = false;
        this.page = 1;
        window.location.reload();
      });
    },
    failureMessage(text) {
      if (text.isAxiosError) text = text.response.data;
      this.$swal({
        icon: "error",
        title: "There was an issue.",
        text
      }).then(() => {
        this.showSpinner = false;
      });
    },
    setSpinner(bool = false) {
      this.showSpinner = bool;
    },
    handleError(err) {
      // console.error(err);

      const preElement = document.createElement("pre");

      preElement.innerText = JSON.stringify(err.toString ? err.toString() : err, null, 2);

      return this.$swal({
        title: "Woops! Something went wrong.",
        text: "Our devs should be able to do something with this...",
        content: preElement,
        icon: "error"
      }).then(() => (this.showSpinner = false));
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.error {
  color: red;
}
</style>
<style scoped>
.spinner-modal {
  overflow-x: hidden;
  position: fixed;
  display: flex;
  justify-content: center;
  flex-direction: column;
  z-index: 1001;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100vh;
  width: 100vw;
  background-color: #04050cb0;
}

.lds-ring {
  display: inline-block;
  align-self: center;
  width: 80px;
  height: 80px;
  z-index: 110;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid #fff;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fff transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
