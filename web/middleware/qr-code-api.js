import express from "express";
import shopify from "../shopify.js";
// import { QRcodesDB } from "../qr-codes-db.js";

import { QRcodeDb } from "../qr-codes-db.js"

import {getQrCodeOr404,getShopUrlFromSession ,parseQrCodeBody} from "../helpers/qr-codes.js"


// app.post("/api/qrcodes", async (req, res) => {
//     try {
//         console.log("req----------",req.body);
//         const id = await QRcodeDb.create({
//         ...(await parseQrCodeBody(req)),

//         shopDomain: await getShopUrlFromSession(req, res),
//       });
//     //   const response = await formatQrCodeResponse(req, res, [
//     //     await QRcodesDB.read(id),
//     //   ]);
//     //   res.status(201).send(response[0]);

//         console.log(id);
//     } catch (error) {
//       res.status(500).send(error.message);
//     }
//   });