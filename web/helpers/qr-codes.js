import shopify from "../shopify.js";
import { QRcodeDb } from "../qr-codes-db.js";

const QR_CODE_ADMIN_QUERY = `
  query nodes($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        handle
        title
        images(first: 1) {
          edges {
            node {
              url
            }
          }
        }
      }
      
    }
  }
`;



export async function getQrCodeOr404(req, res, checkDomain = true) {
    try {
      const response = await QRcodeDb.read(req.params.id);
      if (
        response === undefined ||
        (checkDomain &&
          (await getShopUrlFromSession(req, res)) !== response.shopDomain)
      ) {
        res.status(404).send();
      } else {
        return response;
      }
    } catch (error) {
      res.status(500).send(error.message);
    }
  
    return undefined;
  }
 
export async function getShopUrlFromSession(req, res) {
    return `https://${res.locals.shopify.session.shop}`;

  }


  export async function getUrlSession(req, res) {
    console.log("url-------->",res.locals.shopify.session);
    return res.locals.shopify.session;

  }



  export async function parseQrCodeBody(req, res) {
    return {
      title: req.body.title,
      productId: req.body.productId,
     variantId: req.body.variantId,
      handle: req.body.handle,
      destination: req.body.destination,
    };
  }




  export async function formatQrCodeResponse(req, res, rawCodeData) {
    const ids = [];
    /* Get every product, variant and discountID that was queried from the database */
    rawCodeData.forEach(({ productId, variantId }) => {
      ids.push(productId);
      ids.push(variantId);
    });
  
    console.log("ids",ids);
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });
  console.log("formatQrCodeResponse",client);

  
    const adminData = await client.query({
      data: {
        query: QR_CODE_ADMIN_QUERY,
  
        /* The IDs that are pulled from the app's database are used to query product, variant and discount information */
        variables: { ids },
      },
    });
  
    /*
      Replace the product, discount and variant IDs with the data fetched using the Shopify GraphQL Admin API.
    */
    const formattedData = rawCodeData.map((qrCode) => {
      const product = adminData.body.data.nodes.find(
        (node) => qrCode.productId === node?.id
      ) || {
        title: "Deleted product",
      };
  
    //   const discountDeleted =
    //     qrCode.discountId &&
    //     !adminData.body.data.nodes.find((node) => qrCode.discountId === node?.id);
  
      /*
        A user might create a QR code with a discount code and then later delete that discount code.
        For optimal UX it's important to handle that edge case.
        Use mock data so that the frontend knows how to interpret this QR Code.
      */
    //   if (discountDeleted) {
    //     QRCodesDB.update(qrCode.id, {
    //       ...qrCode,
    //       discountId: "",
    //       discountCode: "",
    //     });
    //   }
  
      /*
        Merge the data from the app's database with the data queried from the Shopify GraphQL Admin API
      */
      const formattedQRCode = {
        ...qrCode,
        product,
        
      };
  
      /* Since product.id already exists, productId isn't required */
      delete formattedQRCode.productId;
  
      return formattedQRCode;
    });
  
    return formattedData;
  }