import { ContextualSaveBar, ResourcePicker } from "@shopify/app-bridge-react";
import {
  Button,
  ChoiceList,
  EmptyState,
  Form,
  FormLayout,
  Layout,
  LegacyCard,
  Stack,
  TextField,
  TextStyle,
} from "@shopify/polaris";
import { useAuthenticatedFetch } from "../hooks";
import { useCallback, useState } from "react";
import { useForm, useField, notEmptyString } from "@shopify/react-form";


export const QRcodeForm = ({ QRCode: InitialQRCode }) => {
  const [QRCode, setQRCode] = useState(InitialQRCode);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(false);
  const fetch = useAuthenticatedFetch();

  console.log("QRCode",QRCode);

   async function submitProduct(body){
    const parsedBody = body;
    parsedBody.destination = parsedBody.destination;
    const QRCodeId = QRCode?.id;
    console.log("QRCodeId",parsedBody);
    const url ="/api/qrcodes";

    const response = await fetch(url, {
      method:"POST",
      body: JSON.stringify(parsedBody),
      headers: { 
      "Content-Type": "application/json" },
    });

    if(response.ok){

    }

    console.log("response",response);
  }

  const onSubmit = useCallback(
    (body)=>{
    ( 
      submitProduct(body)
    )
  })

  const {
    fields: { title, productId, variantId, handle, destination },
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: {
      title: useField({
        value: QRCode?.title || "",
        validates: [notEmptyString("Please enter a title")],
      }),
      productId: useField({
        value: QRCode?.product?.id || "",
        validates: [notEmptyString("Please select a product")],
      }),
      variantId: useField(QRCode?.variantId || ""),
      handle: useField(QRCode?.handle || ""),
      destination: useField( QRCode?.destination ? [QRCode.destination] : ["product"]),
    },
    onSubmit,
  });

  const toggleResourcePicker = useCallback(
    () => setShowResourcePicker(!showResourcePicker),
    [showResourcePicker]
  );

  const handleProductChange = useCallback(({ selection }) => {
    console.log(selection);
    setSelectedProduct({
      title: selection[0].title,
      image: selection[0].images,
      handle: selection[0].handle,
    });
    productId.onChange(selection[0].id);
    variantId.onChange(selection[0].variants[0].id);
    handle.onChange(selection[0].handle);
    setShowResourcePicker(false);
  });

  const QRCodeURL = QRCode
    ? new URL(`/qrcodes/${QRCode.id}/image`, location.toString()).toString()
    : null;

  const shopData = null;

  const goToDestination = useCallback(() => {
    console.log("shopDatagoto", shopData);
    const Data = {
      shopUrl: shopData?.shop.url,
      productHandle: handle.value || selectedProduct.handle,
    };

    const TargetUrl = true ? ProductView(Data) : null;

    console.log("TargetUrl", TargetUrl);

    window.open(TargetUrl, "_blank", "noreferrer,noopener");
  }, [QRCode, selectedProduct, destination, handle, shopData]);

  return (
    <Stack vertical>
      <Layout>
        <Layout.Section>
          <Form>
            <ContextualSaveBar
              saveAction={{
                label: "Save",
                onAction: submit,
                loading: submitting,
                disabled: submitting,
              }}
              discardAction={{
                label: "Discard",
                onAction: reset,
                loading: submitting,
                disabled: submitting,
              }}
              visible={dirty}
              fullWidth
            />
            <FormLayout>
              <LegacyCard sectioned title="Title">
                <TextField
                  {...title}
                  label="Title"
                  labelHidden
                  helpText="Only store staff can see this.."
                />
              </LegacyCard>
              <LegacyCard
                title="Product"
                actions={[
                  {
                    content: productId.value
                      ? "Change Product"
                      : "Select Product",
                    onAction: toggleResourcePicker,
                  },
                ]}
              >
                <LegacyCard.Section>
                  {showResourcePicker && (
                    <ResourcePicker
                      resourceType="Product"
                      showVariants={false}
                      selectMultiple={false}
                      onCancel={toggleResourcePicker}
                      onSelection={handleProductChange}
                      open
                    />
                  )}
                  {productId.value ? (
                    <Stack>
                      <TextStyle variation="strong">
                        {selectedProduct.title}
                      </TextStyle>
                    </Stack>
                  ) : (
                    <Stack>
                      <Button onClick={toggleResourcePicker}>
                        Select Product
                      </Button>
                    </Stack>
                  )}
                </LegacyCard.Section>
                <LegacyCard.Section title="Scan Link">
                  <ChoiceList
                    choices={[
                      { label: "Product Page", value: "product" },
                      {
                        label: "checkout Page",
                        value: "checkout",
                      },
                    ]}
                    selected={destination.value}
                    onChange={destination.onChange}
                  />
                </LegacyCard.Section>
              </LegacyCard>
            </FormLayout>
          </Form>
        </Layout.Section>
        <Layout.Section secondary>
          <LegacyCard sectioned title="QR Code">
            {true ? (
              <EmptyState
                imageContained={true}
                image="/home/jyotsana-chauhan/qr-app/web/frontend/assets/home-trophy.png"
              >
                <p>Image</p>
              </EmptyState>
            ) : (
              <EmptyState>
                <p>Your QR code will appear here</p>
              </EmptyState>
            )}
            <Stack vertical>
              <Button primary download fullWidth url={QRCodeURL}>
                Download
              </Button>
              <Button fullWidth onClick={goToDestination}>
                Go To Destination
              </Button>
            </Stack>
          </LegacyCard>
        </Layout.Section>
        <Layout.Section></Layout.Section>
      </Layout>
    </Stack>
  );

  function ProductView({ shopUrl, productHandle }) {
    console.log("shopUrl", shopUrl);
    const url = new URL(shopUrl);
    const producturl = `/products/${productHandle}`;

    url.pathname = producturl;

    return url.toString();
  }
};
