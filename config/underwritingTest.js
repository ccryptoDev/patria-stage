module.exports = {
  checkTestSsn,
  getTestData,
};

function checkTestSsn(ssn) {
  const testingSsnSet = new Set([
    "227546987",
    "456253312",
    "298789651",
    "222659841",
    "207579981",
    "297556741",
    "221659978",
    "211567411",
    "206542311",
    "208542311",
    "201574569",
    "201574570",
    "222788852",
    // "100000092",
    "229505152",
    "229505153",
    "229505154",
    "230951234",
    // "100000194",
    "230951235",
    "230951236",
    // "100000203",
    "245991234",
    "202127845", // PASSING 399 APR
    "202127846", // PASSING 499 APR
    "202127847", // PASSING 599 APR
    "202127848", // PASSING 699 APR
    // "000000001",
    // "000000002",
    // "000000003",
    // "000000004",
    // "000000005",
    // "000000006",
    // "000000007",
    // "000000008",
    // "000000009",
    // "000000010",
    // "000000011",
    // "000000012",
    // "000000013",
    // "000000014",
    // "000000015",
    // "000000016",
    // "000000017",
    // "000000018",
    // "000000019",
    // "000000020",
    // "000000021",
    // "000000022",
    // "000000023",
    // "000000024",
    // "000000025",
    // "000000026",
    // "000000027",
    // "000000028",
    // "000000029",
    // "000000030",
    // "000000031",
    // "000000032",
    // "000000033",
    // "000000034",
    // "000000035",
    // "000000036",
    // "000000037",
    // "000000038",
    // "000000039",
    // "000000040",
    // "000000041",
  ]);

  return testingSsnSet.has(ssn);
}

function getTestData(ruleId, ssn) {
  const {
    UNDERWRITING_RULES,
  } = require("../api/services/underwriting_steps/helpers");

  const isTestCase = checkTestSsn(ssn);

  if (isTestCase) {
    const config = {
      [UNDERWRITING_RULES.$4_CHECK_DNL_LIST.ruleId]() {
        const testConfig = { "227546987": true };

        return testConfig[ssn];
      },
      [UNDERWRITING_RULES.$5_CLARITY_CLEAR_INQUIRE.ruleId]() {
        const testConfig = {
          "456253312": "666456720", // INVALID SSN
          "298789651": "666456730", // DECEASED SSN
          "222659841": "666456710", // OFAC SCORE QUEUE,
        };

        const passingSsn = "666456740";

        return testConfig[ssn] || passingSsn;
      },
      [UNDERWRITING_RULES.$6_TRANSUNION_FRAUD_VALIDATION.ruleId]() {
        const testConfig = {
          // DEVICE MEDIUM RISK
          "207579981": {
            testSsn: "666010001",
            testEmail: "Flag@Test.com",
          },
          // DEVICE HIGH RISK
          "297556741": {
            testSsn: "666010001",
            testEmail: "Fail@Test.com",
          },
          // IDENTITY MEDIUM RISK
          "221659978": {
            testSsn: "666010004",
            testEmail: "Pass@Test.com",
          },
          // IDENTITY HIGH RISK
          "211567411": {
            testSsn: "666010003",
            testEmail: "Pass@Test.com",
          },
        };

        const passingData = {
          testSsn: "666010001",
          testEmail: "Pass@Test.com",
        };

        return testConfig[ssn] || passingData;
      },
      [UNDERWRITING_RULES.$8_CLARITY_CLEAR_CREDIT.ruleId]() {
        const testConfig = {
          "206542311": "666456701", // ACTIVE MILITARY DUTY
          "208542311": "666456750", // CURRENT DELINQUENCY
          "201574569": "666456770", // LOW CLARITY SCORE,
          "201574570": "666456709", // MILITARY DUTY REVIEW,
        };

        let passingSsn = "666456740";

        // IF 699 APR TEST
        if (ssn === "202127848") {
          passingSsn = "666456810";
        }

        return testConfig[ssn] || passingSsn;
      },
      [UNDERWRITING_RULES.$9_FACTOR_TRUST_CALL.ruleId]() {
        const testConfig = {
          // BANKRUPTCY
          "222788852": {
            // testSsn: "666377934",
            testSsn: "666002631",
            testFirstName: "MICHAEL",
            testLastName: "D GGDKDGY",
            testDob: "1959-03-14",
            testStreet: "2515 613OA ST",
            testCity: "CINCINNATI",
            testState: "OH",
            testZipCode: "45202",
            testPhoneNumber: "5635551212",
          },
          // CURRENT DELINQUENCY
          "100000092": {}, // NOT ABLE TO FIND TEST CASE
        };
        
        const getStateForAPR = (ssn) => {
          const config = {
            "202127845": "TN", // 399 APR
            "202127846": "MS", // 499 APR
            "202127847": "SC", // 599 APR
            "202127848": "NC", // 699 APR
          };
          return config[ssn];
        };

        const passingData = {
          testSsn: "666795854",
          testFirstName: "BASIL",
          testLastName: "N UUJZDJHK",
          testDob: "1935-12-28",
          testStreet: "25 BJYDJ LN",
          testCity: "YONKERS",
          testState: getStateForAPR(ssn) || "AL",
          testZipCode: "10710",
          testPhoneNumber: "9145551212",
        };

        return testConfig[ssn] || passingData;
      },
      [UNDERWRITING_RULES.$18_CLARITY_CLEAR_INQUIRY.ruleId]() {
        const testConfig = {
          "229505152": "666456850", // BANK ACC MANY SSNs
        };

        const passingSsn = "666456740";

        return testConfig[ssn] || passingSsn;
      },
      [UNDERWRITING_RULES.$19_CLARITY_CLEAR_FRAUD.ruleId]() {
        const testConfig = {
          "229505153": "666456870", // CONSUMER DECEASED
          "229505154": "666456910", // FRAUD SIGNATURE
          "230951234": "666456920", // RISK SCORE
          // "100000194": "", // APPLICANT IS MINOR
        };

        const passingSsn = "666456740";

        return testConfig[ssn] || passingSsn;
      },
      [UNDERWRITING_RULES.$20_CLEAR_BANK_CALL.ruleId]() {
        const testConfig = {
          "230951235": "666456940", // CLEAR SCORE RISK
          "230951236": "666456950", //HIGH DEFAULT RATE
          // "100000203": "666456980", // DAYS SINCE DEFAULT HISOTRY
          "245991234": "666456990", // DDA OPENING INQUIRY
        };

        const passingSsn = "666456740";

        return testConfig[ssn] || passingSsn;
      },
    };

    return config?.[ruleId]?.();
  }
}
