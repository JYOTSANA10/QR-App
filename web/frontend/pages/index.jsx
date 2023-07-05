import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Text,
  LegacyCard,
  SkeletonBodyText,
  EmptySearchResult,
  EmptyState,
} from "@shopify/polaris";
import { TitleBar , Loading , useNavigate} from "@shopify/app-bridge-react";
import { QRcodeForm } from "../components/QRcodeForm";
import {QRCodeIndex} from "../components/QRCodeIndex";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";



export default function HomePage() {


  // const data = useAppQuery({url: "/api/products/count"});
  // console.log("data",data);

  const isLoading =false;
  const isRefetching = false;
  const QRcodes = [
    {
      createdAt: "2022-06-13",
      destination: "checkout",
      title: "My first QR code",
      id: 1,
      discountCode: "SUMMERDISCOUNT",
      product: {
        title: "Faded t-shirt",
      }
    },
    {
      createdAt: "2022-06-13",
      destination: "product",
      title: "My second QR code",
      id: 2,
      discountCode: "WINTERDISCOUNT",
      product: {
        title: "Cozy parka",
      }
    },
    {
      createdAt: "2022-06-13",
      destination: "product",
      title: "QR code for deleted product",
      id: 3,
      product: {
        title: "Deleted product",
      }
    },
  ];
  

  const navigate=useNavigate()

  const loadingMarkup= isLoading ? (
    <LegacyCard sectioned>
      <Loading/>
      <SkeletonBodyText/>
    </LegacyCard>
   ) : null;

   const qrcodesMarkup= QRcodes?.length ?(
      <QRCodeIndex QRcodes={QRcodes} loading={isRefetching}/>
   ):null;

   const EmptyStateMarkup= !isLoading && !QRcodes?.length ? (
    <LegacyCard sectioned>
      <EmptyState heading="Create QR code for Your Product" 
      	action={{
          content: "Create QR code",
          onAction: () => navigate("/qrcodes/new"),
        }}>

      </EmptyState>
    </LegacyCard>
   ) : null;


  return (
    <Page fullWidth>
      <TitleBar title="QR Codes"
       primaryAction={{
        content: "Create QR code",
        onAction: () => navigate("/qrcodes/new"),
      }}  />
      <Layout>
        <Layout.Section>
        {loadingMarkup}
        {qrcodesMarkup}
        {EmptyStateMarkup}
        </Layout.Section>
        
      </Layout>
      {/* <QRcodeForm></QRcodeForm> */}
    </Page>
  );
}
