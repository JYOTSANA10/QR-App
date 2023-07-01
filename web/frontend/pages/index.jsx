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



export default function HomePage() {

  const isLoading =true;
  const isRefetching = false;
  const QRcodes=[];

  const navigate=useNavigate()

  const loadingMarkup= isLoading ? (
    <LegacyCard sectioned>
      <Loading/>
      <SkeletonBodyText/>
    </LegacyCard>
   ) : null;


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
    <Page narrowWidth>
      {/* <TitleBar title="QR Codes"
       primaryAction={{
        content: "Create QR code",
        onAction: () => navigate("/qrcodes/new"),
      }}  />
      <Layout>
        <Layout.Section>
        {loadingMarkup}
        {EmptyStateMarkup}
        </Layout.Section>
        
      </Layout> */}
      <QRcodeForm></QRcodeForm>
    </Page>
  );
}
