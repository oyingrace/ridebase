// polyfill.js
import "text-encoding-polyfill";

import { polyfillWebCrypto } from "expo-standard-web-crypto";
import { randomUUID } from "expo-crypto";

// Polyfill for Web Crypto
polyfillWebCrypto();
crypto.randomUUID = randomUUID;

if (typeof window !== "undefined") {
    window.TextEncoder = window.TextEncoder || require("text-encoding-polyfill").TextEncoder;
    window.TextDecoder = window.TextDecoder || require("text-encoding-polyfill").TextDecoder;
  }
