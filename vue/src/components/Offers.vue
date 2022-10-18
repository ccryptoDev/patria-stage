<template>
  <div>
    <div class="row">
      <div style="display:flex; justify-content: center;" class="col-xs-12">
        <h2>Select an Offer:</h2>
      </div>
    </div>
    <div class="offers-container">
      <div
        v-for="(offer, index) in offers"
        :key="index"
        :class="{ 'offer-container': true, selected: offer.selected }"
      >
        <div class="payment-frequency">Estimated Payments</div>
        <div class="payment-amount">{{ offer.regularPayment | $format }}</div>
        <div class="offer-divider">
          <hr />
          <div class="offer-divider-decoration">
            §
          </div>
          <hr />
        </div>
        <table>
          <tr>
            <th>Loan Offer:</th>
            <td>{{ offer.requestedLoanAmount | $format }}</td>
          </tr>
          <tr>
            <th>Payments:</th>
            <td>{{ offer.term }}</td>
          </tr>
          <tr>
            <th>APR:</th>
            <td>{{ offer.interestRate }}%</td>
          </tr>
        </table>

        <button @click="() => selectOffer(index)" class="offer-button">
          {{ offer.selected ? "Selected" : "Select Offer" }}
        </button>
      </div>
    </div>
    <div style="display:flex; justify-content: center;" class="row">
      <button
        class="btn btn-primary"
        :disabled="!offers.some(offer => offer.selected)"
        @click="sendSelectedOffer"
      >
        Submit Selected Offer
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    applicationId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      offers: []
    };
  },
  mounted() {
    this.fetchOffers();
  },
  methods: {
    selectOffer(index) {
      this.offers = this.offers.map((offer, i) => {
        return { ...offer, selected: i === index };
      });
    },
    async fetchOffers() {
      this.$emit("loading", true);

      this.offers = await this.$axios
        .get(`/admin/offers/${this.applicationId}`)
        .then(res => {
          this.$emit("loading", false);
          return res.data;
        })
        .catch(error => this.$emit("error", error));
    },
    async sendSelectedOffer() {
      this.$emit("loading", true);

      const offerIndex = this.offers.findIndex(offer => offer.selected);

      await this.$axios
        .post("/admin/select-offer", { applicationId: this.applicationId, offerIndex })
        .then(res => res.data)
        .then(() => this.$emit("success"))
        .catch(error => this.$emit("error", error));
    }
  }
};
</script>
<style scoped>
.offers-container {
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  flex-wrap: wrap;
}
.offer-container {
  background: linear-gradient(rgb(206, 213, 250), rgb(170, 181, 236));
  padding: 15px;
  width: 300px;
  border-radius: 8px;
  box-shadow: 2px 2px 7px -1px rgba(0, 0, 0, 0.27);
  margin-bottom: 50px;
  transition: all 0.2s ease-in-out;
}

.offer-container:hover {
  transform: scale(1.02);
  transition: all 0.2s ease-in-out;
}

.selected {
  transform: scale(1.02);
  background: linear-gradient(rgba(122, 142, 243, 0.75), rgba(72, 96, 216, 0.95)) !important;
  transition: all 0.2s ease-in-out;
}

.payment-frequency {
  color: #0a05388a;
  font-weight: bold;
  font-size: 18px;
  text-align: center;
  margin-bottom: 12px;
}

.payment-amount {
  text-align: center;
  font-size: 32px;
  font-size: 46px;
  color: #fff;
}

.offer-divider {
  margin: 20px 0;
  display: flex;
  align-items: center;
}

.offer-divider-decoration {
  color: #4b4f8f;
  font-size: 1.5em;
  padding: 5px;
}

.offer-divider hr {
  flex-grow: 1;
  border-top: medium double #4b4f8f;
}

.selected .offer-divider-decoration {
  color: #cccaca;
  transition: all 0.2s ease-in-out;
}

.selected .offer-divider hr {
  border-top: medium double #cccaca;
  transition: all 0.2s ease-in-out;
}

.offer-container table {
  font-size: 13px;
  width: 100%;
  color: white;
  flex-grow: 1;
}
.offer-container tr {
  border-bottom: 1px solid white;
}
.offer-container td {
  padding: 5px 0px;
  text-align: right;
}

.offer-button {
  width: 100%;
  border-radius: 6px;
  padding: 18px 14px;
  margin-top: 20px;
  color: white;
  background: #939bd1;
  /* border: 1px solid #2e6da4; */
  border: 1px solid #54568b;
  transition: all 0.2s ease-in-out;
}

.offer-button:hover {
  background: #0a053829;
  transition: all 0.2s ease-in-out;
}

.selected .offer-button {
  background: #0a053829;
  transition: all 0.2s ease-in-out;
}
</style>
