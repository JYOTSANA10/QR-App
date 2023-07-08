/*
  Users need to be able to scan the QR Codes.
  This file provides the publicly available URLs to do that.
*/
import QRCode from "qrcode";

import { QRcodeDb } from "../qr-codes-db.js";
import { getQrCodeOr404 ,getUrlSession} from "../helpers/qr-codes.js";
import shopify from '../shopify.js'




const SHOP_DATA_QUERY = `
query shopData($first: Int!) {
  shop {
    url
  }
  
  
}
`;

export default  function applyQrCodePublicEndpoints(app) {


    // app.get("/api/shop-data", async (req, res) => {


    //    const kdsdk = await getUrlSession(req, res)
    //    console.log("res-------->",kdsdk);


    //     const client = new shopify.api.clients.Graphql({
    //       session: res.locals.shopify.session,
    //     });
    
    //     /* Fetch shop data, including all available discounts to list in the QR code form */
    //     const shopData = await client.query({
    //       data: {
    //         query: SHOP_DATA_QUERY,
    //         variables: {
    //           first: 25,
    //         },
    //       },
    //     });
    
    //     console.log("shopData",shopData);
    //     res.send(shopData.body.data);
    //   });
  
  app.get("/qrcodes/:id/image", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res, false);

    if (qrcode) {
      const destinationUrl = QRcodeDb.generateQrcodeDestinationUrl(qrcode);
      res
        .status(200)
        .set("Content-Type", "image/png")
        .set(
          "Content-Disposition",
          `inline; filename="qr_code_${qrcode.id}.png"`
        )
        .send(await QRCode.toBuffer(destinationUrl));
    }
  });

  /* The URL customers are taken to when they scan the QR code */
  app.get("/qrcodes/:id/scan", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res, false);

    if (qrcode) {
      res.redirect(await QRcodeDb.handleCodeScan(qrcode));
    }
  });
}
