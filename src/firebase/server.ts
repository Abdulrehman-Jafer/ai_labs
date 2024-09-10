import type { ServiceAccount } from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";

const service_account_credentials = {
  type: "service_account",
  project_id: "ai-labs-ff491",
  private_key_id: "b48c018a96d153318973aac9a67bbecaa518c765",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC8q/NY1watm0RD\nBiAe37gfIvfuJ69krX8dUzVk82TH/zhw2KGRCrFAhyHbZSR7u0/VRyhx9zxncdEq\nEfYCKY/jDFGH+RVReoXSKbWT7A2rBhsFwR05XDcoM7/j6N+7okaUmxIC2oBHcngD\nvLQ8muZ3y5KBxXbv0im/sGrX/C+jLpM+ueeR4nInXC6/eU5AX11pukdkQhNUitI3\nAfMBguwDujTytm54OJK1rkOdroAFbWbIwI4+QcDZ15c508MHL/w6cz1RvFEUrYbs\nbKWJbCDewWHeCX4GtmwFgel4rgWT31HcX/nDfCg9pgNYLzc4D5WGz0RB2rH3bQvO\ndUevOIa1AgMBAAECggEAHTfe2X8BUoDlXyDTeByK2c2TSj88lxGUSjEQ54eW768L\naVRvHvRiM11KBb1B22SMbjnVHmMcqGN0sjhyWe7gUNffR3iwT7wy/bNGYrhPfJEX\nPbqkoTWx+Aidmri9b0Qn/IsQTL9UVtw4EFIYsnsFnn84+t5e9zBblUtHnJe6M+G2\nNZfqKUfXF4EFVFQyOFtjQwgPYh62LkwDAhBj+EzDiy0BVvgXSzDz2tXrR9JvxSZg\nv2nwhuCBwv1j2gxIE+k6lfeIb5GxBXjPyZrlmDr85BYRYeBiMqZ40WU4xhEdIPnA\nOdMl9NQQNpp14aezeBRmmQs6sBN3wZs9Hp4FYls1SQKBgQDnDDI1YvzSe8p7DnZu\nxhLdRGyYPDKG8JUAU6qJfU0a78I6X7VEomKuwVUgjMM1l18zbDC1Yui5GB63Bpmj\n8/NZidnhiwAVCr+PXuyhtchjYhtjW8ihpJoCvqVd3444Mds0t4np5lHZ0bvl3+yt\n1SGZyv+U+7a65LqZMxsRT/iIWQKBgQDRDC5MIVBl7l7v/F2rj17Q8FHRE93tFa4w\noDFRRZY+cuPRiUOB3vXQ5A2dYa3tBMZl6i/2GHUOdCMVX3We2+n1ibUp4a71VuJt\nT5jKwvVd5oM8p5pLnKTr/RAPY+FTL2h3h9EHcjeKlO+rxZFmt0YsRxmaSvxcsmGQ\nDXqjIF8lvQKBgQDQoRitUGcPAS0DFTooKL9cAa81gBX390H0e5ggcn6vdhQidc3O\n3frR5k2iCLk0qS0T1/vbriaLDJafmlwdyejRz0JpAQTf+0aihYqTMvxxkWM9wuFV\n5LYVCGV2cKmRYKOZ5KmqBYmfcF2E40Bqb2vZ3Y4Pz4NfG67LK3Sjm1zGcQKBgAwg\nosbz39AqBgPyJhT/2kZQys5QUr2gVlynznSijtbMn37Wcb4lCym1MT0CH67yafgb\nn/Cs9o2CG07wHMi8hVQjSwlE+HtvMO+agIiyyr1J1C8+oerlCYRPSBE8gCPtSig1\nDuFZtPMrNMRIT+kflMiYz1luJDnUd2h9/7Fa/WoZAoGBAKshjNB6AE0qHh2sJb5L\nEu4/Ljv5IICzeXivo98dkMafAwEPyBJOzClWLczw2dJYcPmmcIRtMNYMooQAKmZG\npmMxyiJXTgL1TP4IyyT5eurCyCxHb401Uuxbjj1CsTEjg8PVjgy2ex2I3wzNZa6u\nTyEAX5QkiHB8mA0+SOM2qLfh\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-a9e1a@ai-labs-ff491.iam.gserviceaccount.com",
  client_id: "107092371356460432211",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-a9e1a%40ai-labs-ff491.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

const app = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert(service_account_credentials as ServiceAccount),
    });

const auth = getAuth(app);

export { auth };
