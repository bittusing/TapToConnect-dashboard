import BulkGenerator from "../Pages/Qr/BulkGenerator";
import TagManagement from "../Pages/Qr/TagManagement";
import ViewTag from "../Pages/Qr/ViewTag";
import EditTag from "../Pages/Qr/EditTag";
import AllAffiliatePartners from "../Pages/AffiliatePartners/AllAffiliatePartners";
import ViewAffiliatePartner from "../Pages/AffiliatePartners/ViewAffiliatePartner";
import AddEditAffiliatePartner from "../Pages/AffiliatePartners/AddEditAffiliatePartner";
import PartnerAssignedTags from "../Pages/AffiliatePartners/PartnerAssignedTags";
import ManageSale from "../Pages/Sales/ManageSale";
import AddSale from "../Pages/Sales/AddSale";
import ViewSale from "../Pages/Sales/ViewSale";
import EditSale from "../Pages/Sales/EditSale";
import Settings from "../Pages/Settings/Settings";

const navRoutes = [
  {
    path: "qr/tags",
    component: TagManagement,
  },
  {
    path: "qr/tags/:shortCode/view",
    component: ViewTag,
  },
  {
    path: "qr/tags/:shortCode/edit",
    component: EditTag,
  },
  {
    path: "qr/generate",
    component: BulkGenerator,
  },
  {
    path: "affiliate-partners",
    component: AllAffiliatePartners,
  },
  {
    path: "affiliate-partners/add",
    component: AddEditAffiliatePartner,
  },
  {
    path: "affiliate-partners/:id/view",
    component: ViewAffiliatePartner,
  },
  {
    path: "affiliate-partners/:id/edit",
    component: AddEditAffiliatePartner,
  },
  {
    path: "affiliate-partners/:id/tags",
    component: PartnerAssignedTags,
  },
  {
    path: "sales",
    component: ManageSale,
  },
  {
    path: "sales/add",
    component: AddSale,
  },
  {
    path: "sales/:id/view",
    component: ViewSale,
  },
  {
    path: "sales/:id/edit",
    component: EditSale,
  },
  {
    path: "settings",
    component: Settings,
  },
];

export default navRoutes;
