<template>
  <div class="los-content">
    <FormulateForm v-model="applicationFormValues" @submit="submitHandler">
      <div class="row">
        <div class="col-xs-12">
          <h2>New Loan for {{ user.firstname }} {{ user.lastname }}</h2>
        </div>
      </div>
      <br />
      <div class="row">
        <div class="form-group col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <p align="left">Requested Loan Amount</p>
          <FormulateInput
            name="requestedLoanAmount"
            class="currencyInput"
            type="number"
            :validation="`min:${minimumRequestedLoanAmount || 200}|max:${maximumRequestedLoanAmount || 1500}`"
          />
        </div>
      </div>
<!--      <div class="row">-->
<!--        <div class="form-group col-xs-12 col-sm-12 col-md-12 col-lg-12">-->
<!--          <div style="display:flex;">-->
<!--            <FormulateInput name="shouldRunUnderwriting" type="checkbox"             input-class="" />-->
<!--            <p style="font-weight: bold;">-->
<!--              Run Underwriting?-->
<!--            </p>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
      <br />
      <div class="row" style="display:flex; flex-direction:column; align-items: center;">
        <div style="display:flex; justify-content:space-between; width: 170px;">
          <button
            class="btn"
            @click="
              event => {
                event.preventDefault();
                runCancel();
              }
            "
          >
            Cancel
          </button>
          <FormulateInput input-class="btn btn-primary" type="submit" :disabled="!enableSubmit" label="Next" />
        </div>
      </div>
    </FormulateForm>
  </div>
</template>
<script>
export default {
  props: {
    user: {
      type: Object,
      required: true
    },
    maximumRequestedLoanAmount: {
      type: Number,
      required: false
    },
    minimumRequestedLoanAmount: {
      type: Number,
      required: false
    }
  },
  data() {
    return {
      applicationFormValues: {},
      enableSubmit: true
    };
  },
  methods: {
    runCancel() {
      this.applicationFormValues = {};
      this.$emit("cancel");
    },
    submitHandler() {
      this.$emit("loading", true);
      this.enableSubmit = false;

      this.$axios
        .post("/admin/new-loan", {
          userId: this.user.id,
          ...this.applicationFormValues,
          requestedLoanAmount: Number(this.applicationFormValues.requestedLoanAmount)
        })
        .then(res => {
          this.$emit("success", res.data);
          this.enableSubmit = true;
        })
        .catch(err => {
          this.$emit("error", err);
          this.enableSubmit = true;
        });
    }
  }
};
</script>
<style scoped>
.document-divider {
  overflow: visible;
  padding: 0;
  border: none;
  border-top: medium double #333;
  color: #333;
  text-align: center;
  height: 3px;
}
</style>
