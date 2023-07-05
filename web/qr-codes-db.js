import  mysql  from "mysql";


const connection= mysql.createConnection({
    host: "localhost",
    user: "root",
    password:"root",
    database: 'QRCode_App'
})

connection.connect((err)=>{
    console.log("-------------Connected");
})

export const QRcodeDb = {


  create: async function ({
    shopDomain,
    title,
    productId,
    variantId,
    handle,
    discountId,
    discountCode,
    destination,
  }) {
    await this.ready;

    const query = `
      INSERT INTO ${this.qrCodesTableName}
      (shopDomain, title, productId, variantId, handle, discountId, discountCode, destination, scans)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
      RETURNING id;
    `;

    const rawResults = await this.__query(query, [
      shopDomain,
      title,
      productId,
      variantId,
      handle,
      discountId,
      discountCode,
      destination,
    ]);

    return rawResults[0].id;
  },


      

    __hasQrCodesTable: async function () {
        const query = `
        SELECT count(*)
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = 'QRCode_App' AND TABLE_NAME = 'QrCodesTable';
        `;

        connection.query(  query,async  (req,res)=>{
          console.log("----------------table",JSON.parse(JSON.stringify(res[0])));

          const data=Object.values(JSON.parse(JSON.stringify(res[0])));

          console.log("data",data[0]);


      })
         console.log("fetch",fetch);
      },
    
      /* Initializes the connection with the app's sqlite3 database */
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
                    console.log("----------------Created",res);

                    return res;
                })
    //     }  
        // return data
              }
      }
}