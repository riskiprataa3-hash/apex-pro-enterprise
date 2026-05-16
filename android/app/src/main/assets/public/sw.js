/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7b16fee0'], (function (workbox) { 'use strict';

  self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "screenshot-wide.svg",
    "revision": "e7e2a809c65bb0ffbc5db4811675611e"
  }, {
    "url": "screenshot-narrow.svg",
    "revision": "362ad6ed03d3aeb2b17e18baf8aaf3bc"
  }, {
    "url": "pwa-64x64.png",
    "revision": "f8676a33ce6377ecbfa8459a006a08e6"
  }, {
    "url": "pwa-512x512.png",
    "revision": "56349be0b16ec9a2f094c0010b19a462"
  }, {
    "url": "pwa-192x192.png",
    "revision": "65a58e4c94e3df578456e2bebabcae05"
  }, {
    "url": "maskable-icon-512x512.png",
    "revision": "cb212420adeb09887d84775eed69b8f4"
  }, {
    "url": "index.html",
    "revision": "92cbdfe4c1ed272625912b48657f051d"
  }, {
    "url": "icon.svg",
    "revision": "7d0cf8543b3d1f31d35ccb02fb4d391d"
  }, {
    "url": "favicon.ico",
    "revision": "483e063b311cb3c63696b3ef4405a1ec"
  }, {
    "url": "apple-touch-icon-180x180.png",
    "revision": "404540a55a86a9afe44503e896b2a698"
  }, {
    "url": "assets/workbox-window.prod.es5-BBnX5xw4.js",
    "revision": null
  }, {
    "url": "assets/wifi-off-BmcHyBOb.js",
    "revision": null
  }, {
    "url": "assets/trash-2-DtI5rW2t.js",
    "revision": null
  }, {
    "url": "assets/shield-alert-CPCxd6PE.js",
    "revision": null
  }, {
    "url": "assets/save-BcQVwvXc.js",
    "revision": null
  }, {
    "url": "assets/purify.es-BwoZCkIS.js",
    "revision": null
  }, {
    "url": "assets/jspdf.plugin.autotable-DTVlOSTj.js",
    "revision": null
  }, {
    "url": "assets/jspdf.es.min-D_6MKWyw.js",
    "revision": null
  }, {
    "url": "assets/index.es-B_FQxtZ6.js",
    "revision": null
  }, {
    "url": "assets/index-BxFfsem3.js",
    "revision": null
  }, {
    "url": "assets/index-Btop3vc4.js",
    "revision": null
  }, {
    "url": "assets/index-BZbVbgeO.css",
    "revision": null
  }, {
    "url": "assets/index-BMb9e50-.js",
    "revision": null
  }, {
    "url": "assets/html2canvas.esm-QH1iLAAe.js",
    "revision": null
  }, {
    "url": "assets/exceljs.min-CB-HTDwq.js",
    "revision": null
  }, {
    "url": "assets/costPdfExport-D49tMLWR.js",
    "revision": null
  }, {
    "url": "assets/arrow-left-DcYiRdWw.js",
    "revision": null
  }, {
    "url": "assets/ProjectDetailPage-DGVIpNGQ.js",
    "revision": null
  }, {
    "url": "assets/PieChart-BZAmAo90.js",
    "revision": null
  }, {
    "url": "assets/LiteModePage-4CsvqkwS.js",
    "revision": null
  }, {
    "url": "assets/DashboardPage-BmSKPWEy.js",
    "revision": null
  }, {
    "url": "assets/ChatCenter-B-X4FBOT.js",
    "revision": null
  }, {
    "url": "apple-touch-icon-180x180.png",
    "revision": "404540a55a86a9afe44503e896b2a698"
  }, {
    "url": "favicon.ico",
    "revision": "483e063b311cb3c63696b3ef4405a1ec"
  }, {
    "url": "icon.svg",
    "revision": "7d0cf8543b3d1f31d35ccb02fb4d391d"
  }, {
    "url": "maskable-icon-512x512.png",
    "revision": "cb212420adeb09887d84775eed69b8f4"
  }, {
    "url": "pwa-192x192.png",
    "revision": "65a58e4c94e3df578456e2bebabcae05"
  }, {
    "url": "pwa-512x512.png",
    "revision": "56349be0b16ec9a2f094c0010b19a462"
  }, {
    "url": "pwa-64x64.png",
    "revision": "f8676a33ce6377ecbfa8459a006a08e6"
  }, {
    "url": "screenshot-narrow.svg",
    "revision": "362ad6ed03d3aeb2b17e18baf8aaf3bc"
  }, {
    "url": "screenshot-wide.svg",
    "revision": "e7e2a809c65bb0ffbc5db4811675611e"
  }, {
    "url": "manifest.json",
    "revision": "be27dece1182822683d982da916b3413"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
