/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly RAZORPAY_KEY_ID?: string;
  readonly VITE_SAMPLE_LOGIN_EMAILS?: string;
  readonly SAMPLE_LOGIN_EMAILS?: string;
  readonly VITE_SAMPLE_ADMIN_EMAIL?: string;
  readonly SAMPLE_ADMIN_EMAIL?: string;
  readonly VITE_SAMPLE_OWNER_EMAIL?: string;
  readonly SAMPLE_OWNER_EMAIL?: string;
  readonly VITE_SAMPLE_VENDOR_EMAIL?: string;
  readonly SAMPLE_VENDOR_EMAIL?: string;
  readonly VITE_SAMPLE_ADVISOR_EMAIL?: string;
  readonly SAMPLE_ADVISOR_EMAIL?: string;
  readonly VITE_SAMPLE_DEFAULT_PASSWORD?: string;
  readonly SAMPLE_DEFAULT_PASSWORD?: string;
  readonly VITE_SAMPLE_ADMIN_KEY?: string;
  readonly SAMPLE_ADMIN_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
