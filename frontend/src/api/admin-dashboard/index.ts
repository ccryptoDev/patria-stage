import axios, { AxiosResponse } from "axios";
import { getRequester, fileMultipart } from "./requester";
import {
  TableRequestEvent,
  IResponse,
  IBankAccount,
  IMakePayment,
  IUploadDocument,
  IMessageProps,
} from "./types";
import { baseUrl } from "../../app.config";

export async function getLoans({
  search,
  perPage,
  page,
  status,
  source,
}: TableRequestEvent) {
  const requestParams: {
    status: string;
    perPage: number;
    page: number;
    search?: string;
    source?: string;
  } = { perPage, page, status };
  if (search) requestParams.search = search;
  if (source) requestParams.source = source;
  let response = { data: null, error: null as any };
  try {
    response = await getRequester().get(`/dashboard/loans`, {
      params: requestParams,
    });
  } catch (error) {
    console.error(error);
    response.error = error;
  }
  return response;
}

export async function getTotalRowsByStatus() {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get("/admin/dashboard/loans/counters", {});
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getUsers({ search, perPage, skip }: TableRequestEvent) {
  const page = Math.floor(skip / perPage) + 1;
  const requestParams: {
    // perPage: number;
    page: number;
    search?: string;
  } = { /* perPage,*/ page };
  if (search) requestParams.search = search;
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get("/admin/dashboard/users", {
      params: { page, search },
    });
  } catch (error) {
    console.error(error);
    response.error = error;
  }
  if (response.data) {
    // this endpoint gets not standard data field names
    response.data = {
      items: response?.data?.rows,
      total: response?.data?.totalRows,
    };
  }
  return response;
}

export async function getUser(userId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(`/admin/dashboard/users/${userId}`);
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getApplication(screenTrackingId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/admin/dashboard/application/info/${screenTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }

  return response;
}

export async function getCreditReport(screenTrackingId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/admin/dashboard/creditReport/${screenTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getPaymentManagement(screenTrackingId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/admin/dashboard/loans/paymentSchedule/${screenTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getPaymentPreview(
  screenTrackingId: string,
  params?: Record<string, any>
) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/admin/dashboard/loans/previewPayment/${screenTrackingId}`,
      { params }
    );
  } catch (error) {
    console.error(error);
    response.error = error;
  }
  return response;
}

export async function getUserCards(screenTrackingId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/admin/dashboard/users/cards/${screenTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function submitPayment(
  screenTrackingId: string,
  data: { paymentMethodToken: string; amount: number; paymentDate: Date }
) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(
      `/admin/dashboard/loans/submitPayment/${screenTrackingId}`,
      data
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function changePaymentAmount(
  screenTrackingId: string,
  data: { amount: number }
) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().patch(
      `/admin/dashboard/loans/changePaymentAmount/${screenTrackingId}`,
      data
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

type AddCardProps = {
  screenTrackingId: string;
  data: {
    billingAddress1: string;
    billingCity: string;
    billingFirstName: string;
    billingLastName: string;
    billingState: string;
    billingZip: string;
    cardCode: string;
    cardNumber: string;
    expMonth: string;
    expYear: string;
  };
};

export const addCard = async ({ screenTrackingId, data }: AddCardProps) => {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(`/application/saveCardData/`, {
      screenTrackingId,
      ...data,
    });
  } catch (error) {
    response.error = error;
  }
  return response;
};

export async function getAdmins({
  search,
  isAgent,
  skip,
  perPage,
}: TableRequestEvent) {
  const page = Math.floor(skip / perPage) + 1;
  const requestParams: {
    page: number;
    search?: string;
  } = { page };
  if (search) requestParams.search = search;
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get("/admin/dashboard/admins", {
      params: { page, search, isAgent, perPage },
    });
  } catch (error) {
    console.error(error);
    response.error = error;
  }
  if (response.data) {
    // this endpoint gets not standard data field names
    response.data = {
      items: response?.data?.rows,
      total: response?.data?.totalRows,
    };
  }
  return response;
}

export async function getLocations() {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      "/admin/dashboard/practiceManagements/locations"
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getRoles() {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get("/admin/roles");
  } catch (error) {
    response.error = error;
  }
  return response;
}

type IAddAdmin = {
  email?: string;
  password?: string;
  phoneNumber?: string;
  userName?: string;
  isAgent?: boolean;
};

export async function addAdmin(body: IAddAdmin) {
  let response = { body: null, error: { message: "" } };
  try {
    response = await getRequester().post("/admin/dashboard/admins", body);
  } catch (error) {
    response.error = { message: error?.response?.data?.message };
  }
  return response;
}

export async function getAdminById(id: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(`/admin/dashboard/admins/${id}`);
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function updateAdminById(body: {
  id: string;
  email?: string;
  phoneNumber?: string;
  userName?: string;
}) {
  let response = { data: null, error: { message: "" } };
  try {
    response = await getRequester().patch(
      `/admin/dashboard/admins/${body.id}`,
      body
    );
  } catch (error) {
    response.error = { message: error?.response?.data?.message };
  }
  return response;
}

export async function getUserDocuments(screenTrackingId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/admin/dashboard/users/documents/${screenTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getUserConsents(screenTrackingId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/admin/dashboard/users/consents/${screenTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function uploadDocument({
  screenTrackingId,
  data,
}: {
  screenTrackingId: string;
  data: {
    documentType: "drivers license" | "passport";
    passport?: string;
    driversLicenseFront?: string;
    driversLicenseBack?: string;
  };
}) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(
      `/admin/dashboard/users/documents/${screenTrackingId}`,
      { ...data }
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getAllPracticeManagements({
  search,
  skip,
  perPage,
}: TableRequestEvent) {
  const page = Math.floor(skip / perPage) + 1;
  const requestParams: {
    page: number;
    search?: string;
  } = { page };
  if (search) requestParams.search = search;
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      "/admin/dashboard/practiceManagements",
      {
        params: { page, search },
      }
    );
  } catch (error) {
    console.error(error);
    response.error = error;
  }
  return response;
}

export async function addPracticeManagement(data: {
  address: string;
  city: string;
  location: string;
  managementRegion: string;
  openDate: string;
  phone: string;
  region: string;
  regionalManager: string;
  stateCode: string;
  zip: string;
}) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(
      "/admin/dashboard/practiceManagements",
      data
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getPracticeManagementById(id: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/admin/dashboard/practiceManagements/${id}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function updatePracticeManagementById(
  id: string,
  data?: {
    address?: string;
    city?: string;
    location?: string;
    managementRegion?: string;
    openDate?: string;
    phone?: string;
    region?: string;
    regionalManager?: string;
    stateCode?: string;
    zip?: string;
  }
) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().patch(
      `/admin/dashboard/practiceManagements/${id}`,
      data
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function changePassword({
  existingPassword,
  newPassword,
  userId,
}: {
  existingPassword: string;
  newPassword: string;
  userId: string;
}) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().patch(`/admin/changePassword`, {
      existingPassword,
      newPassword,
      userId,
    });
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function sendApplicationLink(requestBody: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  practiceManagement: string;
  sendEmail?: boolean;
  sendSms?: boolean;
  source: "web" | "lead-list";
}) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/admin/dashboard/application/link`,
      requestBody
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function forgotPassword(email: string) {
  let response = { data: null, error: null };
  try {
    response = await axios.patch(`${baseUrl}/admin/forgotPassword`, {
      email,
    });
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getAllLogActivities({
  search,
  skip,
  perPage,
}: TableRequestEvent) {
  const page = Math.floor(skip / perPage) + 1;
  const requestParams: {
    page: number;
    search?: string;
  } = { page };
  if (search) requestParams.search = search;
  let response = { data: null, error: null };
  try {
    response = await getRequester().get("/admin/dashboard/logActivities", {
      params: { page, search },
    });
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getAllLogActivitiesByScreenTrackingId(
  screenTrackingId: string,
  { search, skip, perPage }: TableRequestEvent
): Promise<AxiosResponse<any>> {
  const page = Math.floor(skip / perPage) + 1;
  const requestParams: {
    page: number;
    search?: string;
  } = { page };
  if (search) requestParams.search = search;

  const response = await getRequester().get(
    `/admin/dashboard/logActivities/user/${screenTrackingId}`,
    {
      params: { page, search },
    }
  );
  return response;
}

export async function getLogActivityById(id: string) {
  const response = await getRequester().get(
    `/admin/dashboard/logActivities/${id}`
  );

  return response;
}

export async function createLogActivity(requestBody: {
  moduleName: string;
  message: string;
  data?: any;
  loanReference?: string;
  paymentManagementId?: string;
  screenTrackingId?: string;
}) {
  const response = await getRequester().post(
    "/admin/dashboard/logActivities",
    requestBody
  );

  return response;
}

export async function getAllCommentsByScreenTrackingId(
  screenTrackingId: string,
  { search, skip, perPage }: TableRequestEvent
): Promise<AxiosResponse<any>> {
  const page = Math.floor(skip / perPage) + 1;
  const requestParams: {
    page: number;
    search?: string;
  } = { page };
  if (search) requestParams.search = search;

  const response = await getRequester().get(
    `/admin/dashboard/comments/${screenTrackingId}`,
    {
      params: { page, search },
    }
  );
  return response;
}

export async function addComment(
  screenTrackingId: string,
  requestBody: { subject: string; comment: string }
) {
  const response = await getRequester().post(
    `/admin/dashboard/comments/${screenTrackingId}`,
    requestBody
  );

  return response;
}

export async function getContractDataApi(screentTrackingId: string) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(
      `/admin/dashboard/getContractData/${screentTrackingId}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function addBankAccountApi(body: IBankAccount) {
  let response = { data: null, error: { message: "" } };
  try {
    response = await getRequester().post(`/application/saveCardData`, body);
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function makePaymentApi(body: IMakePayment) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(`/makePayment`, body);
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function documentUploadApi(body: IUploadDocument) {
  let response = { data: null, error: null };
  try {
    response = await fileMultipart().put(
      `${baseUrl}/application/uploadDocument`,
      body
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getUserDocsApi(id: string) {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/application/getUserDocuments/${id}`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function sendMessageApi(body: IMessageProps) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/messages`,
      body
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function updateCreditRulesApi(body: any) {
  let response = { data: null, error: null };
  try {
    response = await getRequester().post(
      `${baseUrl}/application/modifyCreditRules`,
      body
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}

export async function getCreditRulesApi() {
  let response = { data: null, error: null };
  try {
    response = await getRequester().get(`${baseUrl}/application/creditRules`);
  } catch (error) {
    response.error = error;
  }
  return response;
}
