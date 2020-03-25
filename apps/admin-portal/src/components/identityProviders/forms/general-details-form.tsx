/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Field, Forms, FormValue, Validation } from "@wso2is/forms";
import React, { FunctionComponent, useState } from "react";
import { Button, Grid } from "semantic-ui-react";
import { IdentityProviderInterface} from "../../../models";
import { FormValidation } from "@wso2is/validation";

/**
 * Proptypes for the applications general details form component.
 */
interface GeneralDetailsFormPopsInterface {
    /**
     * Currently editing application id.
     */
    idpId?: string;
    /**
     * Application description.
     */
    description?: string;
    /**
     * Is the application discoverable.
     */
    isEnabled?: boolean;
    /**
     * Application logo URL.
     */
    imageUrl?: string;
    /**
     * Name of the application.
     */
    name: string;
    /**
     * On submit callback.
     */
    onSubmit: (values: any) => void;
    /**
     * Externally trigger form submission.
     */
    triggerSubmit?: boolean;
    /**
     * Enable submission button.
     */
    enableSubmitButton?: boolean;
}

/**
 * Form to edit general details of the identity provider.
 *
 * @param props GeneralDetailsFormPopsInterface.
 */
export const GeneralDetailsForm: FunctionComponent<GeneralDetailsFormPopsInterface> = (props): JSX.Element => {

    const {
        idpId,
        name,
        description,
        isEnabled,
        imageUrl,
        onSubmit,
        triggerSubmit,
        enableSubmitButton
    } = props;

    const [ isEnable, setIsEnable ] = useState<boolean>(isEnabled);

    /**
     * Prepare form values for submitting.
     *
     * @param values - Form values.
     * @return {any} Sanitized form values.
     */
    const updateConfigurations = (values: Map<string, FormValue>): IdentityProviderInterface => {
        return  {
            description: values.get("description").toString(),
            id: idpId,
            image: values.get("image").toString(),
            name: values.get("name").toString(),
            isEnabled: !!values.get("isEnable").includes("isEnable"),
        };
    };

    return (
        <Forms
            onSubmit={ (values): void => {
                onSubmit(updateConfigurations(values))
            } }
            submitState={ triggerSubmit }
        >
            <Grid>
                <Grid.Row columns={ 1 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Field
                            name="name"
                            label="Identity Provider Name"
                            required={ true }
                            requiredErrorMessage="Identity Provider name is required"
                            placeholder={ name }
                            type="text"
                            value={ name }
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={ 1 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Field
                            name="description"
                            label="Description"
                            required={ false }
                            requiredErrorMessage=""
                            placeholder="Enter a description for the identity provider"
                            type="textarea"
                            value={ description }
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={ 1 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Field
                            name="image"
                            label="Identity Provider Image"
                            required={ false }
                            requiredErrorMessage=""
                            placeholder="Enter a image url for the identity provider"
                            type="text"
                            validation={ (value: string, validation: Validation) => {
                                if (!FormValidation.url(value)) {
                                    validation.isValid = false;
                                    validation.errorMessages.push("This is not a valid URL");
                                }
                            } }
                            value={ imageUrl }
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={ 1 }>
                    <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                        <Field
                            name="isEnable"
                            required={ false }
                            requiredErrorMessage=""
                            type="checkbox"
                            children={ [
                                {
                                    label: "Enable",
                                    value: "isEnable"
                                }
                            ] }
                            value={ isEnable ? [ "isEnable" ] : [] }
                        />
                    </Grid.Column>
                </Grid.Row>
                {enableSubmitButton ?
                    (
                        <Grid.Row columns={ 1 }>
                            <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 8 }>
                                <Button primary type="submit" size="small" className="form-button">
                                    Update
                                </Button>
                            </Grid.Column>
                        </Grid.Row>
                    ) : null}
            </Grid>
        </Forms>
    );
};

GeneralDetailsForm.defaultProps = {
    triggerSubmit: false,
    enableSubmitButton: true
};
