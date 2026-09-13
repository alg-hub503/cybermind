export interface BrandPreviewProps {
  schoolName: string;
  logoUrl: string;
  coverUrl: string;
  primaryColor: string;
  secondaryColor: string;
  logoValid: boolean;
  coverValid: boolean;
  onLogoError: () => void;
  onCoverError: () => void;
}
