// const lightCodeTheme = require('prism-react-renderer/themes/github');
// const darkCodeTheme = require('prism-react-renderer/themes/dracula');

export default {
  title: "StockVenta",
  url: "https://sebastianclaros.github.io", // Your website URL
  baseUrl: "/stockventa",
  projectName: "sebastianclaros.github.io",
  organizationName: "sebastianclaros",
  trailingSlash: false,
  onBrokenLinks: "log",
  onBrokenMarkdownLinks: "warn",

  plugins: [["drawio", {}]],

  markdown: {
    mermaid: true
  },

  themes: ["@docusaurus/theme-mermaid"],
  i18n: {
    defaultLocale: "es",
    locales: ["es"]
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/", // Serve the docs at the site's root
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/sebastianclaros/stockventa/tree/main"
        },
        blog: false,
        // blog: {
        //   showReadingTime: true,
        //   readingTime: ({content, frontMatter, defaultReadingTime}) =>
        //     defaultReadingTime({content, options: {wordsPerMinute: 300}}),
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     'https://github.com/sebastianclaros/stockventa/tree/main',
        // },
        theme: {
          customCss: require.resolve("./docs/custom.css")
        }
      })
    ]
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Stock Venta",
        logo: {
          alt: "Stock Venta",
          src: "img/logo.png"
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "integraciones",
            position: "left",
            label: "Integraciones"
          },
          {
            type: "docSidebar",
            sidebarId: "modelo",
            position: "left",
            label: "Modelo"
          },
          {
            type: "docSidebar",
            sidebarId: "servicio",
            position: "left",
            label: "Servicio"
          },
          {
            type: "docSidebar",
            sidebarId: "aplicacion",
            position: "left",
            label: "Aplicacion"
          },
          // {
          //   to: 'blog',
          //   label: 'Blog',
          //   position: 'right'
          // },
          {
            type: "docSidebar",
            sidebarId: "diccionario",
            position: "right",
            label: "Diccionarios"
          }
        ]
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Apis",
            items: [
              // {
              //   label: 'Portabilidad',
              //   to: '/docs/intro',
              // },
            ]
          }
        ]
      }
      // prism: {
      //   theme: lightCodeTheme,
      //   darkTheme: darkCodeTheme,
      // },
    })
};
