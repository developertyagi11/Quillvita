import type { Config } from "tailwindcss";

/**
 * Tailwind theme generated from DESIGN.md. Every value points at a CSS variable defined in
 * src/app/globals.css so components only ever reference named tokens.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      canvas: "var(--color-canvas)",
      surface: {
        1: "var(--color-surface-1)",
        2: "var(--color-surface-2)",
        3: "var(--color-surface-3)",
        4: "var(--color-surface-4)",
      },
      hairline: {
        DEFAULT: "var(--color-hairline)",
        strong: "var(--color-hairline-strong)",
        tertiary: "var(--color-hairline-tertiary)",
      },
      ink: {
        DEFAULT: "var(--color-ink)",
        muted: "var(--color-ink-muted)",
        subtle: "var(--color-ink-subtle)",
        tertiary: "var(--color-ink-tertiary)",
      },
      primary: {
        DEFAULT: "var(--color-primary)",
        hover: "var(--color-primary-hover)",
        focus: "var(--color-primary-focus)",
        foreground: "var(--color-on-primary)",
      },
      inverse: {
        canvas: "var(--color-inverse-canvas)",
        ink: "var(--color-inverse-ink)",
      },
      success: "var(--color-success)",
      warning: "var(--color-warning)",
      danger: "var(--color-danger)",
      overlay: "var(--color-overlay)",
    },
    fontFamily: {
      display: "var(--font-display)",
      sans: "var(--font-text)",
      mono: "var(--font-code)",
    },
    fontSize: {
      "display-xl": ["80px", { lineHeight: "1.05", letterSpacing: "-3px", fontWeight: "600" }],
      "display-lg": ["56px", { lineHeight: "1.10", letterSpacing: "-1.8px", fontWeight: "600" }],
      "display-md": ["40px", { lineHeight: "1.15", letterSpacing: "-1px", fontWeight: "600" }],
      headline: ["28px", { lineHeight: "1.20", letterSpacing: "-0.6px", fontWeight: "600" }],
      "card-title": ["22px", { lineHeight: "1.25", letterSpacing: "-0.4px", fontWeight: "500" }],
      subhead: ["20px", { lineHeight: "1.40", letterSpacing: "-0.2px", fontWeight: "400" }],
      "body-lg": ["18px", { lineHeight: "1.50", letterSpacing: "-0.1px" }],
      body: ["16px", { lineHeight: "1.50", letterSpacing: "-0.05px" }],
      "body-sm": ["14px", { lineHeight: "1.50", letterSpacing: "0" }],
      caption: ["12px", { lineHeight: "1.40", letterSpacing: "0" }],
      button: ["14px", { lineHeight: "1.20", letterSpacing: "0", fontWeight: "500" }],
      eyebrow: ["13px", { lineHeight: "1.30", letterSpacing: "0.4px", fontWeight: "500" }],
      mono: ["13px", { lineHeight: "1.50", letterSpacing: "0" }],
    },
    borderRadius: {
      none: "0",
      xs: "4px",
      sm: "6px",
      md: "8px",
      lg: "12px",
      xl: "16px",
      xxl: "24px",
      pill: "9999px",
      full: "9999px",
    },
    extend: {
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "96px",
        nav: "56px",
        control: "14px",
      },
      // Named widths only: the spacing scale above reuses sm/md/lg/xl, which would turn
      // max-w-sm into 12px.
      maxWidth: {
        content: "1200px",
        prose: "68ch",
        lead: "576px",
        form: "384px",
        toast: "380px",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
      },
      boxShadow: {
        focus: "var(--focus-ring)",
        edge: "var(--edge-highlight)",
      },
    },
  },
};

export default config;
