import { server } from "typescript";

export default {
  server: {
    port: 9999,
  },
  envDir: "./src/env",
  build: {
    outDir: '../webserver/distFrontend'  // Example: output into sibling project folder
  }
  // config options
};
