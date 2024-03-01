import express from "express";
import { getPckeInviteInfo, postPckeTokenExchange } from "../auth.js";
import {
  getAuthInviteInfo,
  insertUserAccess,
  hasUserAlreadyRegistered,
} from "../sql.js";
const router = express.Router();

//get all auth invitations that haven't had a corresponding user_access record
//created yet
router.get("/pckeInfo", function (req, res) {
  try {
    const pckeInfo = getPckeInviteInfo();
    res.status(200).json(pckeInfo);
  } catch (e) {
    res.status(400).json(e);
  }
});

//add an auth invitation after it gets sent/emailed
router.post("/pckeTokenExchange", async function (req, res) {
  //message we will return depending on auth success or at which point there was a failure
  let responseDetails = {
    message: "This invite has already been registered, or is invalid.",
    success: false,
  };
  try {
    const { authCode, state } = req.body;
    if (state && authCode) {
      const authInvite = await getAuthInviteInfo(state);
      //if a matching auth invite that has not been already registered exists, continue
      if (authInvite) {
        //call fitbit to get the initial access/refresh tokens
        const exchResponse = await postPckeTokenExchange(
          authInvite.codeVerifier,
          authCode
        );
        responseDetails = {
          message: "The token exchange process has failed.",
          success: false,
        };
        //if we get a valid response from the token exchange, continue
        if (exchResponse) {
          //calcuate when the access_token will expire in unix/epoch date/time format
          const currentDT = Math.floor(Date.now() / 1000);
          const expiresAt = Math.floor(currentDT + exchResponse.expires_in);

          responseDetails = {
            message: "You have already registered your account.",
            success: false,
          };

          //only insert the auth data if the user_id has not already been registered
          await hasUserAlreadyRegistered(exchResponse.user_id).then(
            (hasRegistered) => {
              if (!hasRegistered) {
                insertUserAccess(
                  exchResponse.refresh_token,
                  exchResponse.access_token,
                  String(expiresAt),
                  exchResponse.scope,
                  exchResponse.user_id,
                  authInvite.auth_id
                ).then(() => {
                  responseDetails = {
                    message:
                      "Token exchange suceeded! You are now a part of Step 4 Studies!",
                    success: true,
                  };
                });
              }
            }
          );
        }
      }
    }
    res.status(200).json(responseDetails);
  } catch (e) {
    res.status(400).json(e);
  }
});

export default router;
