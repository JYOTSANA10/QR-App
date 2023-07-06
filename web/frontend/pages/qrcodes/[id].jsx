import { Page , Card ,Layout ,SkeletonBodyText} from "@shopify/polaris";
import { QRcodeForm } from "../../components";
import { TitleBar ,Loading} from "@shopify/app-bridge-react";
import { useAppQuery } from "../../hooks";
import { useParams } from "react-router-dom";

export default function ManageCode(){

    const breadcrumbs= [{content:"QR Codes", url :"/"}]

    const { id } = useParams();

    
    const {
      data: QRCode,
      isLoading,
      isRefetching,
    } = useAppQuery({
      url: `/api/qrcodes/${id}`,
      reactQueryOptions: {
        /* Disable refetching because the QRCodeForm component ignores changes to its props */
        refetchOnReconnect: false,
      },
    });
    // const isLoading = false;
    // const isRefetching = false;
    // const QRCode = {
    //   createdAt: "2022-06-13",
    //   destination: "checkout",
    //   title: "My first QR code",
    //   product: {}
    // };

    if( isLoading || isRefetching){
        return(
            <Page>
        <TitleBar
          title="Edit QR code"
          breadcrumbs={breadcrumbs}
          primaryAction={null}
        />
        <Loading />
        <Layout>
          <Layout.Section>
            <Card sectioned title="Title">
              <SkeletonBodyText />
            </Card>
            <Card title="Product">
              <Card.Section>
                <SkeletonBodyText lines={1} />
              </Card.Section>
              <Card.Section>
                <SkeletonBodyText lines={3} />
              </Card.Section>
            </Card>
            <Card sectioned title="Discount">
              <SkeletonBodyText lines={2} />
            </Card>
          </Layout.Section>
          <Layout.Section secondary>
            <Card sectioned title="QR code" />
          </Layout.Section>
        </Layout>
      </Page>
        )

    }



    return (
        <Page>
            <TitleBar
             title="Create QR Code"
             primaryAction={null}
             breadcrumbs={breadcrumbs}
            />
            <QRcodeForm QRCode={QRCode}/>
        </Page>
    )
}