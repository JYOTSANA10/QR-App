import  mysql  from "mysql";

const connection= mysql.createConnection({
    host: "localhost",
    user: "root",
    password:"root",
})

connection.connect((err)=>{
    console.log("-------------Connected");
})

export const QRcodeDb = {



    // __hasQrCodesTable: async function () {
    //     const query = `
    //       SELECT name FROM sqlite_schema
    //       WHERE
    //         type = 'table' AND
    //         name = ?;
    //     `;
    //     const rows = await this.__query(query, [this.qrCodesTableName]);
    //     return rows.length === 1;
    //   },
    
      /* Initializes the connection with the app's sqlite3 database */
      init: async function () {
    
       
    
    
        // if (hasQrCodesTable) {
        //   this.ready = Promise.resolve();
    
        // } else {
          const query = `
            CREATE TABLE  CodeDetails (
              id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
              shopDomain VARCHAR(511) NOT NULL,
              title VARCHAR(511) NOT NULL,
              productId VARCHAR(255) NOT NULL,
              variantId VARCHAR(255) NOT NULL,
              handle VARCHAR(255) NOT NULL,
              discountId VARCHAR(255) NOT NULL,
              discountCode VARCHAR(255) NOT NULL,
              destination VARCHAR(255) NOT NULL,
              scans INTEGER,
              createdAt DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
            )
          `;
                connection.query(query, ()=>{
                    console.log("----------------Created");
                })
    //     }
      }
}