import featuresConfig from '../config/features.json';

export type FeatureKey =
  | 'architecture'
  | 'whatsapp_flow'
  | 'mjml_studio'
  | 'procurement_hub'
  | 'toolkit'
  | 'comparison_matrix'
  | 'directory_search'
  | 'pamphlet_qr'
  | 'coupons';

/**
 * Checks whether a platform feature is enabled according to src/config/features.json
 */
export const isFeatureEnabled = (key: FeatureKey): boolean => {
  if (!featuresConfig || !featuresConfig.features) return true;
  return (featuresConfig.features as Record<string, boolean>)[key] ?? true;
};

/**
 * Returns all active feature flags
 */
export const getFeatureFlags = () => {
  return featuresConfig.features;
};
