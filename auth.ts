import crypto from "crypto";
import QueryString from "qs";
import axios from 'axios';
import https from "https";
import * as dotenv from "dotenv";
dotenv.config();

const clientId: string = process.env.CLIENT_ID;
const clientSecret: string = process.env.CLIENT_SECRET;

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});
axios.defaults.httpsAgent = httpsAgent;

function base64URLEncode(str: any) {
  return str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function sha256(buffer: any) {
  return crypto.createHash("sha256").update(buffer).digest();
}

const createCodeVerifier = (sub = 48) => {
  const uniqueId = crypto
    .getRandomValues(new Uint32Array(16))
    .join("")
    .substring(0, sub);
  return uniqueId;
};

const createState = (sub = 32) => {
  let uniqueId = createCodeVerifier(sub);
  return uniqueId;
};

export const getPckeInviteInfo = () => {
  const codeVerifier = base64URLEncode(crypto.randomBytes(32));
  const state = createState(32);
  const code = base64URLEncode(sha256(codeVerifier));
  const authLink =
    `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientId}&` +
    `scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+` +
    `settings+sleep+social+temperature&code_challenge=${code}&code_challenge_method=S256&state=${state}`;

  const authInfo = {
    code: code as string,
    codeVerifier: codeVerifier as string,
    state: state as string,
    authLink: authLink as string,
  };

  return authInfo;
};

//exchange the fitbit authCode, and codeVerifier for a user's initial
//access and refresh tokens from fitbit
export const postPckeTokenExchange = async (codeVerifier: string, authCode: string) => {
  const basicAuthCode = Buffer.from(clientId + ":" + clientSecret).toString("base64");

  let data = QueryString.stringify({
    client_id: clientId,
    grant_type: "authorization_code",
    code: authCode,
    code_verifier: codeVerifier,
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.fitbit.com/oauth2/token",
    headers: {
      Authorization: `Basic ${basicAuthCode}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };

  let response = null;

  await axios
    .request(config)
    .then((res) => {
      response = res.data;
    })
    .catch((error) => {
      console.log(error.response);
    });
  return response;
  
}