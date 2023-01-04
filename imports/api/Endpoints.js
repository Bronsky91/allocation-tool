import { WebApp } from "meteor/webapp";

// import body-parsing lib

// const getJson = (req, options = {}) =>
//   new Promise((resolve, reject) => {
//     try {
//       // use a lib body-parser/busboy etc
//       return resolve(// body result)
//     } catch (e) {
//       // handle error from body parsing lib etc.
//       return reject(e)
//     }
//   })

// Listen to incoming HTTP requests (can only be used on the server).
WebApp.connectHandlers.use("/hello", (req, res, next) => {
  res.writeHead(200);
  res.end(`Hello world from: ${Meteor.release}`);
});
