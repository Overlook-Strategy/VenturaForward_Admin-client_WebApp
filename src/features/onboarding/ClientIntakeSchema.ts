import { z } from 'zod';

export const PARTNERSHIP_PACKAGES = {
  INFLUENCING: 'INFLUENCING',
  SHARING: 'SHARING',
  SOCIALIZING: 'SOCIALIZING',
} as const;

export const SOCIAL_SUPPORT_OPTIONS = {
  CONTENT_PRODUCTION: 'CONTENT_PRODUCTION',
  EVENT_GRAPHICS_FLYERS: 'EVENT_GRAPHICS_FLYERS',
  FULL_MEDIA_MANAGEMENT: 'FULL_MEDIA_MANAGEMENT',
  SOCIAL_MEDIA_TRAINING: 'SOCIAL_MEDIA_TRAINING',
} as const;

export const partnershipPackageOptions = [
  {
    description: 'Bi-monthly stories on VF platforms with clear tagging.',
    label: 'Sharing Package',
    value: PARTNERSHIP_PACKAGES.SHARING,
  },
  {
    description: '4 story mentions/month, 2 collab videos/posts, VF engagement, weekly podcast mentions.',
    label: 'Socializing Package - $1000/month',
    value: PARTNERSHIP_PACKAGES.SOCIALIZING,
  },
  {
    description: '8 story mentions/month, 4 collab videos/posts, VF engagement, weekly podcast mentions.',
    label: 'Influencing Package',
    value: PARTNERSHIP_PACKAGES.INFLUENCING,
  },
] as const;

export const socialSupportOptions = [
  {
    label: 'Social Media Content Production',
    value: SOCIAL_SUPPORT_OPTIONS.CONTENT_PRODUCTION,
  },
  {
    label: 'Event Graphics and Flyers',
    value: SOCIAL_SUPPORT_OPTIONS.EVENT_GRAPHICS_FLYERS,
  },
  {
    label: 'Social Media Training',
    value: SOCIAL_SUPPORT_OPTIONS.SOCIAL_MEDIA_TRAINING,
  },
  {
    label: 'Full Media Management',
    value: SOCIAL_SUPPORT_OPTIONS.FULL_MEDIA_MANAGEMENT,
  },
] as const;

export const clientIntakeSchema = z.object({
  additionalSupport: z.array(z.enum([
    SOCIAL_SUPPORT_OPTIONS.CONTENT_PRODUCTION,
    SOCIAL_SUPPORT_OPTIONS.EVENT_GRAPHICS_FLYERS,
    SOCIAL_SUPPORT_OPTIONS.SOCIAL_MEDIA_TRAINING,
    SOCIAL_SUPPORT_OPTIONS.FULL_MEDIA_MANAGEMENT,
  ])).default([]),
  businessName: z.string().trim().min(2, 'Business name is required.'),
  goals: z.string().trim().min(20, 'Please provide at least 20 characters for goals.'),
  instagramHandle: z.string().trim().min(1, 'Instagram handle is required.'),
  mainPointOfContact: z.string().trim().min(2, 'Main point of contact is required.'),
  partnershipPackage: z.enum([
    PARTNERSHIP_PACKAGES.SHARING,
    PARTNERSHIP_PACKAGES.SOCIALIZING,
    PARTNERSHIP_PACKAGES.INFLUENCING,
  ]),
});

export type ClientIntakeInput = z.infer<typeof clientIntakeSchema>;
