import type { NextAppSpec } from "@json-render/next";

export const defaultSpec: NextAppSpec = {
  metadata: {
    title: {
      default: "Acme Inc",
      template: "%s | Acme Inc",
    },
    description: "We build the future of software.",
    icons: "/icon.svg",
  },

  state: {
    contactName: "",
    contactEmail: "",
    contactMessage: "",
  },

  layouts: {
    main: {
      root: "wrapper",
      elements: {
        wrapper: {
          type: "Stack",
          props: { direction: "vertical", gap: "none" },
          children: ["nav", "content", "footer"],
        },

        nav: {
          type: "Stack",
          props: {
            direction: "horizontal",
            gap: "lg",
            align: "center",
            justify: "start",
            className:
              "px-8 py-4 border-b border-border bg-background sticky top-0 z-50",
          },
          children: [
            "navBrand",
            "navSpacer",
            "navHome",
            "navAbout",
            "navContact",
          ],
        },
        navBrand: {
          type: "Heading",
          props: { text: "Acme Inc", level: "h3" },
        },
        navSpacer: {
          type: "Text",
          props: { text: "", className: "flex-1" },
        },
        navHome: {
          type: "Link",
          props: { text: "Home", href: "/" },
        },
        navAbout: {
          type: "Link",
          props: { text: "About", href: "/about" },
        },
        navContact: {
          type: "Link",
          props: { text: "Contact", href: "/contact" },
        },

        content: {
          type: "Slot",
          props: {},
        },

        footer: {
          type: "Stack",
          props: {
            direction: "vertical",
            gap: "sm",
            align: "center",
            className: "px-8 py-12 border-t border-border bg-muted/30",
          },
          children: ["footerText", "footerCopy"],
        },
        footerText: {
          type: "Text",
          props: { text: "Built with json-render", variant: "muted" },
        },
        footerCopy: {
          type: "Text",
          props: {
            text: "2026 Acme Inc. All rights reserved.",
            variant: "muted",
            className: "text-xs",
          },
        },
      },
    },
  },

  routes: {
    "/": {
      layout: "main",
      metadata: {
        title: "Home",
        description: "Welcome to Acme Inc - we build the future of software.",
      },
      page: {
        root: "hero",
        elements: {
          hero: {
            type: "Stack",
            props: {
              direction: "vertical",
              gap: "xl",
              align: "center",
              className: "px-8 py-32 text-center max-w-4xl mx-auto",
            },
            children: [
              "heroBadge",
              "heroTitle",
              "heroDesc",
              "heroCta",
              "features",
            ],
          },
          heroBadge: {
            type: "Badge",
            props: { text: "Now in Beta", variant: "secondary" },
          },
          heroTitle: {
            type: "Heading",
            props: {
              text: "Build the future with Acme",
              level: "h1",
              className: "text-5xl font-bold tracking-tight",
            },
          },
          heroDesc: {
            type: "Text",
            props: {
              text: "We help companies ship better software, faster. Our platform provides the tools, infrastructure, and insights you need to build world-class products.",
              variant: "muted",
              className: "text-lg max-w-2xl",
            },
          },
          heroCta: {
            type: "Stack",
            props: { direction: "horizontal", gap: "md", align: "center" },
            children: ["ctaPrimary", "ctaSecondary"],
          },
          ctaPrimary: {
            type: "Button",
            props: { label: "Get Started", variant: "primary" },
            on: { press: { action: "navigate", params: { href: "/contact" } } },
          },
          ctaSecondary: {
            type: "Button",
            props: { label: "Learn More", variant: "outline" },
            on: { press: { action: "navigate", params: { href: "/about" } } },
          },

          features: {
            type: "Grid",
            props: { columns: 3, gap: "lg", className: "mt-8 w-full" },
            children: ["feat1", "feat2", "feat3"],
          },
          feat1: {
            type: "Card",
            props: {
              title: "Lightning Fast",
              description:
                "Optimized for speed with edge-first architecture and smart caching.",
            },
          },
          feat2: {
            type: "Card",
            props: {
              title: "Secure by Default",
              description:
                "Enterprise-grade security with end-to-end encryption and SOC 2 compliance.",
            },
          },
          feat3: {
            type: "Card",
            props: {
              title: "Developer First",
              description:
                "APIs, SDKs, and CLI tools designed to fit your workflow perfectly.",
            },
          },
        },
      },
    },

    "/about": {
      layout: "main",
      metadata: {
        title: "About",
        description:
          "Learn about our mission, values, and the team behind Acme.",
      },
      page: {
        root: "about",
        elements: {
          about: {
            type: "Stack",
            props: {
              direction: "vertical",
              gap: "xl",
              className: "px-8 py-20 max-w-4xl mx-auto",
            },
            children: ["aboutHeader", "aboutSep", "mission", "teamSection"],
          },
          aboutHeader: {
            type: "Stack",
            props: { direction: "vertical", gap: "md" },
            children: ["aboutTitle", "aboutDesc"],
          },
          aboutTitle: {
            type: "Heading",
            props: {
              text: "About Acme Inc",
              level: "h1",
              className: "text-4xl font-bold",
            },
          },
          aboutDesc: {
            type: "Text",
            props: {
              text: "Founded in 2024, Acme Inc is on a mission to make software development accessible to everyone. We believe the best tools should be simple, powerful, and delightful to use.",
              variant: "muted",
              className: "text-lg",
            },
          },
          aboutSep: {
            type: "Separator",
            props: {},
          },
          mission: {
            type: "Stack",
            props: { direction: "vertical", gap: "md" },
            children: ["missionTitle", "missionText"],
          },
          missionTitle: {
            type: "Heading",
            props: { text: "Our Mission", level: "h2" },
          },
          missionText: {
            type: "Text",
            props: {
              text: "We are building a world where anyone can create professional-grade software without years of training. By combining AI with thoughtful design, we are lowering the barrier to entry while raising the ceiling of what is possible.",
              variant: "muted",
            },
          },

          teamSection: {
            type: "Stack",
            props: { direction: "vertical", gap: "lg" },
            children: ["teamTitle", "teamGrid"],
          },
          teamTitle: {
            type: "Heading",
            props: { text: "The Team", level: "h2" },
          },
          teamGrid: {
            type: "Grid",
            props: { columns: 3, gap: "lg" },
            children: ["member1", "member2", "member3"],
          },
          member1: {
            type: "Card",
            props: {
              title: "Alex Chen",
              description: "CEO & Co-founder. Previously at Vercel and Google.",
            },
          },
          member2: {
            type: "Card",
            props: {
              title: "Sarah Kim",
              description:
                "CTO & Co-founder. Built distributed systems at AWS.",
            },
          },
          member3: {
            type: "Card",
            props: {
              title: "Marcus Rivera",
              description:
                "Head of Design. Former design lead at Figma and Stripe.",
            },
          },
        },
      },
    },

    "/contact": {
      layout: "main",
      metadata: {
        title: "Contact",
        description: "Get in touch with the Acme team.",
      },
      page: {
        root: "contact",
        elements: {
          contact: {
            type: "Stack",
            props: {
              direction: "vertical",
              gap: "xl",
              className: "px-8 py-20 max-w-2xl mx-auto",
            },
            children: ["contactHeader", "contactForm"],
          },
          contactHeader: {
            type: "Stack",
            props: { direction: "vertical", gap: "md" },
            children: ["contactTitle", "contactDesc"],
          },
          contactTitle: {
            type: "Heading",
            props: {
              text: "Get in Touch",
              level: "h1",
              className: "text-4xl font-bold",
            },
          },
          contactDesc: {
            type: "Text",
            props: {
              text: "Have a question or want to work with us? Fill out the form below and we will get back to you within 24 hours.",
              variant: "muted",
              className: "text-lg",
            },
          },
          contactForm: {
            type: "Card",
            props: { title: null, description: null },
            children: ["formStack"],
          },
          formStack: {
            type: "Stack",
            props: { direction: "vertical", gap: "md" },
            children: ["nameInput", "emailInput", "messageInput", "submitBtn"],
          },
          nameInput: {
            type: "Input",
            props: {
              label: "Name",
              placeholder: "Your name",
              statePath: "/contactName",
            },
          },
          emailInput: {
            type: "Input",
            props: {
              label: "Email",
              placeholder: "you@example.com",
              statePath: "/contactEmail",
            },
          },
          messageInput: {
            type: "Textarea",
            props: {
              label: "Message",
              placeholder: "Tell us about your project...",
              statePath: "/contactMessage",
              rows: 5,
            },
          },
          submitBtn: {
            type: "Button",
            props: {
              label: "Send Message",
              variant: "primary",
              className: "w-full",
            },
          },
        },
      },
    },
  },
};
