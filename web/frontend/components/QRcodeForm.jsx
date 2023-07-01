import { ContextualSaveBar, ResourcePicker } from "@shopify/app-bridge-react"
import { Form, FormLayout, Layout, LegacyCard, Stack, TextField } from "@shopify/polaris"
import { useCallback, useState } from "react"


export const QRcodeForm = ()=>{

    const [showResourcePicker, setShowResourcePicker] = useState(false);
    const [selectedProduct, setSelectedProduct] =useState(false)

    const toggleResourcePicker= useCallback(()=> setShowResourcePicker(!showResourcePicker),[showResourcePicker]);

    const handleProductChange = useCallback(({selection})=> {
        console.log(selection);
        setSelectedProduct({
            title:selection[0].title,
            image:selection[0].images,
            handle:selection[0].handle
        })
        // setShowResourcePicker(false);
       
    });

    return(
       <Stack vertical>
        <Layout>
            <Layout.Section>
                <Form>
                    <ContextualSaveBar
                    saveAction={{
                        label:"Save",
                        onAction:() => console.log("Save")
                    }}
                    discardAction={{
                        label:"Discard",
                        onAction:() => console.log("Discard")
                    }}
                    />
                    <FormLayout>
                        <LegacyCard sectioned title="Title">
                            <TextField 
                            label="Title"
                            labelHidden
                            helpText="Only store staff can see this.."/>
                        </LegacyCard>
                        <LegacyCard title="Product"
                        actions={[
                            {
                                content: false ?
                                "Change Product" : "Select Product",
                                onAction:toggleResourcePicker
                            }
                        ]}>

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
                            </LegacyCard.Section>
                        </LegacyCard>
                    </FormLayout>
                </Form>
            </Layout.Section>
        </Layout>
       </Stack>
    )
}