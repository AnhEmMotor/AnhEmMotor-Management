import type { GuideSection } from "./guideData";
import { dashboardSection } from "./sections/dashboard";
import { bannerSection } from "./sections/banner";
import { articleSection } from "./sections/article";
import { commentSection } from "./sections/comment";
import { contactSection } from "./sections/contact";
import { customerSection } from "./sections/customer";
import { bookingSection } from "./sections/booking";

export const guideSections: GuideSection[] = [
  dashboardSection,
  bannerSection,
  articleSection,
  commentSection,
  contactSection,
  customerSection,
  bookingSection,
];
