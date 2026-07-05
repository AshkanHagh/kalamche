export enum EmailTemplate {
  VERIFY_EMAIL = "verify-email",
}

// maps each template to the exact context shape it expects
export interface EmailTemplateContextMap {
  [EmailTemplate.VERIFY_EMAIL]: {
    code: number;
  };
}

export type SendMailParams<T extends EmailTemplate> = {
  to: string;
  subject: string;
  template: T;
  context: EmailTemplateContextMap[T];
};
