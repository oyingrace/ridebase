// polyfill.js
import { polyfillWebCrypto } from "expo-standard-web-crypto";
import { randomUUID } from "expo-crypto";

// Polyfill for Web Crypto
polyfillWebCrypto();
crypto.randomUUID = randomUUID;
