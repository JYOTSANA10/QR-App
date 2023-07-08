import { ContextualSaveBar, ResourcePicker,  useNavigate } from "@shopify/app-bridge-react";
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
  Card,
  Thumbnail
} from "@shopify/polaris";
import { ImageMajor, AlertMinor } from "@shopify/polaris-icons";

import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import { useCallback, useState } from "react";
import { useForm, useField, notEmptyString } from "@shopify/react-form";

export const QRcodeForm = ({ QRCode: InitialQRCode }) => {
  const [QRCode, setQRCode] = useState(InitialQRCode);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(QRCode?.product);
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [isDeleting, setIsDeleting] = useState(false);
  const deleteQRCode = useCallback(async () => {
    reset();
    /* The isDeleting state disables the download button and the delete QR code button to show the user that an action is in progress */
    setIsDeleting(true);
    const response = await fetch(`/api/qrcodes/${QRCode.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
  
    if (response.ok) {
      navigate(`/`);
    }
  }, [QRCode]);

  async function submitProduct(body) {
    const parsedBody = body;
    parsedBody.destination = parsedBody.destination;
    const QRCodeId = QRCode?.id;
    console.log("QRCodeId", parsedBody);

    const url = QRCodeId ? `/api/qrcodes/${QRCodeId}` : "/api/qrcodes";
    const method = QRCodeId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      body: JSON.stringify(parsedBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      makeClean();
      const QRCode = await response.json();

      if (!QRCodeId) {
        navigate(`/qrcodes/${QRCode.id}`);
      } else {
        setQRCode(QRCode);
      }
    }

    console.log("response", response);
  }

  const onSubmit = useCallback(
    (body) => {
      submitProduct(body);
      return { status: "success" };
    },
    [QRCode, setQRCode]
  );

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
      variantId: useField(QRCode?.variantId || null),
      handle: useField(QRCode?.handle || ""),
      destination: useField(
        QRCode?.destination ? [QRCode.destination] : ["product"]
      ),
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

    const {
      data: shopData,
      isLoading: isLoadingShopData,
      isError: shopDataError,
    } = useAppQuery({ url: "/api/shop-data" });

  const goToDestination = useCallback(() => {
    console.log("shopDatagoto", variantId);
    if (!selectedProduct) return;
    const Data = {
      shopUrl: shopData?.shop.url,
      productHandle: handle.value || selectedProduct.handle,
      variantId: variantId.value ,
    };

    const TargetUrl = destination.value[0] === "product"
      ? ProductView(Data)
      : productCheckoutURL(Data);

    console.log("TargetUrl", TargetUrl);

    window.open(TargetUrl, "_blank", "noreferrer,noopener");
  }, [QRCode, selectedProduct, destination, handle, shopData , variantId]);


  const imageSrc = selectedProduct?.images?.edges?.[0]?.node?.url;
  const originalImageSrc = selectedProduct?.images?.[0]?.originalSrc;
  const altText =
    selectedProduct?.images?.[0]?.altText || selectedProduct?.title;

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
                <Card.Section>
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
                    <Stack alignment="center">
                      {imageSrc || originalImageSrc ? (
                        <Thumbnail
                          source={imageSrc || originalImageSrc}
                          alt={altText}
                        />
                      ) : (
                        <Thumbnail
                          source={ImageMajor}
                          color="base"
                          size="small"
                        />
                      )}
                      <TextStyle variation="strong">
                        {selectedProduct.title}
                      </TextStyle>
                    </Stack>
                  ) : (
                    <Stack vertical spacing="extraTight">
                      <Button onClick={toggleResourcePicker}>
                        Select product
                      </Button>
                      {productId.error && (
                        <Stack spacing="tight">
                          <Icon source={AlertMinor} color="critical" />
                          <TextStyle variation="negative">
                            {productId.error}
                          </TextStyle>
                        </Stack>
                      )}
                    </Stack>
                  )}
                </Card.Section>
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
          <Card sectioned title="QR code">
            {QRCode ? (
              <EmptyState imageContained={true} image={QRCodeURL} />
            ) : (
              <EmptyState>
                <p>Your QR code will appear here after you save.</p>
              </EmptyState>
            )}
            <Stack vertical>
              <Button
                fullWidth
                primary
                download
                url={QRCodeURL}
                disabled={!QRCode || isDeleting}
              >
                Download
              </Button>
              <Button
                fullWidth
                onClick={goToDestination }
                disabled={!selectedProduct || isLoadingShopData}
              >
                Go to destination
              </Button>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          {QRCode?.id && (
            <Button
              outline
              destructive
              onClick={deleteQRCode}
              loading={isDeleting}
            >
              Delete QR code
            </Button>
          )}
        </Layout.Section>
      </Layout>
    </Stack>
  );
};

function ProductView({ shopUrl, productHandle }) {
  console.log("shopUrl", shopUrl);
  const url = new URL(shopUrl);
  const producturl = `/products/${productHandle}`;

  url.pathname = producturl;

  return url.toString();
}

function productCheckoutURL({ shopUrl, variantId, quantity = 1 }) {
  const url = new URL(shopUrl);
  const id = variantId.replace(
    /gid:\/\/shopify\/ProductVariant\/([0-9]+)/,
    "$1"
  );

  url.pathname = `/cart/${id}:${quantity}`;

  /* Builds a URL to a checkout that contains the selected product with a discount code applied */

  return url.toString();
}
