<template>
  <div class="los-content">
    <FormulateForm v-model="applicationFormValues" @submit="submitHandler">
      <div class="row">
        <div class="col-xs-12">
          <h2>Patria Location Information</h2>
        </div>
      </div>
      <p align="left">Location</p>
      <FormulateInput
        name="practicemanagement"
        placeholder="Select"
        :options="locations"
        type="select"
        validation="required"
      />
      <div class="row">
        <hr class="document-divider" />
        <div class="col-xs-12">
          <h2>Personal Information</h2>
        </div>
      </div>
      <div class="row">
        <div class="form-group col-xs-12 col-sm-4 col-md-4 col-lg-4">
          <p align="left">First Name</p>
          <FormulateInput name="firstName" validation="required" />
        </div>
        <div class="form-group col-xs-12 col-sm-4 col-md-4 col-lg-4">
          <p align="left">Middle Name (optional)</p>
          <FormulateInput name="middleName" />
        </div>
        <div class="form-group col-xs-12 col-sm-4 col-md-4 col-lg-4">
          <p align="left">Last Name</p>
          <FormulateInput name="lastName" validation="required" />
        </div>
      </div>
      <div class="row">
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Email Address</p>
          <FormulateInput name="email" validation="required|email" />
        </div>

        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Mobile Number</p>
          <FormulateInput name="phoneNumber" validation="min:10,length|max:10,length|number|required" />
        </div>
      </div>
      <div class="row">
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Address</p>
          <FormulateInput name="address" validation="required" />
        </div>
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Unit / Apartment (optional)</p>
          <FormulateInput name="unitApt" />
        </div>
      </div>
      <div class="row">
        <div class="form-group col-xs-12 col-sm-4 col-md-4 col-lg-4">
          <p align="left">City</p>
          <FormulateInput name="city" validation="required" />
        </div>
        <div class="form-group col-xs-12 col-sm-4 col-md-4 col-lg-4">
          <p align="left">State</p>
          <FormulateInput
            name="state"
            placeholder="Select"
            :options="allowedStates"
            type="select"
            validation="required"
          />
        </div>
        <div class="form-group col-xs-12 col-sm-4 col-md-4 col-lg-4">
          <p align="left">Zip</p>
          <FormulateInput name="zip" type="number" validation="min:5,length|max:5,length|required" />
        </div>
      </div>
      <div class="row">
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Social Security Number</p>
          <FormulateInput name="ssn" type="number" validation="min:9,length|max:9,length|required" />
        </div>
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Date Of Birth</p>
          <FormulateInput name="dateOfBirth" type="date" />
        </div>
      </div>
      <div class="row">
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">State ID Number</p>
          <FormulateInput name="stateIdNumber" validation="required" />
        </div>
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">ID State</p>
          <FormulateInput
            name="idState"
            placeholder="Select"
            :options="states"
            type="select"
            validation="required"
          />
        </div>
      </div>
      <div class="row">
        <hr class="document-divider" />
        <div class="col-xs-12">
          <h2>Financial Information</h2>
        </div>
      </div>
      <div class="row">
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Bank Name (optional)</p>
          <FormulateInput name="accountName" />
        </div>
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Routing Number</p>
          <FormulateInput
            name="routingNumber"
            type="number"
            validation="required|isValidRoutingNumber"
            :validation-rules="{ isValidRoutingNumber }"
            :validation-messages="{ isValidRoutingNumber: 'The routing number is invalid.' }"
          />
        </div>
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Account Number</p>
          <FormulateInput name="accountNumber" type="number" validation="required" />
        </div>
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Requested Loan Amount</p>
          <FormulateInput
            name="requestedLoanAmount"
            class="currencyInput"
            type="number"
            :validation="`min:${minimumRequestedLoanAmount || 200}|max:${maximumRequestedLoanAmount || 1500}`"
          />
        </div>
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Monthly Income (e.g. $1000)</p>
          <FormulateInput name="monthlyIncome" class="currencyInput" type="number" validation="required" />
        </div>
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Payment Method</p>
          <FormulateInput
            name="paymentMethod"
            placeholder="Select"
            :options="{ 'Direct Deposit': 'Direct Deposit', 'Paper Check': 'Paper Check' }"
            type="select"
            validation="required"
          />
        </div>
      </div>
      <div class="row">
        <hr class="document-divider" />
        <div class="col-xs-12">
          <h2>Employment Information</h2>
        </div>
      </div>
      <div class="row">
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Income Type</p>
          <FormulateInput
            name="typeOfIncome"
            placeholder="Select"
            :options="incomeTypes"
            type="select"
            validation="required"
          />
        </div>
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Employer Name</p>
          <FormulateInput name="employerName" validation="required" />
        </div>
      </div>
      <div class="row">
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Employer Phone</p>
          <FormulateInput name="employerPhone" validation="min:10,length|max:10,length|number|required" />
        </div>

        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Employer Status</p>
          <FormulateInput
            name="employerStatus"
            type="select"
            placeholder="Select"
            :options="{ full_time: 'Full Time', part_time: 'Part Time' }"
            validation="required"
          />
        </div>
      </div>
      <div class="row">
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Pay Frequency</p>
          <FormulateInput
            name="payFrequency"
            placeholder="Select"
            :options="{ B:'Bi-Weekly', M:'Monthly',  S:'Semi-Monthly', W:'Weekly'}"
            type="select"
            validation="required"
          />
        </div>
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Last Pay Date</p>
          <FormulateInput name="lastPayDate" type="date" validation="required" />
        </div>
      </div>
      <div class="row">
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Next Pay Date</p>
          <FormulateInput name="nextPayDate" type="date" validation="required" />
        </div>
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Second Pay Date</p>
          <FormulateInput name="secondPayDate" type="date"  />
        </div>
      </div>
      <div class="row">
        <div class="form-group col-xs-12 col-sm-6 col-md-6 col-lg-6">
          <p align="left">Pay On Holidays & Weekends</p>
          <FormulateInput
            name="paymentBeforeAfterHolidayWeekend"
            placeholder="Select"
            :options="{ 0:'Before', 1:'After'}"
            type="select"
            validation="required" value="0"
          />
        </div>
      </div>
      <br/>
      <div class="row">
        <div class="form-group col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <FormulateInput
              name="ignoreUnderwriting"
              type="checkbox"
              wrapper-class="flex justify-start"
              input-class="bigger-checkbox"
              label="Ignore Underwriting "
          />
          <p align="left"><i>(WARNING: this will create the user without underwriting)</i></p>
        </div>
      </div>
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
          <FormulateInput input-class="btn btn-primary" type="submit" label="Next" />
        </div>
      </div>
    </FormulateForm>
  </div>
</template>
<script>
export default {
  props: {
    maximumRequestedLoanAmount: {
      type: Number,
      required: false
    },
    minimumRequestedLoanAmount: {
      type: Number,
      required:false
    }
  },
  data() {
    return {
      applicationFormValues: {},
      enableSubmit: true,
      states: [],

      allowedStates: [],
      locations: [],
      incomeTypes: [
        { value: "disability_income", label: "Disability Income" },
        { value: "social_security", label: "Social Security" },
        { value: "employed", label: "Employed" },
        { value: "unemployed", label: "Unemployed" },
        { value: "pension", label: "Pension" },
        { value: "others", label: "Others (Child Support, Welfare etc.)" }
      ]
    };
  },
  mounted() {
    Promise.resolve()
      .then(() => this.$emit("loading", true))
      .then(this.populateSelects)
      .then(() => this.$emit("loading", false));
  },
  methods: {
    populateSelects() {
      return Promise.allSettled([
        this.$axios
          .get("/admin/states")
          .then(res => {
            this.states = res.data.map(doc => {
              return {
                value: doc.stateCode,
                label: doc.name
              };
            });
          })
          .catch(err => this.$emit("error", err)),

        this.$axios
          .get("/admin/states", { params: { allowedOnly: "y" } })
          .then(res => {
            this.allowedStates = res.data.map(doc => {
              return {
                value: doc.stateCode,
                label: doc.name
              };
            });
          })
          .catch(err => this.$emit("error", err)),

        this.$axios
          .get("/admin/practices")
          .then(res => {
            this.locations = res.data.map(location => {
              return {
                value: location.id,
                label: `${location.PracticeName}, ${location.City}`
              };
            });
          })
          .catch(err => this.$emit("error", err))
      ]);
    },
    runCancel() {
      this.applicationFormValues = {};
      this.$emit("cancel");
    },
    submitHandler(data) {
      this.$emit("loading", true);
      this.enableSubmit = false;

      this.$axios
        .post("/admin/new-application", { formData: data })
        .then(res => {
          this.$emit("success", res.data);
          this.enableSubmit = true;
        })
        .catch(err => {
          this.$emit("error", err);
          this.enableSubmit = true;
        });
    },
    isValidRoutingNumber({ value }) {
      let n = 0;
      for (let i = 0; i < value.length; i += 3) {
        n +=
          parseInt(value.charAt(i), 10) * 3 +
          parseInt(value.charAt(i + 1), 10) * 7 +
          parseInt(value.charAt(i + 2), 10);
      }
      // If the resulting sum is an even multiple of ten (but not zero),
      // the aba routing number is good.
      if (n != 0 && n % 10 == 0) return true;
      else return false;
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
