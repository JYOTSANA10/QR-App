// @ts-nocheck
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import { QRcodeDb } from "./qr-codes-db.js";
import { parseQrCodeBody, getShopUrlFromSession , formatQrCodeResponse , getQrCodeOr404} from "./helpers/qr-codes.js";
import applyQrCodePublicEndpoints from "./middleware/qr-code-public.js";

QRcodeDb.init();



const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
applyQrCodePublicEndpoints(app);

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

const SHOP_DATA_QUERY = `
  query shopData($first: Int!) {
    shop {
      url
    }
    codeDiscountNodes(first: $first) {
      edges {
        node {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
            ... on DiscountCodeBxgy {
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
            ... on DiscountCodeFreeShipping {
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
app.get("/api/shop-data", async (req, res) => {


  // const kdsdk = await getUrlSession(req, res)
  // console.log("res-------->",kdsdk);

  console.log("res-------->",res.locals.shopify.session);

   const client = new shopify.api.clients.Graphql({
     session: res.locals.shopify.session,
   });

   /* Fetch shop data, including all available discounts to list in the QR code form */
   const shopData = await client.query({
     data: {
       query: SHOP_DATA_QUERY,
       variables: {
         first: 25,
       },
     },
   });

   console.log("shopData",shopData.body);
   res.send(shopData.body.data);
 });

app.post("/api/qrcodes", async (req, res) => {
  try {
    console.log("req----------", req.body);
    const id = await QRcodeDb.create({
      ...(await parseQrCodeBody(req)),

      shopDomain: await getShopUrlFromSession(req, res),
    });
    const response= await id.insertId;
    console.log("id-------",response);
      const data = await formatQrCodeResponse(req, res, [
        await QRcodeDb.read(response),
      ]);
      console.log("data",data);
      res.status(201).send(data[0]);

  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/api/qrcodes", async (req, res) => {
  try {
    const rawCodeData = await QRcodeDb.list(
      await getShopUrlFromSession(req, res)
    );

    const response = await formatQrCodeResponse(req, res, rawCodeData);
    res.status(200).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});


app.get("/api/qrcodes/:id", async (req, res) => {
  const qrcode = await getQrCodeOr404(req, res);

  if (qrcode) {
    const formattedQrCode = await formatQrCodeResponse(req, res, [qrcode]);
    res.status(200).send(formattedQrCode[0]);
  }
});

app.patch("/api/qrcodes/:id", async (req, res) => {
  const qrcode = await getQrCodeOr404(req, res);

  if (qrcode) {
    try {
      await QRcodeDb.update(req.params.id, await parseQrCodeBody(req));
      const response = await formatQrCodeResponse(req, res, [
        await QRcodeDb.read(req.params.id),
      ]);
      res.status(200).send(response[0]);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
});


app.delete("/api/qrcodes/:id", async (req, res) => {
  const qrcode = await getQrCodeOr404(req, res);

  if (qrcode) {
    await QRcodeDb.delete(req.params.id);
    res.status(200).send();
  }
});



// app.post("/api/qrcodes", async (req, res) => {
//   try {
//       console.log("req----------",req.body);
//       const id = await QRcodeDb.create(req)
//       // ...(await parseQrCodeBody(req)),

//       // shopDomain: res.locals.shopify.session,
//     // });
//   //   const response = await formatQrCodeResponse(req, res, [
//   //     await QRcodesDB.read(id),
//   //   ]);
//   //   res.status(201).send(response[0]);

//       // console.log(id);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

app.get("/api/products/create", async (_req, res) => {
  // const countData = await QRcodeDb.create();
  // console.log("countData", countData);
  // res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
