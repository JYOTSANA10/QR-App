import  mysql  from "mysql";
import shopify from './shopify.js'

const connection= mysql.createConnection({
    host: "localhost",
    user: "root",
    password:"root",
    database: 'QRCode_App'
})

connection.connect((err)=>{
    // console.log("-------------Connected");
})

export const QRcodeDb = {
  db: null,
  ready: null,

  create: async function ({
    shopDomain,
    title,
    productId,
    handle,
    destination,
  }) {
    await this.ready;

    console.log("In Create",shopDomain,productId);
    const query = `
      INSERT INTO QrCodesTable
      (shopDomain, title, productId,  handle, destination)
      VALUES ("${shopDomain}", "${title}", "${productId}", "${handle}","${destination}")
    `;

    // console.log("query",query);
    return new Promise((resolve, reject)=>{
      connection.query(query,  (error, elements)=>{
          if(error){
              return reject(error);
          }
          return resolve(elements);
      });
  });
    // await connection.query(query, (err,result)=>{

    //   console.log("result------------->",result.insertId);
    //   obj = result.insertId;
    //   return result.insertId;
    // })

    // console.log("obj=",obj,"-----");
    // return 8;
    // const rawResults = await this.__query(query, [
    //   shopDomain,
    //   title,
    //   productId,
    //   handle,
    //   destination,
    // ]);

    // return rawResults;
  },



  // create: async function ({
  //   shopDomain,
  //   title,
  //   productId,
  //   variantId,
  //   handle,
  //   destination,
  // }) {
  //   await this.ready;

  //   const query = `
  //     INSERT INTO QrCodesTable
  //     (shopDomain, title, productId, variantId, handle,  destination)
  //     VALUES (?, ?, ?, ?, ?, ?)
  //     RETURNING id;
  //   `;

  //   const rawResults = await this.__query(query, [
  //     shopDomain,
  //     title,
  //     productId,
  //     variantId,
  //     handle,
  //     destination,
  //   ]);

  //   return rawResults;
  // },
      

    __hasQrCodesTable: async function () {
        const query = `
        SELECT count(*)
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = 'QRCode_App' AND TABLE_NAME = 'QrCodesTable';
        `;

        connection.query(  query,async  (req,res)=>{
          // console.log("----------------table",JSON.parse(JSON.stringify(res[0])));

          const data=Object.values(JSON.parse(JSON.stringify(res[0])));

          // console.log("data",data[0]);


      })
        //  console.log("fetch",fetch);
      },
    
      
      init: async function () {
    
        const hasQrCodesTable = await this.__hasQrCodesTable();
    
        if (hasQrCodesTable) {
          this.ready = Promise.resolve();
    
        } else {
            const  query =  `
            CREATE TABLE QrCodesTable (
              id INTEGER PRIMARY KEY auto_increment NOT NULL,
              shopDomain VARCHAR(511) NOT NULL,
              title VARCHAR(511) NOT NULL,
              productId VARCHAR(255) NOT NULL,
              variantId VARCHAR(255) NOT NULL,
              handle VARCHAR(255) NOT NULL,
              discountId VARCHAR(255) NOT NULL,
              discountCode VARCHAR(255) NOT NULL,
              destination VARCHAR(255) NOT NULL
            )
          `;

          //  const query= "SELECT * FROM Contacts";

            connection.query(  query, (req,res)=>{
                    // console.log("----------------Created",res);

                    return res;
                })
    //     }  
        // return data
              }
      },


      __query: function (sql, params = []) {
          console.log("in query------");
          return new Promise((resolve, reject)=>{
            connection.query(sql,params,  (error, elements)=>{
          console.log("in query------",sql,params);

                if(error){
                    return reject(error);
                }
                return resolve(elements);
            });
        });
      },



      read: async function (id) {
        await this.ready;
        const query = `
          SELECT * FROM QrCodesTable
          WHERE id = ?;
        `;
        const rows = await this.__query(query, [id]);
        console.log("rows",rows);
        if (!Array.isArray(rows) || rows?.length !== 1) return undefined;
    
        return this.__addImageUrl(rows[0]);
      },

      delete: async function (id) {
        await this.ready;
        const query = `
          DELETE FROM QrCodesTable
          WHERE id = ?;
        `;
        await this.__query(query, [id]);
        return true;
      },

      __addImageUrl: function (qrcode) {
        try {
          qrcode.imageUrl = this.__generateQrcodeImageUrl(qrcode);
        } catch (err) {
          console.error(err);
        }
    
        return qrcode;
      },
    
      __generateQrcodeImageUrl: function (qrcode) {
        return `${shopify.api.config.hostScheme}://${shopify.api.config.hostName}/qrcodes/${qrcode.id}/image`;
      },


      list: async function (shopDomain) {
        await this.ready;
        const query = `
          SELECT * FROM QrCodesTable
          WHERE shopDomain = ?;
        `;
    
        const results = await this.__query(query, [shopDomain]);
        console.log("results",results);
    
        return results.map((qrcode) => this.__addImageUrl(qrcode));
      },

      update: async function (
        id,
        {
          title,
          productId,
          variantId,
          handle,
          destination,
        }
      ) {
        await this.ready;
    
        const query = `
          UPDATE QrCodesTable
          SET
            title = ?,
            productId = ?,
            variantId = ?,
            handle = ?,
            destination = ?
          WHERE
            id = ?;
        `;
    
        await this.__query(query, [
          title,
          productId,
          variantId,
          handle,
          destination,
          id,
        ]);
        return true;
      },


      generateQrcodeDestinationUrl: function (qrcode) {
        return `${shopify.api.config.hostScheme}://${shopify.api.config.hostName}/qrcodes/${qrcode.id}/scan`;
      },
    
      handleCodeScan: async function (qrcode) {
    
        await this.__increaseScanCount(qrcode);
    
        const url = new URL(qrcode.shopDomain);
        switch (qrcode.destination) {
    
          case "product":
            return this.__goToProductView(url, qrcode);
    
          case "checkout":
            return this.__goToProductCheckout(url, qrcode);
    
          default:
            throw `Unrecognized destination "${qrcode.destination}"`;
        }
      },


      __addImageUrl: function (qrcode) {
        try {
        console.log("addImageUrl-------------");

          qrcode.imageUrl = this.__generateQrcodeImageUrl(qrcode);
        } catch (err) {
          console.error(err);
        }
        console.log("qrcode-------------",qrcode);
        return qrcode;
      },
    
      __generateQrcodeImageUrl: function (qrcode) {
        return `${shopify.api.config.hostScheme}://${shopify.api.config.hostName}/qrcodes/${qrcode.id}/image`;
      },
    
      __increaseScanCount: async function (qrcode) {
        const query = `
          UPDATE QrCodesTable
          SET scans = scans + 1
          WHERE id = ?
        `;
        await this.__query(query, [qrcode.id]);
      },
    
      __goToProductView: function (url, qrcode) {
        return productViewURL({
          host: url.toString(),
          productHandle: qrcode.handle,
        });
      },
    
      __goToProductCheckout: function (url, qrcode) {
        return productCheckoutURL({
          host: url.toString(),
          variantId: qrcode.variantId,
          quantity: 1,
        });
      },
}



function productViewURL({ host, productHandle }) {
  const url = new URL(host);
  const productPath = `/products/${productHandle}`;

 
    url.pathname = productPath;

  return url.toString();
}

function productCheckoutURL({ host, variantId, quantity = 1 }) {
  const url = new URL(host);
  const id = variantId.replace(
    /gid:\/\/shopify\/ProductVariant\/([0-9]+)/,
    "$1"
  );

  url.pathname = `/cart/${id}:${quantity}`;

 

  return url.toString();
}