export type MjmlBlockType = 
  | 'header'
  | 'hero'
  | 'text'
  | 'button'
  | 'image'
  | 'two-column'
  | 'three-column'
  | 'rfp-card'
  | 'quote-card'
  | 'divider'
  | 'spacer'
  | 'footer';

export interface MjmlColumnContent {
  id: string;
  title: string;
  text: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  bgColor?: string;
}

export interface MjmlBlock {
  id: string;
  type: MjmlBlockType;
  label: string;
  
  // Section background & padding
  sectionBgColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;

  // Specific content properties
  logoUrl?: string;
  logoWidth?: number;
  logoAlign?: 'left' | 'center' | 'right';
  altText?: string;

  title?: string;
  titleColor?: string;
  titleSize?: number;
  titleAlign?: 'left' | 'center' | 'right';

  subtitle?: string;
  subtitleColor?: string;
  subtitleSize?: number;

  contentHtml?: string;
  textColor?: string;
  fontSize?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';

  imageUrl?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageFullWidth?: boolean;
  imageBorderRadius?: number;

  buttonText?: string;
  buttonUrl?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonRadius?: number;
  buttonAlign?: 'left' | 'center' | 'right';
  buttonPaddingY?: number;
  buttonPaddingX?: number;

  // Columns data
  columns?: MjmlColumnContent[];

  // Healthcare RFP specific fields
  hospitalName?: string;
  projectStage?: string;
  bedCapacity?: string;
  budgetEst?: string;
  location?: string;
  submissionDeadline?: string;

  // Vendor Quotation specific fields
  vendorName?: string;
  quoteAmount?: string;
  deliveryTime?: string;
  warrantyPeriod?: string;
  quotationRef?: string;

  // Divider / Spacer
  dividerColor?: string;
  dividerWidth?: number;
  dividerStyle?: 'solid' | 'dashed' | 'dotted';
  spacerHeight?: number;

  // Footer fields
  companyName?: string;
  address?: string;
  unsubscribeUrl?: string;
  copyrightText?: string;
  supportEmail?: string;
  includeSocial?: boolean;
}

export interface MjmlTemplateSettings {
  templateName: string;
  subject: string;
  previewText: string;
  backgroundColor: string;
  containerWidth: number; // e.g. 600
  fontFamily: string;
  defaultTextColor: string;
  primaryBrandColor: string;
}

export interface MjmlTemplate {
  id: string;
  settings: MjmlTemplateSettings;
  blocks: MjmlBlock[];
  updatedAt: string;
}
