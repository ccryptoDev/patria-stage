import axios from "axios";
import { getRequester } from "./requester";
import {
  IPersonalInfoApi,
  IOffers,
  IIncome,
  ISelectOffer,
  IResponse,
  IArgylePayDistConf,
  IUploadDocument,
  ICancelArgyle,
  IAddUserEmployer,
  userInfo,
  userEmployementInfo,
  BankCredential,
  DResponse,
  ManualBank,
} from "./types";
import { baseUrl, adminBaseUrl } from "../app.config";

// Create new User/application
export async function createNewUserApplication(payload: userInfo) {
  let response: IResponse = { data: null, error: null } as any;
  try {
    response = await axios.post(`${baseUrl}/apply/newUser`, payload);
  } catch (error: any) {
    console.log(error);
    response.error = error?.response?.data || "something went wrong";
  }
  return response;
}

// creat / update funding method
export async function addFundingMethod(payload: any, throwException = false) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/FundingMethod`,
      payload
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
    if (throwException) {
      return Promise.reject(response.error.message);
    }
  }
  return response;
}
// add card to lms
export async function addFundingMethodInLMS({
  payload,
  throwException = false,
}: {
  payload: any;
  throwException?: boolean;
}) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${adminBaseUrl}/api/application/addCard`,
      payload
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.message || error.message || error,
    };
    if (throwException) {
      return Promise.reject(response.error.message);
    }
  }
  return response;
}

export async function makeDisbursement(screenTrackingId: string) {
  let response = { data: null, error: null as any };
  try {
    response = await getRequester().post(
      `${adminBaseUrl}/api/${screenTrackingId}/disburseAmount`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

// Gets the User info
export async function getUserInfo() {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(`${baseUrl}/ApiGetUserInfo`);
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response.data;
}

// Updates User info
export async function updateUserInfo(payload: any) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().patch(
      `${baseUrl}/ApiUpdateUserInfo`,
      payload
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

// Create User Employment info
export async function createNewEmploymentHistory({
  payload,
  screenTrackingId,
}: any) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/apply/APICreateEmploymentHistory/${screenTrackingId}`,
      payload
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
      underwritingStatus: error?.response?.data.underwritingStatus,
      statusCode: error?.response?.data.statusCode,
    };
  }
  return response;
}

// Gets the User Employment info
export async function getEmploymentHistory() {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(`${baseUrl}/APIGetEmploymentInfo`);
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

// Updates User Employment info
export async function updateEmploymentHistory({
  employmentId,
  payload,
  throwException = false,
}: {
  employmentId: string;
  payload: userEmployementInfo;
  throwException?: boolean;
}) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().patch(
      `${baseUrl}/APIUpdateEmployerInfo/${employmentId}`,
      payload
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };

    if (throwException) {
      return Promise.reject(response);
    }
  }
  return response;
}

// Update User Financial info
export async function updateFinancialInfo() {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/ApiUpdateUserFinancialInfo`
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

// Creates User Financial info
export async function createUserOffers() {
  let response: IResponse = { data: null, error: null };
  try {
    const userId = localStorage.getItem("userId");
    response = await getRequester().post(`${baseUrl}/createApplicationOffers`, {
      userId,
    });
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

// export async function getUserOffer() {
//   let response: IResponse = { data: null, error: null };
//   try {
//     const screenTrackingId = localStorage.getItem("screenTrackingId");
//     response = await getRequester().post(
//       `${baseUrl}/application/${screenTrackingId}/offers`
//     );
//   } catch (error: any) {
//     response.error = {
//       message: error?.response?.data?.error || error.message || error,
//     };
//   } finally {
//     // eslint-disable-next-line no-unsafe-finally
//     return response;
//   }
// }

export async function storeInitialSelectedOffer({
  offer,
  throwException = false,
  screenTrackingId,
}: {
  offer: IOffers;
  throwException: boolean;
  screenTrackingId: string;
}) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/${screenTrackingId}/storeInitialSelectedOffer`,
      offer
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };

    if (throwException) {
      return Promise.reject(response);
    }
  }
  return response;
}

export async function confirmApplicationReview({
  throwException = false,
  screenTrackingId,
}: {
  screenTrackingId: string;
  throwException?: boolean;
}) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/${screenTrackingId}/confirmApplicationReview`
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };

    if (throwException) {
      return Promise.reject(response);
    }
  }
  return response;
}

export async function saveFlinksLoginId(payload: {
  screenTrackingId: string;
  loginId: string;
  requestId?: string;
  bankName?: string;
  selectedAccountId?: string;
}) {
  let response: IResponse = { data: null, error: null };
  try {
    const {
      screenTrackingId,
      loginId,
      requestId,
      bankName,
      selectedAccountId,
    } = payload;
    response = await getRequester().post(
      `${baseUrl}/application/flinks/${screenTrackingId}`,
      { loginId, requestId, bankName, selectedAccountId }
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

// Gets the User's Offers
export async function getUserOffers(screenTrackingId: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/application/offers/${screenTrackingId}`
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

// Old api endpoints

export async function getTotalRowsByStatus() {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(`${baseUrl}/application`, {});
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function personalInfoApi(payload: IPersonalInfoApi) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/saveUserInfo`,
      payload
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function fetchOffersApi(payload: IOffers) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/offers`,
      payload
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function calculateOfferApi(payload: IOffers) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await axios.post(`${baseUrl}/application/offers`, payload);
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function selectOfferApi(payload: ISelectOffer) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/selectOffer`,
      payload
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function incomeApi(payload: IIncome) {
  let response: IResponse = { data: null, error: null };

  try {
    response = await getRequester().post(
      `${baseUrl}/application/saveIncome`,
      payload
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function creditBureauInquiryApi({
  screenTrackingId,
}: {
  screenTrackingId: string;
}) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/creditBureauInquiry`,
      { screenTrackingId }
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function fetchRicApi(userId: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/application/promnote/${userId}`
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

type IArgyleData = {
  userId: string;
  accountId: string;
};

export async function saveArgyleDataApi(body: IArgyleData) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/saveArgyleData`,
      body
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function fetchArgyleToken(userId: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/getArgyleUserToken`,
      { userId }
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function fetchArgylePaydistConfig(body: IArgylePayDistConf) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/getArgylePayDist`,
      body
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function documentUploadApi(body: IUploadDocument) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().put(
      `${baseUrl}/application/uploadDocument`,
      body
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function loanDocumentUploadApi(body: any) {
  let response: IResponse = { data: null, error: null };
  try {
    const screenTrackingId = localStorage.getItem("screenTrackingId");
    response = await getRequester().post(
      `${baseUrl}/application/uploadLoanDoc/${screenTrackingId}`,
      body
    );
    return response;
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
    return response;
  }
}

export async function acceptTerm({
  documentType,
  screenTrackingId,
  throwException = false,
}: {
  documentType: string;
  screenTrackingId: string;
  throwException?: boolean;
}) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/${screenTrackingId}/acceptTerm`,
      { documentType }
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };

    if (throwException) {
      return Promise.reject(response);
    }
  }
  return response;
}

export async function createSignedDocuments(
  screenTrackingId: string,
  signatureType: "consumerLoanAgreement",
  remoteFilePath: string
) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/${screenTrackingId}/createSignedDocuments`,
      {
        remoteFilePath,
        signatureType,
      }
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function getUserSignatureContent(screenTrackingId: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/application/${screenTrackingId}/userSignature`
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function getUserLoanDocuments(screenTrackingId: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/application/loanDocument/${screenTrackingId}`
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function getUserDocsApi(id: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/application/getUserDocuments/${id}`
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

type ISaveSignature = {
  data: string;
  fileType: string;
};

export async function saveSignature({
  payload,
  screenTrackingId,
}: {
  payload: ISaveSignature;
  screenTrackingId: string;
}) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/${screenTrackingId}/saveSignature`,
      payload
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

type IPaySplit = {
  userId: string;
};

export async function finishPaySplitApi(body: IPaySplit) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/splitDone`,
      body
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function changePassword({
  newPassword,
  userId,
}: {
  newPassword: string;
  userId: string;
}) {
  let response = { data: null, error: null } as any;
  try {
    response = await getRequester().patch(`${baseUrl}/user/changePassword`, {
      newPassword,
      userId,
    });
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function saveBankAccountApi(body: ManualBank) {
  const response: IResponse = { data: null, error: null, ok: false };
  try {
    const screenTrackingId = localStorage.getItem("screenTrackingId");
    const result = await getRequester().post(
      `/bank/manual/${screenTrackingId}`,
      body
    );
    response.ok = true;
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function cancelArgylePayrollDist(body: ICancelArgyle) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(`/application/removePayDist`, body);
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response.data;
}

export async function fetchMessagesApi(body: any) {
  let response = { data: [], error: null } as any;
  try {
    response = await getRequester().get(`${baseUrl}/application/messages`, {
      params: body,
    });
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response;
}

export async function forgotPasswordApi(body: { email: string }) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await axios.post(`${baseUrl}/resetPassword`, body);
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response.data;
}

export async function addEmployerApi(body: IAddUserEmployer) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await axios.post(`${baseUrl}/application/addEmployer`, body);
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response.data;
}

export async function verifyBankCredentials({
  screenTrackingId,
}: {
  screenTrackingId: string;
}) {
  // payload: BankCredential;
  let response: DResponse = { data: null, error: null, ok: false };
  try {
    const result = await getRequester().post(
      `${baseUrl}/bank/verification/${screenTrackingId}`
      // payload
    );
    response = result.data;
  } catch (error: any) {
    response.error = error?.response?.data?.error || error.message || error;
    response.underwritingStatus = error?.response?.data?.underwritingStatus;
  }
  return response;
}

export async function getDefaultPaymentMethod({
  screenTrackingId,
}: {
  screenTrackingId: string;
}) {
  // payload: BankCredential;
  let response: DResponse = { data: null, error: null, ok: false };
  try {
    const result = await getRequester().get(
      `${baseUrl}/bank/flinks-account/${screenTrackingId}`
    );
    response = result.data;
  } catch (error: any) {
    response.error = error?.response?.data?.error || error.message || error;
    response.underwritingStatus = error?.response?.data?.underwritingStatus;
  }
  return response;
}

export async function sendOTPApi({
  code,
  screenTrackingId,
}: {
  code: string;
  screenTrackingId: string;
}) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(`${baseUrl}/otp/${screenTrackingId}`, {
      code,
    });
  } catch (error: any) {
    response.error = {
      message: "Code doesn't match!",
    };
  }
  return response;
}

export async function otpStatusApi(screenTrackingId: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/otp/status/${screenTrackingId}`
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response.data;
}

export async function resendOTPApi(screenTrackingId: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/otp/send/${screenTrackingId}`
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response.data;
}

export async function getKBAApi() {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(`${baseUrl}/getUserKbaQuestions`);
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response.data;
}

export async function sendKBAApi({
  payload,
  screenTrackingId,
}: {
  payload: { questionId: number; answerId: number }[];
  screenTrackingId: string;
}) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/kba/${screenTrackingId}`,
      payload
    );
  } catch (error: any) {
    response.error = error.response.data.error;
  }
  return response;
}

export async function triggerIdentityVerificationApi(screenTrackingId: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/trueValidateStatus/${screenTrackingId}`
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response.data;
}

export async function getAchAccountData(screenTrackingId: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/trueValidateStatus/${screenTrackingId}`
    );
  } catch (error: any) {
    response.error = {
      message: error?.response?.data?.error || error.message || error,
    };
  }
  return response.data;
}

export async function generatePdfFromHtml(html: string, screenId: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${adminBaseUrl}/api/application/parsePdf`,
      {
        html,
        screenId,
      }
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function downloadPdf(filename: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${adminBaseUrl}/api/application/getPdf/?name=${filename}`,
      {
        responseType: "blob",
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "patria-RIC.pdf"); //or any other extension
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    response.error = error;
  }
  return response;
}
